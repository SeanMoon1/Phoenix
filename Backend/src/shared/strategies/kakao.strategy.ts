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
    const { id, username, _json } = profile;
    const user = {
      email: _json?.kakao_account?.email,
      name: username || _json?.kakao_account?.profile?.nickname,
      profileImage: _json?.kakao_account?.profile?.profile_image_url,
      provider: 'kakao',
      providerId: id,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
