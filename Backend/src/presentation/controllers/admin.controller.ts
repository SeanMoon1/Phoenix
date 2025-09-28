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
import { AdminGuard } from '../../shared/guards/admin.guard';
import { CreateAdminDto } from '../dto/create-admin.dto.js';
import { CreateTeamDto } from '../dto/create-team.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
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
  async getAdmins(@Query('teamId') teamId?: number, @Req() req?: any) {
    try {
      const user = req?.user;

      // 슈퍼 관리자만 관리자 목록 조회 가능
      if (!user || user.adminLevel !== 'SUPER_ADMIN') {
        return {
          success: false,
          error:
            '관리자 목록 조회 권한이 없습니다. 슈퍼 관리자만 접근 가능합니다.',
        };
      }

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
      const user = req.user;

      // 슈퍼 관리자만 관리자 생성 가능
      if (!user || user.adminLevel !== 'SUPER_ADMIN') {
        return {
          success: false,
          error: '관리자 생성 권한이 없습니다. 슈퍼 관리자만 접근 가능합니다.',
        };
      }

      const admin = await this.adminService.createAdmin({
        ...createAdminDto,
        createdBy: user.id, // JWT에서 사용자 ID 추출
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
  async createTeam(@Body() createTeamDto: CreateTeamDto, @Req() req: any) {
    try {
      const user = req.user;

      // 슈퍼 관리자만 팀 생성 가능
      if (!user || user.adminLevel !== 'SUPER_ADMIN') {
        return {
          success: false,
          error: '팀 생성 권한이 없습니다. 슈퍼 관리자만 접근 가능합니다.',
        };
      }

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
  async getTeams(@Req() req: any) {
    try {
      const user = req.user;

      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      let teams;
      if (user.adminLevel === 'SUPER_ADMIN') {
        // 슈퍼 관리자: 모든 팀 조회 가능
        teams = await this.teamsService.findAll();
      } else if (user.adminLevel === 'TEAM_ADMIN' && user.teamId) {
        // 팀 관리자: 본인 팀만 조회 가능
        const allTeams = await this.teamsService.findAll();
        teams = allTeams.filter((team) => team.id === user.teamId);
      } else {
        return { success: false, error: '팀 조회 권한이 없습니다.' };
      }

      return { success: true, data: teams };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('users')
  @ApiOperation({ summary: '모든 사용자 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '사용자 목록 조회 성공' })
  async getUsers(@Req() req: any) {
    try {
      const user = req.user;

      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      let users;
      if (user.adminLevel === 'SUPER_ADMIN') {
        // 슈퍼 관리자: 모든 사용자 조회 가능
        users = await this.usersService.getAllUsers();
      } else if (user.adminLevel === 'TEAM_ADMIN' && user.teamId) {
        // 팀 관리자: 본인 팀의 사용자만 조회 가능
        users = await this.usersService.getUsersByTeam(user.teamId);
      } else {
        return { success: false, error: '사용자 조회 권한이 없습니다.' };
      }

      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('users/team/:teamId')
  @ApiOperation({ summary: '특정 팀의 사용자 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '팀 사용자 목록 조회 성공' })
  async getUsersByTeam(@Param('teamId') teamId: number, @Req() req: any) {
    try {
      const user = req.user;

      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      // 권한 체크
      if (user.adminLevel === 'SUPER_ADMIN') {
        // 슈퍼 관리자: 모든 팀의 사용자 조회 가능
      } else if (user.adminLevel === 'TEAM_ADMIN' && user.teamId === teamId) {
        // 팀 관리자: 본인 팀의 사용자만 조회 가능
      } else {
        return {
          success: false,
          error: '해당 팀의 사용자 조회 권한이 없습니다.',
        };
      }

      const users = await this.usersService.getUsersByTeam(teamId);
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('fix-permissions')
  @ApiOperation({ summary: '관리자 권한 수정 (개발용)' })
  @ApiResponse({ status: 200, description: '권한 수정 성공' })
  async fixAdminPermissions(@Req() req: any) {
    try {
      const user = req.user;

      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      // 슈퍼 관리자만 이 기능 사용 가능
      if (user.adminLevel !== 'SUPER_ADMIN') {
        return {
          success: false,
          error: '권한 수정 기능은 슈퍼 관리자만 사용할 수 있습니다.',
        };
      }

      // 초기 관리자 계정을 SUPER_ADMIN으로 수정
      const initialAdminLoginId = process.env.INITIAL_ADMIN_LOGIN_ID;
      if (!initialAdminLoginId) {
        return {
          success: false,
          error: 'INITIAL_ADMIN_LOGIN_ID 환경변수가 설정되지 않았습니다.',
        };
      }

      // SUPER_ADMIN 권한 레벨 ID 조회
      const superAdminLevel = await this.adminService.getAdminLevels();
      const superAdminLevelData = superAdminLevel.find(
        (level) => level.levelCode === 'SUPER_ADMIN',
      );

      if (!superAdminLevelData) {
        return {
          success: false,
          error: 'SUPER_ADMIN 권한 레벨을 찾을 수 없습니다.',
        };
      }

      // 관리자 권한 수정 (직접 SQL 실행)
      const result = await this.adminService.updateAdminLevel(
        initialAdminLoginId,
        superAdminLevelData.id,
      );

      return {
        success: true,
        data: result,
        message: `관리자 권한이 SUPER_ADMIN으로 수정되었습니다: ${initialAdminLoginId}`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
