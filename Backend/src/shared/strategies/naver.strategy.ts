import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-naver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private configService: ConfigService) {
    const clientId = configService.get<string>('NAVER_CLIENT_ID');
    const clientSecret = configService.get<string>('NAVER_CLIENT_SECRET');
    const redirectBase = configService.get<string>('OAUTH_REDIRECT_BASE');
    const callbackPath = configService.get<string>('NAVER_CALLBACK_PATH');

    console.log('🔍 네이버 OAuth 설정:', {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'Not configured',
      clientSecret: clientSecret ? 'Configured' : 'Not configured',
      redirectBase,
      callbackPath,
      callbackURL:
        redirectBase && callbackPath
          ? `${redirectBase}${callbackPath}`
          : 'Not configured',
    });

    super({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL:
        redirectBase && callbackPath
          ? `${redirectBase}${callbackPath}`
          : 'http://phoenix-4.com/auth/naver/callback',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      console.log(
        '🔍 Naver OAuth Profile 전체 정보:',
        JSON.stringify(profile, null, 2),
      );
      console.log('🔍 Naver OAuth Profile 기본 정보:', {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
        _json: profile._json,
        provider: profile.provider,
        username: profile.username,
      });

      const { id, displayName, emails, _json, username } = profile;

      // 이메일 정보 안전하게 추출 (네이버는 _json.response.email 사용)
      let email = null;
      if (emails && emails.length > 0 && emails[0]?.value) {
        email = emails[0].value;
      } else if (_json?.email) {
        email = _json.email;
      } else if (_json?.response?.email) {
        email = _json.response.email;
      }

      // 이름 정보 안전하게 추출 (네이버는 _json.response.name 사용)
      let fullName = '';
      if (displayName) {
        fullName = displayName;
      } else if (_json?.name) {
        fullName = _json.name;
      } else if (_json?.response?.name) {
        fullName = _json.response.name;
      } else if (_json?.nickname) {
        fullName = _json.nickname;
      } else if (_json?.response?.nickname) {
        fullName = _json.response.nickname;
      } else if (username) {
        fullName = username;
      }

      // 프로필 이미지 안전하게 추출 (네이버는 _json.response.profile_image 사용)
      const profileImage =
        _json?.profile_image ||
        _json?.profileImage ||
        _json?.response?.profile_image ||
        _json?.response?.profileImage ||
        null;

      // providerId가 없으면 id 사용
      const providerId = id || _json?.id || _json?.response?.id || null;

      const user = {
        email,
        name: fullName,
        profileImage,
        provider: 'naver',
        providerId: providerId,
        accessToken,
        refreshToken,
      };

      console.log('✅ Naver OAuth 사용자 정보 파싱 완료:', {
        email: user.email || 'undefined',
        name: user.name || 'undefined',
        provider: user.provider,
        providerId: user.providerId || 'undefined',
        profileImage: user.profileImage || 'undefined',
        emailType: typeof user.email,
        nameType: typeof user.name,
        providerIdType: typeof user.providerId,
        hasAccessToken: !!user.accessToken,
        hasRefreshToken: !!user.refreshToken,
      });

      // 필수 필드 검증
      if (!user.email || !user.name || !user.providerId) {
        console.error('❌ Naver OAuth 필수 필드 누락:', {
          email: user.email,
          name: user.name,
          providerId: user.providerId,
          originalProfile: profile,
        });
        done(new Error('Incomplete user information from Naver OAuth'), null);
        return;
      }

      done(null, user);
    } catch (error) {
      console.error('❌ Naver OAuth 사용자 정보 파싱 실패:', error);
      done(error, null);
    }
  }
}
