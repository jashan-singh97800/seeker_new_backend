import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        try {
            const user = await this.usersService.findOneByEmail(email);
            if (user && await bcrypt.compare(pass, user.password_hash)) {
                const { password_hash, ...result } = user.get({ plain: true });
                return result;
            }
            return null;
        } catch (error) {
            console.error('Error in validateUser:', error);
            throw new InternalServerErrorException('Error validating user');
        }
    }

    async login(user: any) {
        try {
            const payload = { email: user.email, sub: user.id, role: user.role };
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            };
        } catch (error) {
            console.error('Error in login:', error);
            throw new InternalServerErrorException('Error generating authentication token');
        }
    }

    async register(userData: RegisterDto) {
        try {
            const existingUser = await this.usersService.findOneByEmail(userData.email);
            if (existingUser) {
                throw new ConflictException('User already exists');
            }
            const user = await this.usersService.create(userData);
            return this.login(user);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            console.error('Error in register:', error);
            throw new InternalServerErrorException('Error registering new user');
        }
    }

    async validateGoogleUser(googleUser: any) {
        let user = await this.usersService.findOneByEmail(googleUser.email);

        if (!user) {
            // Register new user with default 'job_seeker' role if not exists
            user = await this.usersService.create({
                email: googleUser.email,
                password_hash: '', // No password for Google auth
                role: 'job_seeker', // Default role, user can update later or we can ask in UI first
            });
            await this.usersService.updateProfile(user.id, {
                full_name: `${googleUser.firstName} ${googleUser.lastName}`,
                avatar_url: googleUser.picture,
            });
        }

        const payload = { email: user.email, sub: user.id, role: (user as any).role };
        return {
            user: {
                id: user.id,
                email: user.email,
                role: (user as any).role,
            },
            access_token: this.jwtService.sign(payload),
        };
    }
}
