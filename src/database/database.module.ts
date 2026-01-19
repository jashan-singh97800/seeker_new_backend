import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './models/user.model';
import { Job } from './models/job.model';
import { Application } from './models/application.model';
import { Company } from './models/company.model';
import { SavedJob } from './models/saved-job.model';
import { JobAlert } from './models/job-alert.model';
import { UserProfile } from './models/user-profile.model';
import { AuditLog } from './models/audit-log.model';
import { SeedService } from './seed.service';

@Module({
    imports: [
        SequelizeModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                dialect: 'mysql',
                host: configService.get('DATABASE_HOST'),
                port: configService.get<number>('DATABASE_PORT'),
                username: configService.get('DATABASE_USERNAME'),
                password: configService.get('DATABASE_PASSWORD'),
                database: configService.get('DATABASE_NAME'),
                models: [User, Job, Application, Company, SavedJob, JobAlert, UserProfile, AuditLog],
                autoLoadModels: true,
                synchronize: true,
            }),
        }),
        SequelizeModule.forFeature([Company]),
    ],
    providers: [SeedService],
    exports: [SeedService],
})
export class DatabaseModule { }
