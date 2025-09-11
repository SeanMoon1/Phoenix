import { Controller, Get, Query, Res, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../application/services/auth.service';

@ApiTags('OAuth')
@Controller('auth')
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth 로그인 시작' })
  @ApiResponse({ status: 302, description: 'Google OAuth 페이지로 리디렉션' })
  async googleAuth(@Req() req: Request) {
    // Passport가 자동으로 Google OAuth 페이지로 리디렉션
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth 콜백 처리' })
  @ApiResponse({ status: 302, description: '로그인 성공/실패에 따른 리디렉션' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;

      if (!user) {
        return res.redirect(
          `${this.configService.get<string>('OAUTH_FAILURE_REDIRECT')}?error=user_not_found`,
        );
      }

      // OAuth 사용자 등록/로그인 처리
      const result = await this.authService.oauthRegisterAndLogin({
        email: user.email,
        name: user.name,
        provider: user.provider,
        providerId: user.providerId,
        profileImage: user.profileImage,
      });

      if (result && result.access_token) {
        // 성공 시 JWT 토큰과 함께 프론트엔드로 리디렉션
        const successUrl = `${this.configService.get<string>('OAUTH_SUCCESS_REDIRECT')}?token=${result.access_token}`;
        return res.redirect(successUrl);
      } else {
        return res.redirect(
          `${this.configService.get<string>('OAUTH_FAILURE_REDIRECT')}?error=authentication_failed`,
        );
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res.redirect(
        `${this.configService.get<string>('OAUTH_FAILURE_REDIRECT')}?error=server_error`,
      );
    }
  }

  @Get('google/status')
  @ApiOperation({ summary: 'Google OAuth 설정 상태 확인' })
  @ApiResponse({ status: 200, description: 'OAuth 설정 상태' })
  async getGoogleOAuthStatus() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectBase = this.configService.get<string>('OAUTH_REDIRECT_BASE');
    const callbackPath = this.configService.get<string>('GOOGLE_CALLBACK_PATH');

    return {
      configured: !!(clientId && clientSecret && redirectBase && callbackPath),
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'Not configured',
      redirectUrl:
        redirectBase && callbackPath
          ? `${redirectBase}${callbackPath}`
          : 'Not configured',
      successRedirect: this.configService.get<string>('OAUTH_SUCCESS_REDIRECT'),
      failureRedirect: this.configService.get<string>('OAUTH_FAILURE_REDIRECT'),
    };
  }
}
