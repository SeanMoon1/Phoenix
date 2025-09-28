import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      console.log('🔍 Kakao OAuth Profile 정보:', {
        id: profile.id,
        username: profile.username,
        _json: profile._json,
        rawProfile: JSON.stringify(profile, null, 2),
      });

      const { id, username, _json } = profile;

      // 이메일 정보 안전하게 추출
      const email = _json?.kakao_account?.email || null;

      // 이메일이 없으면 에러
      if (!email) {
        console.error('❌ Kakao OAuth: 이메일 정보 없음');
        done(
          new Error('Kakao OAuth에서 이메일 정보를 가져올 수 없습니다.'),
          null,
        );
        return;
      }

      // 이름 정보 안전하게 추출
      let fullName = '';

      // 1. username 우선 사용
      if (username && username.trim()) {
        fullName = username.trim();
      }

      // 2. kakao_account.profile.nickname 사용
      if (
        !fullName &&
        _json?.kakao_account?.profile?.nickname &&
        _json.kakao_account.profile.nickname.trim()
      ) {
        fullName = _json.kakao_account.profile.nickname.trim();
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
        fullName = 'Kakao 사용자';
      }

      // 프로필 이미지 안전하게 추출
      const profileImage =
        _json?.kakao_account?.profile?.profile_image_url || null;

      const user = {
        email,
        name: fullName,
        profileImage,
        provider: 'kakao',
        providerId: id,
        accessToken,
        refreshToken,
      };

      console.log('✅ Kakao OAuth 사용자 정보 파싱 완료:', {
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
      console.error('❌ Kakao OAuth 사용자 정보 파싱 실패:', error);
      done(error, null);
    }
  }
}
