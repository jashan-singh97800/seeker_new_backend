import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Application } from '../database/models/application.model';
import { Job } from '../database/models/job.model';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { AnalyticsModule } from '../analytics/analytics.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Application, Job]),
    AnalyticsModule,
    NotificationsModule,
  ],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService],
})
export class ApplicationsModule { }
