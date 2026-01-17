import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';
import { UserProfile } from '../database/models/user-profile.model';
import * as bcrypt from 'bcrypt';
import { S3UploadService } from '../common/services/s3-upload.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        @InjectModel(UserProfile)
        private userProfileModel: typeof UserProfile,
        private s3UploadService: S3UploadService,
    ) { }

    async findOneByEmail(email: string): Promise<User | null> {
        try {
            return await this.userModel.findOne({ where: { email } });
        } catch (error) {
            console.error('Error in findOneByEmail:', error);
            throw new InternalServerErrorException('Error finding user by email');
        }
    }

    async findOneById(id: string): Promise<User | null> {
        try {
            return await this.userModel.findByPk(id);
        } catch (error) {
            console.error('Error in findOneById:', error);
            throw new InternalServerErrorException('Error finding user by ID');
        }
    }

    async create(userData: any): Promise<User> {
        try {
            const salt = await bcrypt.genSalt();
            const password = userData.password || userData.password_hash || '';
            const hash = await bcrypt.hash(password, salt);

            const { password: _, ...rest } = userData;
            return await this.userModel.create({
                ...rest,
                password_hash: hash,
            });
        } catch (error) {
            console.error('Error in create user:', error);
            throw new InternalServerErrorException('Error creating user');
        }
    }

    async getProfile(userId: string): Promise<UserProfile> {
        try {
            let profile = await this.userProfileModel.findOne({ where: { user_id: userId } });

            // Create profile if it doesn't exist
            if (!profile) {
                profile = await this.userProfileModel.create({ user_id: userId });
            }

            return profile;
        } catch (error) {
            console.error('Error in getProfile:', error);
            throw new InternalServerErrorException('Error fetching user profile');
        }
    }

    async updateProfile(userId: string, profileData: any): Promise<UserProfile> {
        try {
            let profile = await this.userProfileModel.findOne({ where: { user_id: userId } });

            if (!profile) {
                return await this.userProfileModel.create({ user_id: userId, ...profileData });
            }

            await profile.update(profileData);
            return profile;
        } catch (error) {
            console.error('Error in updateProfile:', error);
            throw new InternalServerErrorException('Error updating user profile');
        }
    }

    async uploadResume(userId: string, file: any): Promise<{ url: string; s3Url: string; key: string }> {
        console.log('UsersService.uploadResume called for user:', userId);

        // Validate user exists
        const user = await this.userModel.findByPk(userId, {
            include: [{ model: UserProfile, as: 'profile' }],
        });

        if (!user) {
            console.error('User not found during resume upload:', userId);
            throw new NotFoundException('User not found');
        }

        console.log('Found user and profile:', user.id);

        // Validate resume file (PDF only)
        try {
            this.s3UploadService.validateResumeFile(file);
        } catch (error) {
            console.error('Resume validation failed:', error.message);
            throw error;
        }

        const profile = (user as any).profile;

        // Delete old resume from S3 if it exists
        if (profile?.resume_key) {
            console.log('Found existing resume key, attempting deletion:', profile.resume_key);
            try {
                await this.s3UploadService.deleteFile(profile.resume_key);
            } catch (error) {
                console.error('Failed to delete old resume:', error);
            }
        }

        // Upload new resume to S3
        console.log('Proceeding to S3 upload...');
        const result = await this.s3UploadService.uploadFile(file, {
            folder: `resumes/${userId}`,
            acl: 'public-read',
        });

        console.log('S3 upload result:', result);

        // Update or create profile with new URL and key
        try {
            if (profile) {
                console.log('Updating existing profile...');
                await profile.update({
                    resume_url: result.s3Url,
                    resume_key: result.key,
                });
            } else {
                console.log('Creating new profile for user...');
                await this.userProfileModel.create({
                    user_id: userId,
                    resume_url: result.s3Url,
                    resume_key: result.key,
                });
            }
            console.log('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile in database:', error);
            throw error;
        }

        return result;
    }

    async getUserResume(userId: string): Promise<string | null> {
        const profile = await this.userProfileModel.findOne({ where: { user_id: userId } });
        return profile?.resume_url || null;
    }

    async getResumeStream(key: string): Promise<any> {
        return this.s3UploadService.getFileStream(key);
    }
}
