import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
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
      console.log('🔍 Google OAuth Profile 정보:', {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
        name: profile.name,
        photos: profile.photos,
      });

      const { name, emails, photos, id, displayName } = profile;

      // 이메일 정보 안전하게 추출
      const email = emails && emails.length > 0 ? emails[0].value : null;

      // 이름 정보 안전하게 추출
      let fullName = '';
      if (name) {
        if (name.givenName && name.familyName) {
          fullName = `${name.givenName} ${name.familyName}`.trim();
        } else if (name.givenName) {
          fullName = name.givenName;
        } else if (name.familyName) {
          fullName = name.familyName;
        }
      }

      // displayName이 있으면 우선 사용
      if (displayName && !fullName) {
        fullName = displayName;
      }

      // 프로필 이미지 안전하게 추출
      const profileImage = photos && photos.length > 0 ? photos[0].value : null;

      const user = {
        email,
        name: fullName,
        profileImage,
        provider: 'google',
        providerId: id,
        accessToken,
        refreshToken,
      };

      console.log('✅ Google OAuth 사용자 정보 파싱 완료:', {
        email: user.email || 'undefined',
        name: user.name || 'undefined',
        provider: user.provider,
        providerId: user.providerId || 'undefined',
        profileImage: user.profileImage || 'undefined',
        emailType: typeof user.email,
        nameType: typeof user.name,
        providerIdType: typeof user.providerId,
      });

      done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth 사용자 정보 파싱 실패:', error);
      done(error, null);
    }
  }
}
