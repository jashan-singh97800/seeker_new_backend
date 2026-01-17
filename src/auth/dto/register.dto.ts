import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
    JOB_SEEKER = 'job_seeker',
    EMPLOYER = 'employer',
    ADMIN = 'admin',
}

export class RegisterDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsEnum(UserRole, { message: 'Role must be either job_seeker, employer, or admin' })
    @IsNotEmpty({ message: 'Role is required' })
    role: UserRole;

    @IsString()
    @IsOptional()
    name?: string;
}
