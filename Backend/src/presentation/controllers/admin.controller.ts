import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from '../../application/services/admin.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '관리자 대시보드 데이터 조회' })
  @ApiResponse({ status: 200, description: '대시보드 데이터 조회 성공' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('stats')
  @ApiOperation({ summary: '시스템 통계 조회' })
  @ApiResponse({ status: 200, description: '통계 데이터 조회 성공' })
  getStats() {
    return this.adminService.getStats();
  }
}
