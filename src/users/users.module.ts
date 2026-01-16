import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';
import { UserProfile } from '../database/models/user-profile.model';
import { S3UploadService } from '../common/services/s3-upload.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [SequelizeModule.forFeature([User, UserProfile])],
  providers: [UsersService, S3UploadService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule { }
