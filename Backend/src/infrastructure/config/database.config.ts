import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

 export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('DB_HOST', '43.203.112.213'),
  port: configService.get('DB_PORT', 3306),
  username: configService.get('DB_USERNAME', 'root'),
  password: configService.get('DB_PASSWORD', ''),
  database: configService.get('DB_DATABASE', 'phoenix'),
  entities: [
    __dirname + '/../../domain/entities/*.entity{.ts,.js}',
    __dirname + '/../database/entities/*.entity{.ts,.js}',
  ],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  // 연결 풀 설정
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },
  // SSL 설정 (AWS RDS 사용 시)
  ssl:
    configService.get('NODE_ENV') === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});