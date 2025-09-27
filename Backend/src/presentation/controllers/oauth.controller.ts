import { Controller, Get, Res, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  async googleAuth(@Req() _req: Request) {
    // Passport가 자동으로 Google OAuth 페이지로 리디렉션
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth 콜백 처리' })
  @ApiResponse({ status: 302, description: '로그인 성공/실패에 따른 리디렉션' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'google');
  }

  @Get('google/status')
  @ApiOperation({ summary: 'Google OAuth 설정 상태 확인' })
  @ApiResponse({ status: 200, description: 'OAuth 설정 상태' })
  async getGoogleOAuthStatus() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectBase = this.configService.get<string>('OAUTH_REDIRECT_BASE');
    const callbackPath = this.configService.get<string>('GOOGLE_CALLBACK_PATH');

    const baseUrl = redirectBase || 'https://www.phoenix-4.com';
    return {
      configured: !!(clientId && clientSecret && redirectBase && callbackPath),
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'Not configured',
      redirectUrl:
        redirectBase && callbackPath
          ? `${redirectBase}${callbackPath}`
          : 'Not configured',
      successRedirect: `${baseUrl}/auth/callback`,
      failureRedirect: `${baseUrl}/auth/callback`,
    };
  }

  @Get('naver/status')
  @ApiOperation({ summary: 'Naver OAuth 설정 상태 확인' })
  @ApiResponse({ status: 200, description: 'OAuth 설정 상태' })
  async getNaverOAuthStatus() {
    const clientId = this.configService.get<string>('NAVER_CLIENT_ID');
    const clientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET');
    const redirectBase = this.configService.get<string>('OAUTH_REDIRECT_BASE');
    const callbackPath = this.configService.get<string>('NAVER_CALLBACK_PATH');

    const baseUrl = redirectBase || 'https://www.phoenix-4.com';
    return {
      configured: !!(clientId && clientSecret && redirectBase && callbackPath),
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'Not configured',
      redirectUrl:
        redirectBase && callbackPath
          ? `${redirectBase}${callbackPath}`
          : 'Not configured',
      successRedirect: `${baseUrl}/auth/callback`,
      failureRedirect: `${baseUrl}/auth/callback`,
    };
  }

  // Naver OAuth 엔드포인트
  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: 'Naver OAuth 로그인 시작' })
  @ApiResponse({ status: 302, description: 'Naver OAuth 페이지로 리디렉션' })
  async naverAuth(@Req() _req: Request) {
    // Passport가 자동으로 Naver OAuth 페이지로 리디렉션
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: 'Naver OAuth 콜백 처리' })
  @ApiResponse({ status: 302, description: '로그인 성공/실패에 따른 리디렉션' })
  async naverAuthCallback(@Req() req: Request, @Res() res: Response) {
    console.log('🔍 네이버 OAuth 콜백 시작');
    console.log('📝 req.user:', req.user);
    console.log('📝 req.body:', req.body);
    console.log('📝 req.query:', req.query);
    return this.handleOAuthCallback(req, res, 'naver');
  }

  // Kakao OAuth 엔드포인트
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Kakao OAuth 로그인 시작' })
  @ApiResponse({ status: 302, description: 'Kakao OAuth 페이지로 리디렉션' })
  async kakaoAuth(@Req() _req: Request) {
    // Passport가 자동으로 Kakao OAuth 페이지로 리디렉션
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Kakao OAuth 콜백 처리' })
  @ApiResponse({ status: 302, description: '로그인 성공/실패에 따른 리디렉션' })
  async kakaoAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'kakao');
  }

  // 공통 OAuth 콜백 처리 메서드
  private async handleOAuthCallback(
    req: Request,
    res: Response,
    provider: string,
  ) {
    try {
      console.log(`🔍 ${provider} OAuth 콜백 시작`);
      console.log(`📝 req.user 타입:`, typeof req.user);
      console.log(`📝 req.user 값:`, req.user);

      const user = req.user as any;
      console.log(
        `👤 ${provider} OAuth 사용자 정보:`,
        user ? '사용자 정보 존재' : '사용자 정보 없음',
      );

      if (user) {
        console.log('📝 받은 사용자 데이터 상세:', {
          email: user.email,
          name: user.name,
          provider: user.provider,
          providerId: user.providerId,
          profileImage: user.profileImage,
          hasAccessToken: !!user.accessToken,
          hasRefreshToken: !!user.refreshToken,
          emailType: typeof user.email,
          nameType: typeof user.name,
          providerType: typeof user.provider,
          providerIdType: typeof user.providerId,
          profileImageType: typeof user.profileImage,
        });
      }

      if (!user) {
        console.log(`❌ ${provider} OAuth 사용자 정보 없음`);
        const redirectBase =
          this.configService.get<string>('OAUTH_REDIRECT_BASE') ||
          'https://www.phoenix-4.com';
        return res.redirect(
          `${redirectBase}/auth/callback?error=user_not_found`,
        );
      }

      // 필수 정보 검증
      if (!user.email || !user.name || !user.provider || !user.providerId) {
        console.log(`❌ ${provider} OAuth 사용자 정보 불완전:`, {
          email: user.email || 'undefined',
          name: user.name || 'undefined',
          provider: user.provider || 'undefined',
          providerId: user.providerId || 'undefined',
          emailType: typeof user.email,
          nameType: typeof user.name,
          providerType: typeof user.provider,
          providerIdType: typeof user.providerId,
        });
        const redirectBase =
          this.configService.get<string>('OAUTH_REDIRECT_BASE') ||
          'https://www.phoenix-4.com';
        return res.redirect(
          `${redirectBase}/auth/callback?error=incomplete_user_info`,
        );
      }

      console.log(`🔄 ${provider} OAuth 사용자 등록/로그인 처리 시작`);
      console.log('📝 OAuth 사용자 데이터:', {
        email: user.email,
        name: user.name,
        provider: user.provider,
        providerId: user.providerId,
      });

      // OAuth 사용자 등록/로그인 처리
      const result = await this.authService.oauthRegisterAndLogin({
        email: user.email,
        name: user.name,
        oauthProvider: user.provider,
        oauthProviderId: user.providerId,
      });

      console.log(`🔍 ${provider} OAuth 처리 결과:`, result ? '성공' : '실패');
      console.log('🔑 JWT 토큰 존재:', !!(result && result.access_token));
      console.log(
        '👤 사용자 정보:',
        result
          ? {
              userId: result.user?.id,
              userEmail: result.user?.email,
              userName: result.user?.name,
            }
          : 'No user data',
      );

      if (result && result.access_token) {
        // 성공 시 JWT 토큰과 사용자 정보를 함께 프론트엔드로 리디렉션
        const redirectBase =
          this.configService.get<string>('OAUTH_REDIRECT_BASE') ||
          'https://www.phoenix-4.com';
        const userParam = encodeURIComponent(
          JSON.stringify({
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            provider: user.provider,
            providerId: user.providerId,
          }),
        );
        const successUrl = `${redirectBase}/auth/callback?token=${result.access_token}&user=${userParam}`;
        console.log(`✅ ${provider} OAuth 로그인 성공, 리디렉션:`, successUrl);
        return res.redirect(successUrl);
      } else {
        console.log(`❌ ${provider} OAuth 인증 실패 - 토큰 생성 실패`);
        const redirectBase =
          this.configService.get<string>('OAUTH_REDIRECT_BASE') ||
          'https://www.phoenix-4.com';
        return res.redirect(
          `${redirectBase}/auth/callback?error=authentication_failed`,
        );
      }
    } catch (error) {
      console.error(`❌ ${provider} OAuth callback error:`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      const redirectBase =
        this.configService.get<string>('OAUTH_REDIRECT_BASE') ||
        'https://www.phoenix-4.com';
      return res.redirect(
        `${redirectBase}/auth/callback?error=server_error&details=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @Get('debug/test-oauth')
  @ApiOperation({ summary: 'OAuth 디버그 테스트 (개발용)' })
  @ApiResponse({ status: 200, description: 'OAuth 테스트 결과' })
  async testOAuthFlow() {
    try {
      // 테스트용 OAuth 데이터로 사용자 생성 테스트
      const testOAuthData = {
        email: 'test@example.com',
        name: 'Test User',
        oauthProvider: 'google',
        oauthProviderId: 'test123456',
        profileImageUrl: 'https://example.com/avatar.jpg',
      };

      console.log('🧪 OAuth 테스트 시작:', testOAuthData);

      const result =
        await this.authService.oauthRegisterAndLogin(testOAuthData);

      console.log('✅ OAuth 테스트 성공:', {
        hasToken: !!result.access_token,
        userId: result.user.id,
      });

      return {
        success: true,
        message: 'OAuth 테스트 성공',
        data: {
          hasToken: !!result.access_token,
          userId: result.user.id,
          email: result.user.email,
        },
      };
    } catch (error) {
      console.error('❌ OAuth 테스트 실패:', {
        message: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: 'OAuth 테스트 실패',
        error: error.message,
      };
    }
  }
}
