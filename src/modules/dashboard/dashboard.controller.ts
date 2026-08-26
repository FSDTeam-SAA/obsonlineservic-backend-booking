import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Public() // Also allow public access or admin access for overview
  @Get('overview')
  @ApiOperation({ summary: 'Get aggregated dashboard overview stats, revenue charts, and active offers' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard overview stats fetched' })
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('admin-stats')
  @ApiOperation({ summary: '[Admin] Get protected admin KPI analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Admin statistics' })
  getAdminStats() {
    return this.dashboardService.getOverview();
  }
}
