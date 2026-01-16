import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from '../database/models/job.model';
import { CreateJobDto } from './dto/create-job.dto';
import { Company } from '../database/models/company.model';
import { SearchService } from '../search/search.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class JobsService {
    constructor(
        @InjectModel(Job)
        private jobModel: typeof Job,
        private searchService: SearchService,
        private analyticsService: AnalyticsService,
    ) { }

    async create(createJobDto: CreateJobDto): Promise<Job> {
        const job = await this.jobModel.create(createJobDto as any);
        const jobWithCompany = await this.jobModel.findByPk(job.id, { include: [Company] });

        // Index job and log event asynchronously (non-blocking)
        if (jobWithCompany) {
            this.searchService.indexJob(jobWithCompany).catch(error => {
                console.error('Failed to index job:', error);
            });
            this.analyticsService.logEvent(
                createJobDto.posted_by || null,
                'job',
                job.id,
                'create_job',
                { title: job.title }
            ).catch(error => {
                console.error('Failed to log event:', error);
            });
        }

        return job;
    }

    async findAll(filters: any): Promise<Job[]> {
        if (filters.search) {
            try {
                const searchResults = await this.searchService.searchJobs(filters.search);
                if (searchResults && searchResults.length > 0) {
                    return searchResults as any;
                }
            } catch (error) {
                console.error('Search service failed, falling back to database:', error.message);
            }
        }

        const where: any = { status: 'active' }; // Only show active jobs in public search
        if (filters.search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${filters.search}%` } },
                { description: { [Op.like]: `%${filters.search}%` } },
            ];
        }

        return this.jobModel.findAll({
            where,
            include: [Company],
        });
    }

    async findByEmployer(userId: string): Promise<Job[]> {
        return this.jobModel.findAll({
            where: { posted_by: userId },
            include: [Company],
            order: [['createdAt', 'DESC']]
        });
    }

    async findOne(id: string): Promise<Job> {
        const job = await this.jobModel.findByPk(id, {
            include: [Company],
        });
        if (!job) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }
        return job;
    }

    async update(id: string, updateJobDto: any): Promise<Job> {
        const job = await this.findOne(id);
        await job.update(updateJobDto);
        const updatedJob = await this.jobModel.findByPk(id, { include: [Company] });
        if (updatedJob) {
            await this.searchService.updateJob(updatedJob);
        }
        return updatedJob as Job;
    }

    async remove(id: string): Promise<void> {
        const job = await this.findOne(id);
        await job.destroy();
        await this.searchService.removeJob(id);
    }

    async incrementViews(id: string): Promise<void> {
        const job = await this.jobModel.findByPk(id);
        if (job) {
            await job.increment('views_count');
        }
    }

    async updateJobStatus(id: string, status: string, userId: string): Promise<Job> {
        const job = await this.findOne(id);

        // Check if the user is the job poster
        if (job.posted_by !== userId) {
            throw new NotFoundException('You are not authorized to update this job.');
        }

        // Validate status
        const validStatuses = ['draft', 'active', 'paused', 'closed', 'expired'];
        if (!validStatuses.includes(status)) {
            throw new NotFoundException('Invalid status value.');
        }

        await job.update({ status });
        const updatedJob = await this.jobModel.findByPk(id, { include: [Company] });

        // Update search index
        if (updatedJob) {
            await this.searchService.updateJob(updatedJob);
        }

        return updatedJob as Job;
    }

    async getEmployerStats(userId: string): Promise<any> {
        const jobs = await this.jobModel.findAll({
            where: { posted_by: userId },
            attributes: ['id', 'status', 'views_count', 'applications_count']
        });

        const activeJobs = jobs.filter(job => job.status === 'active').length;
        const totalViews = jobs.reduce((sum, job) => sum + (job.views_count || 0), 0);
        const totalApplicants = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);

        return {
            activeJobs,
            totalViews,
            totalApplicants,
            totalJobs: jobs.length
        };
    }
}
