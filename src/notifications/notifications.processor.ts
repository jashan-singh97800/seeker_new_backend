import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('notifications')
export class NotificationsProcessor {
    private readonly logger = new Logger(NotificationsProcessor.name);

    @Process('sendEmail')
    async handleSendEmail(job: Job) {
        this.logger.debug('Starting sendEmail job...');
        this.logger.debug(job.data);

        // Simulate email sending
        await new Promise((resolve) => setTimeout(resolve, 2000));

        this.logger.debug('Email sent successfully');
    }
}
