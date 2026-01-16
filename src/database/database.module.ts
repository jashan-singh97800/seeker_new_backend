import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UserProfile } from './models/user-profile.model';
import { Company } from './models/company.model';
import { Job } from './models/job.model';
import { Application } from './models/application.model';
import { SavedJob } from './models/saved-job.model';
import { JobAlert } from './models/job-alert.model';
import { AuditLog } from './models/audit-log.model';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        SequelizeModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                dialect: 'mysql',
                host: configService.get<string>('DATABASE_HOST'),
                port: configService.get<number>('DATABASE_PORT'),
                username: configService.get<string>('DATABASE_USERNAME'),
                password: configService.get<string>('DATABASE_PASSWORD'),
                database: configService.get<string>('DATABASE_NAME'),
                models: [User, UserProfile, Company, Job, Application, SavedJob, JobAlert, AuditLog],
                autoLoadModels: true,
                synchronize: true, // Set to false in production
            }),
        }),
    ],
    exports: [SequelizeModule],
})
export class DatabaseModule { }
