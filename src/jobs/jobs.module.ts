import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Job } from '../database/models/job.model';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { SearchModule } from '../search/search.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AuthModule } from '../auth/auth.module';

import { JwtModule } from '@nestjs/jwt';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    SequelizeModule.forFeature([Job]),
    SearchModule,
    AnalyticsModule,
    forwardRef(() => AuthModule),
    JwtModule.register({}),
  ],
  providers: [JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule { }
