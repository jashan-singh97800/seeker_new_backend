import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditLog } from '../database/models/audit-log.model';
import { Application } from '../database/models/application.model';
import { UserProfile } from '../database/models/user-profile.model';
import { Job } from '../database/models/job.model';

@Module({
  imports: [SequelizeModule.forFeature([AuditLog, Application, UserProfile, Job])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule { }

