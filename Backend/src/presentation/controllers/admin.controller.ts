import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
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

  @Get('team/:teamId/members')
  @ApiOperation({ summary: '팀원 목록 조회' })
  @ApiResponse({ status: 200, description: '팀원 목록 조회 성공' })
  getTeamMembers(@Param('teamId') teamId: string) {
    return this.adminService.getTeamMembers(+teamId);
  }

  @Get('team/:teamId/members/:userId')
  @ApiOperation({ summary: '특정 팀원 조회' })
  @ApiResponse({ status: 200, description: '팀원 조회 성공' })
  getTeamMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ) {
    return this.adminService.getTeamMemberById(+teamId, +userId);
  }

  @Patch('team/:teamId/members/:userId')
  @ApiOperation({ summary: '팀원 정보 수정' })
  @ApiResponse({ status: 200, description: '팀원 정보 수정 성공' })
  updateTeamMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Body() updateData: any,
  ) {
    return this.adminService.updateTeamMember(+teamId, +userId, updateData);
  }

  @Delete('team/:teamId/members/:userId')
  @ApiOperation({ summary: '팀원 비활성화' })
  @ApiResponse({ status: 200, description: '팀원 비활성화 성공' })
  deactivateTeamMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ) {
    return this.adminService.deactivateTeamMember(+teamId, +userId);
  }

  @Get('team/:teamId/stats')
  @ApiOperation({ summary: '팀 통계 조회' })
  @ApiResponse({ status: 200, description: '팀 통계 조회 성공' })
  getTeamStats(@Param('teamId') teamId: string) {
    return this.adminService.getTeamStats(+teamId);
  }

  @Get('team/:teamId/member-stats')
  @ApiOperation({ summary: '팀원별 상세 통계 조회' })
  @ApiResponse({ status: 200, description: '팀원별 통계 조회 성공' })
  getTeamMemberStats(@Param('teamId') teamId: string) {
    return this.adminService.getTeamMemberStats(+teamId);
  }
}
