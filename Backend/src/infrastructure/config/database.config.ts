import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isDevelopment = configService.get('NODE_ENV') === 'development';

  return {
    type: 'mysql',
    host: isDevelopment
      ? configService.get('DB_HOST_DEV') || 'localhost'
      : configService.get('DB_HOST_PROD') ||
        configService.get('DB_HOST') ||
        'localhost',
    port: isDevelopment
      ? parseInt(configService.get('DB_PORT_DEV'), 10) || 3306
      : parseInt(
          configService.get('DB_PORT_PROD') || configService.get('DB_PORT'),
          10,
        ) || 3306,
    username: isDevelopment
      ? configService.get('DB_USERNAME_DEV') || 'root'
      : configService.get('DB_USERNAME_PROD') ||
        configService.get('DB_USERNAME') ||
        'root',
    password: isDevelopment
      ? configService.get('DB_PASSWORD_DEV') || ''
      : configService.get('DB_PASSWORD_PROD') ||
        configService.get('DB_PASSWORD') ||
        '',
    database: isDevelopment
      ? configService.get('DB_DATABASE_DEV') || 'phoenix'
      : configService.get('DB_DATABASE_PROD') ||
        configService.get('DB_DATABASE') ||
        'phoenix',
    entities: [__dirname + '/../../domain/entities/*.entity.js'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: isDevelopment,
    logging: true, // 모든 로그 활성화
    // 연결 풀 설정
    extra: {
      connectionLimit: 10,
      acquireTimeout: 60000, // 60초 (acquireTimeoutMillis 대신 acquireTimeout 사용)
      connectTimeout: 60000, // 60초 (timeout 대신 connectTimeout 사용)
    },
    // SSL 설정 (AWS RDS 사용 시)
    ssl: !isDevelopment
      ? {
          rejectUnauthorized: false,
        }
      : false,
  };
};
