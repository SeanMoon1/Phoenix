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
      // alg:none 공격 방어를 위한 알고리즘 검증
      algorithms: ['HS256', 'HS384', 'HS512'],
    });
  }

  async validate(payload: any) {
    console.log('🔍 JWT 토큰 검증:', {
      sub: payload.sub,
      loginId: payload.loginId,
      teamId: payload.teamId,
      adminLevel: payload.adminLevel,
      isAdmin: payload.isAdmin,
      type: payload.type,
      iat: payload.iat,
      exp: payload.exp,
    });

    // Access Token만 허용 (type 검증)
    if (payload.type !== 'access') {
      console.log('❌ Access Token이 아님:', payload.type);
      return null;
    }

    const user = {
      id: payload.sub,
      userId: payload.sub, // 호환성을 위해 userId도 설정
      loginId: payload.loginId,
      username: payload.loginId, // 호환성을 위해 username도 설정
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
      teamId: user.teamId,
    });
    return user;
  }
}
