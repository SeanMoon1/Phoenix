import { registerAs } from '@nestjs/config';

export default registerAs('oauth', () => ({
  // 공통 OAuth 설정
  redirectBase:
    process.env.NODE_ENV === 'development'
      ? process.env.OAUTH_REDIRECT_BASE_DEV
      : process.env.OAUTH_REDIRECT_BASE,
  successRedirect: process.env.OAUTH_SUCCESS_REDIRECT,
  failureRedirect: process.env.OAUTH_FAILURE_REDIRECT,

  // Google OAuth 설정
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackPath: process.env.GOOGLE_CALLBACK_PATH || '/auth/google/callback',
    scope: ['email', 'profile'],
  },

  // Kakao OAuth 설정 (향후 구현 시 사용)
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID || '',
    clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    callbackPath: process.env.KAKAO_CALLBACK_PATH || '/auth/kakao/callback',
  },

  // Naver OAuth 설정 (향후 구현 시 사용)
  naver: {
    clientId: process.env.NAVER_CLIENT_ID || '',
    clientSecret: process.env.NAVER_CLIENT_SECRET || '',
    callbackPath: process.env.NAVER_CALLBACK_PATH || '/auth/naver/callback',
  },
}));
