import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${configService.get<string>('OAUTH_REDIRECT_BASE')}${configService.get<string>('GOOGLE_CALLBACK_PATH')}`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      console.log('🔍 Google OAuth 프로필 정보:', {
        id: profile.id,
        name: profile.name,
        emails: profile.emails,
        photos: profile.photos,
      });

      const { name, emails, photos } = profile;

      // 필수 정보 검증
      if (!emails || !emails[0] || !emails[0].value) {
        console.log('❌ Google OAuth 이메일 정보 없음');
        return done(
          new Error('Google OAuth에서 이메일 정보를 받을 수 없습니다.'),
          null,
        );
      }

      if (!name || (!name.givenName && !name.familyName)) {
        console.log('❌ Google OAuth 이름 정보 없음');
        return done(
          new Error('Google OAuth에서 이름 정보를 받을 수 없습니다.'),
          null,
        );
      }

      if (!profile.id) {
        console.log('❌ Google OAuth 사용자 ID 없음');
        return done(
          new Error('Google OAuth에서 사용자 ID를 받을 수 없습니다.'),
          null,
        );
      }

      const user = {
        email: emails[0].value,
        name: `${name.givenName || ''} ${name.familyName || ''}`.trim(),
        provider: 'google',
        providerId: profile.id,
        profileImage: photos && photos[0] ? photos[0].value : null,
        accessToken,
        refreshToken,
      };

      console.log('✅ Google OAuth 사용자 정보 생성 완료:', {
        email: user.email,
        name: user.name,
        provider: user.provider,
        providerId: user.providerId,
        hasProfileImage: !!user.profileImage,
      });

      done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth 검증 오류:', {
        message: error.message,
        stack: error.stack,
      });
      done(error, null);
    }
  }
}
