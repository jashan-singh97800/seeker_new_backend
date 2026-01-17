import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    ) { }

    async sendEmail(to: string, subject: string, template: string, context: any) {
        try {
            await this.notificationsQueue.add('sendEmail', {
                to,
                subject,
                template,
                context,
            });
        } catch (error) {
            console.error('Error in sendEmail notification:', error);
            throw new InternalServerErrorException('Error queueing email notification');
        }
    }

    async sendJobAlert(userEmail: string, jobTitle: string, companyName: string) {
        try {
            await this.sendEmail(
                userEmail,
                `New Job Alert: ${jobTitle} at ${companyName}`,
                'job-alert',
                { jobTitle, companyName },
            );
        } catch (error) {
            console.error('Error in sendJobAlert notification:', error);
            throw new InternalServerErrorException('Error queueing job alert notification');
        }
    }
}
