import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
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
        @InjectModel(Job)
        private jobModel: typeof Job,
        private analyticsService: AnalyticsService,
        private notificationsService: NotificationsService,
    ) { }

    async findAll(filters: any): Promise<Application[]> {
        try {
            return await this.applicationModel.findAll({
                where: filters,
                include: [Job, User],
            });
        } catch (error) {
            console.error('Error in findAll applications:', error);
            throw new InternalServerErrorException('Error fetching applications');
        }
    }

    async findOne(id: string): Promise<Application> {
        try {
            const application = await this.applicationModel.findByPk(id, {
                include: [Job, User],
            });
            if (!application) {
                throw new NotFoundException(`Application with ID ${id} not found`);
            }
            return application;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Error in findOne application ID ${id}:`, error);
            throw new InternalServerErrorException('Error fetching application details');
        }
    }

    async create(applicationData: any): Promise<Application> {
        try {
            // Check if the job exists and get the poster information
            const job = await this.jobModel.findByPk(applicationData.job_id);

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
            // Use standard Sequelize increment method on the instance
            await job.increment('applications_count');

            // Log event asynchronously
            this.analyticsService.logEvent(
                application.user_id,
                'application',
                application.id,
                'apply_job',
                { job_id: application.job_id },
            ).catch(err => console.error('Failed to log event:', err));

            // Notify recruiter asynchronously
            if (jobWithCompany && jobWithCompany.company) {
                this.notificationsService.sendEmail(
                    'recruiter@company.com',
                    `New application for ${jobWithCompany.title}`,
                    'new-application',
                    { jobTitle: jobWithCompany.title, applicantId: application.user_id }
                ).catch(err => console.error('Failed to send notification:', err));
            }

            return application;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            console.error('Error in create application:', error);
            throw new InternalServerErrorException('Error processing job application');
        }
    }

    async update(id: string, applicationData: Partial<Application>): Promise<Application> {
        try {
            const application = await this.findOne(id);
            await application.update(applicationData);
            return application;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Error in update application ID ${id}:`, error);
            throw new InternalServerErrorException('Error updating application');
        }
    }

    async updateApplicationStatus(id: string, status: string, userId: string): Promise<Application> {
        try {
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
                throw new UnauthorizedException('You are not authorized to update this application.');
            }

            // Update the application status
            application.status = status;
            await application.save();

            return application;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
                throw error;
            }
            console.error(`Error in updateApplicationStatus ID ${id}:`, error);
            throw new InternalServerErrorException('Error updating application status');
        }
    }

    async findByUser(userId: string): Promise<Application[]> {
        try {
            return await this.applicationModel.findAll({
                where: { user_id: userId },
                include: [Job],
            });
        } catch (error) {
            console.error('Error in findByUser applications:', error);
            throw new InternalServerErrorException('Error fetching user applications');
        }
    }

    async findByJob(jobId: string): Promise<Application[]> {
        try {
            return await this.applicationModel.findAll({
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
        } catch (error) {
            console.error('Error in findByJob applications:', error);
            throw new InternalServerErrorException('Error fetching job applications');
        }
    }
}
