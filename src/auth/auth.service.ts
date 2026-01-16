import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        console.log('Validating user:', email);
        console.log('Found user:', user ? 'Yes' : 'No');
        if (user) {
            console.log('User password_hash:', user.password_hash);
            console.log('Pass provided:', pass ? 'Yes' : 'No');
        }
        if (user && await bcrypt.compare(pass, user.password_hash)) {
            const { password_hash, ...result } = user.get({ plain: true });
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }

    async register(userData: any) {
        const existingUser = await this.usersService.findOneByEmail(userData.email);
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }
        const user = await this.usersService.create(userData);
        return this.login(user);
    }
}
