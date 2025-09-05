import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  secret: configService.get<string>(
    'JWT_SECRET',
    'phoenix_jwt_secret_key_2024',
  ),
  signOptions: {
    expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
  },
});
