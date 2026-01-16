import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('stats')
    @Roles('admin')
    async getStats() {
        return this.analyticsService.getPlatformStats();
    }

    @Get('user-stats')
    async getUserStats(@Req() req: any) {
        return this.analyticsService.getUserDashboardStats(req.user.id);
    }

    @Get('employer-stats')
    @Roles('employer', 'admin')
    async getEmployerStats(@Req() req: any) {
        return this.analyticsService.getEmployerDashboardStats(req.user.id);
    }
}
