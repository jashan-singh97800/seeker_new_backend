import { Controller, Get, Post, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { join } from 'path';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: any) {
        return this.usersService.getProfile(req.user.id);
    }

    @Post('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Req() req: any, @Body() profileData: any) {
        return this.usersService.updateProfile(req.user.id, profileData);
    }

    @Post('upload-resume')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('resume'))
    async uploadResume(@Req() req: any, @UploadedFile() file: any) {
        try {
            console.log('Upload resume called, user:', req.user?.id);

            if (!file) {
                throw new NotFoundException('No file uploaded');
            }

            const result = await this.usersService.uploadResume(req.user.id, file);

            return {
                status: 'success',
                message: 'Resume uploaded successfully',
                resume_url: result.url,
                s3_url: result.s3Url,
                resume_key: result.key,
                data: result,
            };
        } catch (error) {
            console.error('Error uploading resume:', error);
            throw error;
        }
    }

    @Get(':id/resume')
    async downloadResume(@Param('id') id: string, @Res() res: Response) {
        try {
            const profile = await this.usersService.getProfile(id);

            if (!profile || !profile.resume_url) {
                throw new NotFoundException('Resume not found');
            }

            // Prefer streaming from S3 if key is available
            let key = profile.resume_key;

            // If no key but we have a URL, try to extract key if it's from our S3 bucket
            if (!key && profile.resume_url && profile.resume_url.includes('amazonaws.com')) {
                try {
                    const url = new URL(profile.resume_url);
                    // Extract key from pathname (remove leading slash)
                    key = url.pathname.substring(1);
                    // Handle encoded characters if any
                    key = decodeURIComponent(key);
                } catch (e) {
                    console.error('Failed to extract key from URL:', e);
                }
            }

            if (key) {
                const fileStream = await this.usersService.getResumeStream(key);
                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `inline; filename="resume-${id}.pdf"`,
                });
                fileStream.pipe(res);
                return;
            }

            // Fallback to redirect if no key could be resolved
            if (profile.resume_url && profile.resume_url.startsWith('http')) {
                return res.redirect(profile.resume_url);
            }

            // Fallback for local files
            const filePath = join(process.cwd(), profile.resume_url);
            res.download(filePath);
        } catch (error) {
            console.error('Error downloading resume:', error);
            if (error instanceof NotFoundException) throw error;
            throw new NotFoundException('Resume not accessible');
        }
    }
}
