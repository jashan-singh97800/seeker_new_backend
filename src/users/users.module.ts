import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';
import { UserProfile } from '../database/models/user-profile.model';
import { S3UploadService } from '../common/services/s3-upload.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserProfile]),
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService, S3UploadService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule { }
