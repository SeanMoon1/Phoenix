import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-naver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.get<string>('NAVER_CLIENT_SECRET'),
      callbackURL: configService.get<string>('NAVER_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      console.log('🔍 Naver OAuth Profile 정보:', {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
        _json: profile._json,
      });

      const { id, displayName, emails, _json } = profile;

      // 이메일 정보 안전하게 추출
      let email = null;
      if (emails && emails.length > 0 && emails[0]?.value) {
        email = emails[0].value;
      } else if (_json?.email) {
        email = _json.email;
      }

      // 이름 정보 안전하게 추출
      let fullName = '';
      if (displayName) {
        fullName = displayName;
      } else if (_json?.name) {
        fullName = _json.name;
      }

      // 프로필 이미지 안전하게 추출
      const profileImage = _json?.profile_image || null;

      const user = {
        email,
        name: fullName,
        profileImage,
        provider: 'naver',
        providerId: id,
        accessToken,
        refreshToken,
      };

      console.log('✅ Naver OAuth 사용자 정보 파싱 완료:', {
        email: !!user.email,
        name: !!user.name,
        provider: user.provider,
        providerId: !!user.providerId,
        profileImage: !!user.profileImage,
      });

      done(null, user);
    } catch (error) {
      console.error('❌ Naver OAuth 사용자 정보 파싱 실패:', error);
      done(error, null);
    }
  }
}
