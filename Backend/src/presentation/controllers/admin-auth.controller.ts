import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AdminService } from '../../application/services/admin.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { AdminLoginDto } from '../dto/admin-login.dto';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @UseGuards(AuthGuard('admin'))
  @ApiOperation({ summary: '관리자 로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBody({ type: AdminLoginDto })
  async login(@Req() req: any) {
    console.log('🔐 AdminAuthController.login 호출됨');
    console.log('📝 요청 데이터:', req.body);
    try {
      const admin = req.user;
      const payload = {
        id: admin.id,
        loginId: admin.loginId,
        name: admin.name,
        email: admin.email,
        teamId: admin.teamId,
        adminLevelId: admin.adminLevelId,
        isAdmin: true,
      };

      const token = this.jwtService.sign(payload);

      return {
        success: true,
        data: {
          token,
          admin: payload,
        },
        message: '관리자 로그인 성공',
      };
    } catch (error) {
      console.error('❌ 관리자 로그인 오류:', error);
      return {
        success: false,
        error: error.message || '관리자 로그인에 실패했습니다.',
        message: '관리자 로그인 실패',
      };
    }
  }
}
