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
      });

      const { id, username, _json } = profile;

      // 이메일 정보 안전하게 추출
      const email = _json?.kakao_account?.email || null;

      // 이름 정보 안전하게 추출
      let fullName = '';
      if (username) {
        fullName = username;
      } else if (_json?.kakao_account?.profile?.nickname) {
        fullName = _json.kakao_account.profile.nickname;
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
      console.error('❌ Kakao OAuth 사용자 정보 파싱 실패:', error);
      done(error, null);
    }
  }
}
