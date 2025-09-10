import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  @Get('dashboard')
  @ApiOperation({ summary: '관리자 대시보드' })
  @ApiResponse({ status: 200, description: '대시보드 데이터 조회 성공' })
  getDashboard() {
    return {
      message: '관리자 대시보드',
      data: {
        totalUsers: 0,
        totalTeams: 0,
        totalScenarios: 0,
        totalTrainingSessions: 0,
      },
    };
  }
}
