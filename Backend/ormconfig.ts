import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// 환경 변수 로드
config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get<string>('DB_USERNAME', 'root'),
  password: configService.get<string>('DB_PASSWORD', ''),
  database: configService.get<string>('DB_DATABASE', 'phoenix'),
  entities: [
    'src/**/*.entity{.ts,.js}',
    'src/database/entities/*.entity{.ts,.js}',
  ],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false, // 마이그레이션 사용 시 false로 설정
  logging: true,
});
