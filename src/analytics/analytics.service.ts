import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditLog } from '../database/models/audit-log.model';
import { Application } from '../database/models/application.model';
import { UserProfile } from '../database/models/user-profile.model';
import { Job } from '../database/models/job.model';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(AuditLog)
        private auditLogModel: typeof AuditLog,
        @InjectModel(Application)
        private applicationModel: typeof Application,
        @InjectModel(UserProfile)
        private userProfileModel: typeof UserProfile,
        @InjectModel(Job)
        private jobModel: typeof Job,
    ) { }

    async getUserDashboardStats(userId: string) {
        try {
            const totalApplications = await this.applicationModel.count({
                where: { user_id: userId }
            });

            const interviewStatus = ['under_review', 'shortlisted', 'interview_scheduled', 'accepted'];
            const totalInterviews = await this.applicationModel.count({
                where: {
                    user_id: userId,
                    status: interviewStatus
                }
            });

            const profile = await this.userProfileModel.findOne({
                where: { user_id: userId }
            });

            // Simple profile score calculation
            let score = 0;
            if (profile) {
                if (profile.full_name) score += 20;
                if (profile.phone) score += 10;
                if (profile.location) score += 10;
                if (profile.current_position) score += 10;
                if (profile.experience_years > 0) score += 10;
                if (profile.resume_url) score += 20;
                if (profile.skills && Object.keys(profile.skills).length > 0) score += 20;
            }

            return {
                totalApplications,
                totalInterviews,
                profileScore: score || 0,
                recentActivity: totalApplications > 0 ? '+1 this week' : '+0 this week', // Simulation logic
            };
        } catch (error) {
            console.error('Error in getUserDashboardStats:', error);
            throw new InternalServerErrorException('Error fetching user dashboard statistics');
        }
    }

    async getEmployerDashboardStats(empId: string) {
        try {
            // 1. Get all jobs posted by this employer
            const jobs = await this.jobModel.findAll({
                where: { posted_by: empId },
                attributes: ['id', 'views_count']
            });

            const jobIds = jobs.map(j => j.id);

            // 2. Count active jobs
            const activeRoles = await this.jobModel.count({
                where: { posted_by: empId, status: 'active' }
            });

            // 3. Count total applicants for these jobs
            const totalApplicants = await this.applicationModel.count({
                where: { job_id: jobIds }
            });

            // 4. Calculate total views
            const totalViews = jobs.reduce((sum, job) => sum + (job.views_count || 0), 0);

            return {
                activeRoles,
                totalApplicants,
                totalViews,
                growth: 12 // Hardcoded simulation for now or calculate based on last month
            };
        } catch (error) {
            console.error('Error in getEmployerDashboardStats:', error);
            throw new InternalServerErrorException('Error fetching employer dashboard statistics');
        }
    }

    async logEvent(
        userId: string | null,
        entityType: string,
        entityId: string | null,
        action: string,
        changes: any = {},
        ipAddress: string = '0.0.0.0',
        userAgent: string = 'internal',
    ) {
        try {
            let jobId: string | null = null;
            if (entityType === 'job') {
                jobId = entityId;
            } else if (changes && (changes.job_id || changes.jobId)) {
                jobId = changes.job_id || changes.jobId;
            }

            return await this.auditLogModel.create({
                user_id: userId,
                job_id: jobId,
                entity_type: entityType,
                entity_id: entityId,
                action,
                changes,
                ip_address: ipAddress,
                user_agent: userAgent,
            } as any);
        } catch (error) {
            console.error('Error in logEvent:', error);
            throw new InternalServerErrorException('Error logging analytics event');
        }
    }

    async getPlatformStats() {
        try {
            // This is a placeholder for more complex queries
            const totalEvents = await this.auditLogModel.count();
            const jobViews = await this.auditLogModel.count({ where: { action: 'view_job' } });
            const jobApplies = await this.auditLogModel.count({ where: { action: 'apply_job' } });

            return {
                totalEvents,
                jobViews,
                jobApplies,
            };
        } catch (error) {
            console.error('Error in getPlatformStats:', error);
            throw new InternalServerErrorException('Error fetching platform statistics');
        }
    }
}
