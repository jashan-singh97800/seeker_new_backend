import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Application } from '../database/models/application.model';
import { Job } from '../database/models/job.model';
import { User } from '../database/models/user.model';
import { UserProfile } from '../database/models/user-profile.model';
import { AnalyticsService } from '../analytics/analytics.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApplicationsService {
    constructor(
        @InjectModel(Application)
        private applicationModel: typeof Application,
        private analyticsService: AnalyticsService,
        private notificationsService: NotificationsService,
    ) { }

    async findAll(filters: any): Promise<Application[]> {
        return this.applicationModel.findAll({
            where: filters,
            include: [Job, User],
        });
    }

    async findOne(id: string): Promise<Application | null> {
        return this.applicationModel.findByPk(id, {
            include: [Job, User],
        });
    }

    async create(applicationData: any): Promise<Application> {
        // Check if the job exists and get the poster information
        const job = await Job.findByPk(applicationData.job_id);

        if (!job) {
            throw new NotFoundException('Job not found.');
        }

        // Prevent employers from applying to their own jobs
        if (job.posted_by === applicationData.user_id) {
            throw new ConflictException('You cannot apply to your own job posting.');
        }

        // Check for existing application
        const existing = await this.applicationModel.findOne({
            where: {
                user_id: applicationData.user_id,
                job_id: applicationData.job_id,
            },
        });

        if (existing) {
            throw new ConflictException('You have already applied for this job.');
        }

        const application = await this.applicationModel.create(applicationData);
        const jobWithCompany = await application.$get('job', { include: ['company'] }) as Job;

        // Increment the applications count for the job
        if (job) {
            await job.increment('applications_count');
        }

        await this.analyticsService.logEvent(
            application.user_id,
            'application',
            application.id,
            'apply_job',
            { job_id: application.job_id },
        );

        // Notify recruiter or simulation
        if (jobWithCompany && jobWithCompany.company) {
            // In a real app we'd get the company's recruiter email
            await this.notificationsService.sendEmail(
                'recruiter@company.com',
                `New application for ${jobWithCompany.title}`,
                'new-application',
                { jobTitle: jobWithCompany.title, applicantId: application.user_id }
            );
        }

        return application;
    }

    async update(id: string, applicationData: Partial<Application>): Promise<[number, Application[]]> {
        return this.applicationModel.update(applicationData, {
            where: { id },
            returning: true,
        });
    }

    async updateApplicationStatus(id: string, status: string, userId: string): Promise<Application> {
        const application = await this.applicationModel.findByPk(id, {
            include: [Job, User],
        });

        if (!application) {
            throw new NotFoundException('Application not found.');
        }

        // Get the job to check authorization
        const job = await Job.findByPk(application.job_id);

        if (!job) {
            throw new NotFoundException('Job not found.');
        }

        // Check if the user is the job poster
        if (job.posted_by !== userId) {
            throw new ConflictException('You are not authorized to update this application.');
        }

        // Update the application status
        application.status = status;
        await application.save();

        return application;
    }

    async findByUser(userId: string): Promise<Application[]> {
        return this.applicationModel.findAll({
            where: { user_id: userId },
            include: [Job],
        });
    }

    async findByJob(jobId: string): Promise<Application[]> {
        return this.applicationModel.findAll({
            where: { job_id: jobId },
            include: [
                {
                    model: User,
                    as: 'user',
                    include: [{
                        model: UserProfile,
                        as: 'profile',
                    }],
                },
                {
                    model: Job,
                    as: 'job',
                },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
}
