import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'default-jwt-secret',
    });
  }

  async validate(payload: any) {
    console.log('🔍 JWT 토큰 검증:', {
      id: payload.id,
      loginId: payload.loginId,
      email: payload.email,
      name: payload.name,
      teamId: payload.teamId,
      adminLevel: payload.adminLevel,
      isAdmin: payload.isAdmin,
      iat: payload.iat,
      exp: payload.exp,
    });

    // 관리자인 경우와 일반 사용자인 경우를 구분하여 처리
    const user = {
      id: payload.id,
      userId: payload.id, // 호환성을 위해 userId도 설정
      loginId: payload.loginId,
      username: payload.loginId, // 호환성을 위해 username도 설정
      name: payload.name,
      email: payload.email,
      teamId: payload.teamId,
      adminLevel: payload.adminLevel,
      adminLevelId: payload.adminLevelId,
      isAdmin: payload.isAdmin || false,
    };

    console.log('✅ JWT 토큰 검증 성공:', {
      id: user.id,
      loginId: user.loginId,
      adminLevel: user.adminLevel,
      isAdmin: user.isAdmin,
    });
    return user;
  }
}
