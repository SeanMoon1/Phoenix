import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AdminService } from '../../application/services/admin.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateAdminDto } from '../dto/create-admin.dto.js';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '관리자 대시보드 데이터 조회' })
  @ApiResponse({ status: 200, description: '대시보드 데이터 조회 성공' })
  async getDashboard() {
    try {
      const data = await this.adminService.getDashboard();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('stats')
  @ApiOperation({ summary: '시스템 통계 조회' })
  @ApiResponse({ status: 200, description: '통계 데이터 조회 성공' })
  async getStats() {
    try {
      const data = await this.adminService.getStats();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('admins')
  @ApiOperation({ summary: '관리자 목록 조회' })
  @ApiResponse({ status: 200, description: '관리자 목록 조회 성공' })
  async getAdmins(@Query('teamId') teamId?: number) {
    try {
      const admins = await this.adminService.getAdmins(teamId);
      return { success: true, data: admins };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('levels')
  @ApiOperation({ summary: '관리자 권한 레벨 조회' })
  @ApiResponse({ status: 200, description: '권한 레벨 조회 성공' })
  async getAdminLevels() {
    try {
      const levels = await this.adminService.getAdminLevels();
      return { success: true, data: levels };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('create')
  @ApiOperation({ summary: '새 관리자 계정 생성' })
  @ApiResponse({ status: 201, description: '관리자 계정 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiBody({ type: CreateAdminDto })
  async createAdmin(@Body() createAdminDto: CreateAdminDto, @Req() req: any) {
    try {
      const admin = await this.adminService.createAdmin({
        ...createAdminDto,
        createdBy: req.user.id, // JWT에서 사용자 ID 추출
      });
      return { success: true, data: admin };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
