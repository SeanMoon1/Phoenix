import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminService } from '../../application/services/admin.service';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(private readonly adminService: AdminService) {
    super({
      usernameField: 'loginId',
      passwordField: 'password',
    });
  }

  async validate(loginId: string, password: string): Promise<any> {
    console.log('🔐 AdminStrategy.validate 호출됨:', {
      loginId,
      hasPassword: !!password,
    });

    const admin = await this.adminService.validateAdmin(loginId, password);

    if (!admin) {
      console.log('❌ AdminStrategy: 관리자 인증 실패');
      throw new UnauthorizedException('관리자 인증에 실패했습니다.');
    }

    console.log('✅ AdminStrategy: 관리자 인증 성공');

    return {
      id: admin.id,
      loginId: admin.loginId,
      name: admin.name,
      email: admin.email,
      teamId: admin.teamId,
      adminLevelId: admin.adminLevelId,
      adminLevel: admin.adminLevel,
      team: admin.team,
      isAdmin: true,
    };
  }
}
