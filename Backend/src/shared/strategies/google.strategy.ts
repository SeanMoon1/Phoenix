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
        rawProfile: JSON.stringify(profile, null, 2),
      });

      const { name, emails, photos, id, displayName } = profile;

      // 이메일 정보 안전하게 추출
      let email = null;
      if (emails && emails.length > 0) {
        email = emails[0].value;
      }

      // 이메일이 없으면 에러
      if (!email) {
        console.error('❌ Google OAuth: 이메일 정보 없음');
        done(
          new Error('Google OAuth에서 이메일 정보를 가져올 수 없습니다.'),
          null,
        );
        return;
      }

      // 이름 정보 안전하게 추출
      let fullName = '';

      // 1. displayName 우선 사용
      if (displayName && displayName.trim()) {
        fullName = displayName.trim();
      }

      // 2. name 객체에서 조합
      if (!fullName && name) {
        if (name.givenName && name.familyName) {
          fullName = `${name.givenName} ${name.familyName}`.trim();
        } else if (name.givenName) {
          fullName = name.givenName.trim();
        } else if (name.familyName) {
          fullName = name.familyName.trim();
        }
      }

      // 3. 이름이 없으면 이메일에서 추출
      if (!fullName && email) {
        const emailName = email.split('@')[0];
        fullName = emailName
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }

      // 4. 최종적으로 이름이 없으면 기본값
      if (!fullName) {
        fullName = 'Google 사용자';
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
        email: user.email,
        name: user.name,
        provider: user.provider,
        providerId: user.providerId,
        profileImage: user.profileImage ? '있음' : '없음',
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
