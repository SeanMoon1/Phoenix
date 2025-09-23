import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AdminService } from '../../application/services/admin.service';
import { TeamsService } from '../../application/services/teams.service';
import { UsersService } from '../../application/services/users.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateAdminDto } from '../dto/create-admin.dto.js';
import { CreateTeamDto } from '../dto/create-team.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly teamsService: TeamsService,
    private readonly usersService: UsersService,
  ) {}

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

  @Post('teams')
  @ApiOperation({ summary: '새 팀 생성 (관리자)' })
  @ApiResponse({ status: 201, description: '팀 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiBody({ type: CreateTeamDto })
  async createTeam(@Body() createTeamDto: CreateTeamDto) {
    try {
      const team = await this.teamsService.create(createTeamDto);
      return {
        success: true,
        data: team,
        message: '팀이 성공적으로 생성되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || '팀 생성에 실패했습니다.',
        message: '팀 생성 실패',
      };
    }
  }

  @Get('teams')
  @ApiOperation({ summary: '모든 팀 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '팀 목록 조회 성공' })
  async getTeams() {
    try {
      const teams = await this.teamsService.findAll();
      return { success: true, data: teams };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('users')
  @ApiOperation({ summary: '모든 사용자 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '사용자 목록 조회 성공' })
  async getUsers() {
    try {
      const users = await this.usersService.getAllUsers();
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('users/team/:teamId')
  @ApiOperation({ summary: '특정 팀의 사용자 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '팀 사용자 목록 조회 성공' })
  async getUsersByTeam(@Param('teamId') teamId: number) {
    try {
      const users = await this.usersService.getUsersByTeam(teamId);
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
