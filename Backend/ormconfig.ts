import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// 환경 변수 로드
config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '43.203.112.213',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'F12oGsLp4y6T6fJyrRW9',
  database: process.env.DB_DATABASE || 'phoenix',
  entities: [
    'src/**/*.entity{.ts,.js}',
    'src/database/entities/*.entity{.ts,.js}',
  ],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development', // 개발 환경에서만 true
  logging: process.env.NODE_ENV === 'development',
  // 연결 풀 설정
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },
  // SSL 설정 (AWS RDS 사용 시)
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});
