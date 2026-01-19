import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from './models/company.model';

@Injectable()
export class SeedService {
    constructor(
        @InjectModel(Company)
        private companyModel: typeof Company,
    ) { }

    async seedCompanies() {
        try {
            const count = await this.companyModel.count();

            if (count === 0) {
                console.log('Companies table is empty. Seeding default companies...');

                const companies = [
                    {
                        id: '00000000-0000-0000-0000-000000000001',
                        name: 'TechCorp Solutions',
                        description: 'Leading technology solutions provider specializing in cloud computing and AI.',
                        website: 'https://techcorp.example.com',
                        industry: 'Technology',
                        company_size: '201-500',
                        verified: true,
                    },
                    {
                        id: '00000000-0000-0000-0000-000000000002',
                        name: 'InnovateLabs',
                        description: 'Innovation-driven startup focused on cutting-edge software development.',
                        website: 'https://innovatelabs.example.com',
                        industry: 'Technology',
                        company_size: '11-50',
                        verified: true,
                    },
                    {
                        id: '00000000-0000-0000-0000-000000000003',
                        name: 'Global Finance Group',
                        description: 'International financial services company with a focus on digital banking.',
                        website: 'https://globalfinance.example.com',
                        industry: 'Finance',
                        company_size: '1001+',
                        verified: true,
                    },
                    {
                        id: '00000000-0000-0000-0000-000000000004',
                        name: 'HealthTech Inc',
                        description: 'Healthcare technology company revolutionizing patient care through innovation.',
                        website: 'https://healthtech.example.com',
                        industry: 'Healthcare',
                        company_size: '51-200',
                        verified: true,
                    },
                    {
                        id: '00000000-0000-0000-0000-000000000005',
                        name: 'EduLearn Platform',
                        description: 'Online education platform providing courses for professional development.',
                        website: 'https://edulearn.example.com',
                        industry: 'Education',
                        company_size: '11-50',
                        verified: false,
                    },
                ];

                await this.companyModel.bulkCreate(companies as any);
                console.log(`✓ Successfully seeded ${companies.length} companies`);
            } else {
                console.log(`Companies table already has ${count} records. Skipping seed.`);
            }
        } catch (error) {
            console.error('Error seeding companies:', error);
            throw error;
        }
    }
}
