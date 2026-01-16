import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from '../database/models/company.model';

@Injectable()
export class CompaniesService {
    constructor(
        @InjectModel(Company)
        private companyModel: typeof Company,
    ) { }

    async findAll(): Promise<Company[]> {
        return this.companyModel.findAll();
    }

    async findOne(id: string): Promise<Company | null> {
        return this.companyModel.findByPk(id);
    }

    async create(companyData: Partial<Company>): Promise<Company> {
        return this.companyModel.create(companyData);
    }

    async update(id: string, companyData: Partial<Company>): Promise<[number, Company[]]> {
        return this.companyModel.update(companyData, {
            where: { id },
            returning: true,
        });
    }

    async remove(id: string): Promise<number> {
        return this.companyModel.destroy({
            where: { id },
        });
    }
}
