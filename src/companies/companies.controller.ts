import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Get()
    async findAll() {
        return this.companiesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.companiesService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() companyData: any) {
        return this.companiesService.create(companyData);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() companyData: any) {
        return this.companiesService.update(id, companyData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string) {
        return this.companiesService.remove(id);
    }
}
