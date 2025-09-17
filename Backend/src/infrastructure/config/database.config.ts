import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const config = {
    type: 'mysql' as const,
    host: configService.get('DB_HOST'),
    port: Number(configService.get('DB_PORT') ?? 3306),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/../../domain/entities/*.entity.js'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: configService.get('NODE_ENV') === 'development',
    extra: {
      connectTimeout: 10000,
      waitForConnections: true,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
    },
    // Aurora RDS 연결을 위한 추가 설정
    ssl:
      process.env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: false,
          }
        : false,
  };

  console.log('🔍 데이터베이스 설정:', {
    host: config.host,
    port: config.port,
    username: config.username,
    database: config.database,
    entities: config.entities,
  });

  return config;
};
