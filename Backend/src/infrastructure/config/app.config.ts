import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'Phoenix Training System',
  version: process.env.APP_VERSION || '1.0.0',
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : [
          'http://43.203.112.213:3000',
          'http://43.203.112.213',
          'https://www.phoenix-4.com',
          'https://api.phoenix-4.com',
        ],
    credentials: true,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // limit each IP to 100 requests per windowMs
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  swagger: {
    title: process.env.APP_NAME || 'Phoenix Training System API',
    description: '재난 대응 훈련 시스템 API 문서',
    version: process.env.APP_VERSION || '1.0.0',
    path: 'api',
  },
  // 로그 설정
  logLevel: process.env.LOG_LEVEL || 'info',
}));
