import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Req, Patch } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { JwtService } from '@nestjs/jwt';

@Controller('jobs')
export class JobsController {
    constructor(
        private readonly jobsService: JobsService,
        private readonly jwtService: JwtService
    ) { }

    @Get()
    findAll(@Query() query: any) {
        return this.jobsService.findAll(query);
    }

    @Get('employer/stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('employer', 'admin')
    async getMyStats(@Req() req: any) {
        return this.jobsService.getEmployerStats(req.user.id);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: any) {
        const job = await this.jobsService.findOne(id);

        let shouldIncrement = true;

        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = this.jwtService.decode(token) as any;

                // If user is the owner, do not increment view count
                if (decoded && decoded.sub === job.posted_by) {
                    shouldIncrement = false;
                }
            } catch (error) {
                // Ignore token errors, treat as guest
            }
        }

        if (shouldIncrement) {
            await this.jobsService.incrementViews(id);
        }

        return job;
    }

    @Get('employer/me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('employer', 'admin')
    async findMyJobs(@Req() req: any) {
        return this.jobsService.findByEmployer(req.user.id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('employer', 'admin')
    async create(@Body() jobData: any, @Req() req: any) {
        try {
            return await this.jobsService.create({
                ...jobData,
                posted_by: req.user.id
            });
        } catch (error) {
            console.error('Create Job Error:', error);
            throw error;
        }
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('employer', 'admin')
    update(@Param('id') id: string, @Body() jobData: any) {
        return this.jobsService.update(id, jobData);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('employer', 'admin')
    async updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
        return this.jobsService.updateJobStatus(id, body.status, req.user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('employer', 'admin')
    remove(@Param('id') id: string) {
        return this.jobsService.remove(id);
    }
}
