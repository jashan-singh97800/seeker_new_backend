import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    ) { }

    async sendEmail(to: string, subject: string, template: string, context: any) {
        await this.notificationsQueue.add('sendEmail', {
            to,
            subject,
            template,
            context,
        });
    }

    async sendJobAlert(userEmail: string, jobTitle: string, companyName: string) {
        await this.sendEmail(
            userEmail,
            `New Job Alert: ${jobTitle} at ${companyName}`,
            'job-alert',
            { jobTitle, companyName },
        );
    }
}
