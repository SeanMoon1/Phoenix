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
        rawProfile: JSON.stringify(profile, null, 2),
      });

      const { id, displayName, emails, _json } = profile;

      // 이메일 정보 안전하게 추출
      let email = null;
      if (emails && emails.length > 0 && emails[0]?.value) {
        email = emails[0].value;
      } else if (_json?.email) {
        email = _json.email;
      }

      // 이메일이 없으면 에러
      if (!email) {
        console.error('❌ Naver OAuth: 이메일 정보 없음');
        done(
          new Error('Naver OAuth에서 이메일 정보를 가져올 수 없습니다.'),
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

      // 2. _json.name 사용
      if (!fullName && _json?.name && _json.name.trim()) {
        fullName = _json.name.trim();
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
        fullName = 'Naver 사용자';
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
      console.error('❌ Naver OAuth 사용자 정보 파싱 실패:', error);
      done(error, null);
    }
  }
}
