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
        const resumeUrl = await this.usersService.getUserResume(id);

        if (!resumeUrl) {
            throw new NotFoundException('Resume not found');
        }

        // If it's a full S3 URL, redirect to it
        if (resumeUrl.startsWith('http')) {
            return res.redirect(resumeUrl);
        }

        // Fallback for local files if any exist
        const filePath = join(process.cwd(), resumeUrl);
        res.download(filePath);
    }
}
