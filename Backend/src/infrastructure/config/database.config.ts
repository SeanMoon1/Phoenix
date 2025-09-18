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
    // 데이터베이스 연결 실패 시에도 애플리케이션이 계속 실행되도록 설정
    retryAttempts: 3,
    retryDelay: 3000,
    autoLoadEntities: true,
    extra: {
      connectTimeout: 10000,
      waitForConnections: true,
      queueLimit: 0,
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
