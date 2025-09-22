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
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
      teamId: payload.teamId,
      iat: payload.iat,
      exp: payload.exp,
    });

    const user = {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      teamId: payload.teamId,
    };

    console.log('✅ JWT 토큰 검증 성공:', user);
    return user;
  }
}
