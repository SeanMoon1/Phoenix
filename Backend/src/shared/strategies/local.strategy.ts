import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../application/services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginId',
      passwordField: 'password',
    });
  }

  async validate(loginId: string, password: string): Promise<any> {
    console.log('🔍 LocalStrategy.validate 호출:', {
      loginId,
      hasPassword: !!password,
    });
    try {
      const user = await this.authService.validateUser(loginId, password);
      if (!user) {
        console.log('❌ LocalStrategy: 사용자 인증 실패');
        throw new UnauthorizedException('Invalid credentials');
      }
      console.log('✅ LocalStrategy: 사용자 인증 성공');
      return user;
    } catch (error) {
      console.error('❌ LocalStrategy.validate 에러:', error);
      throw error;
    }
  }
}
