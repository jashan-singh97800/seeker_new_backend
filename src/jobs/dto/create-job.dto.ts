import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsString()
    @IsOptional()
    salary_range?: string;

    @IsString()
    @IsOptional()
    type?: string;

    @IsString()
    @IsNotEmpty()
    company_id: string;

    @IsString()
    @IsOptional()
    posted_by?: string;
}
