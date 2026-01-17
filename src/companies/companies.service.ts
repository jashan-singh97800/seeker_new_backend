import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from '../database/models/company.model';

@Injectable()
export class CompaniesService {
    constructor(
        @InjectModel(Company)
        private companyModel: typeof Company,
    ) { }

    async findAll(): Promise<Company[]> {
        try {
            return await this.companyModel.findAll();
        } catch (error) {
            console.error('Error in findAll companies:', error);
            throw new InternalServerErrorException('Error fetching companies');
        }
    }

    async findOne(id: string): Promise<Company> {
        try {
            const company = await this.companyModel.findByPk(id);
            if (!company) {
                throw new NotFoundException(`Company with ID ${id} not found`);
            }
            return company;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Error in findOne company ID ${id}:`, error);
            throw new InternalServerErrorException('Error fetching company details');
        }
    }

    async create(companyData: Partial<Company>): Promise<Company> {
        try {
            return await this.companyModel.create(companyData as any);
        } catch (error) {
            console.error('Error in create company:', error);
            throw new InternalServerErrorException('Error creating company');
        }
    }

    async update(id: string, companyData: Partial<Company>): Promise<Company> {
        try {
            const company = await this.findOne(id);
            await company.update(companyData);
            return company;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Error in update company ID ${id}:`, error);
            throw new InternalServerErrorException('Error updating company');
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const company = await this.findOne(id);
            await company.destroy();
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Error in remove company ID ${id}:`, error);
            throw new InternalServerErrorException('Error deleting company');
        }
    }
}
