import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Get('me')
    async findMyApplications(@Req() req: any) {
        return this.applicationsService.findByUser(req.user.id);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.applicationsService.findOne(id);
    }

    @Get('job/:jobId')
    async findByJob(@Param('jobId') jobId: string) {
        return this.applicationsService.findByJob(jobId);
    }

    @Post()
    async create(@Body() applicationData: any, @Req() req: any) {
        return this.applicationsService.create({
            ...applicationData,
            user_id: req.user.id
        });
    }

    @Post(':id/accept')
    async acceptApplication(@Param('id') id: string, @Req() req: any) {
        return this.applicationsService.updateApplicationStatus(id, 'accepted', req.user.id);
    }

    @Post(':id/reject')
    async rejectApplication(@Param('id') id: string, @Req() req: any) {
        return this.applicationsService.updateApplicationStatus(id, 'rejected', req.user.id);
    }
}
