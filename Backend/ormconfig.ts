import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// 환경 변수 로드
config();

// 환경별 DB 설정
const isDevelopment = process.env.NODE_ENV === 'development';
const dbConfig = {
  host: isDevelopment
    ? process.env.DB_HOST_DEV || 'localhost'
    : process.env.DB_HOST_PROD || process.env.DB_HOST || 'localhost',
  port: isDevelopment
    ? parseInt(process.env.DB_PORT_DEV, 10) || 3306
    : parseInt(process.env.DB_PORT_PROD || process.env.DB_PORT, 10) || 3306,
  username: isDevelopment
    ? process.env.DB_USERNAME_DEV || 'root'
    : process.env.DB_USERNAME_PROD || process.env.DB_USERNAME || 'root',
  password: isDevelopment
    ? process.env.DB_PASSWORD_DEV || ''
    : process.env.DB_PASSWORD_PROD || process.env.DB_PASSWORD || '',
  database: isDevelopment
    ? process.env.DB_DATABASE_DEV || 'phoenix'
    : process.env.DB_DATABASE_PROD || process.env.DB_DATABASE || 'phoenix',
};

export default new DataSource({
  type: 'mysql',
  ...dbConfig,
  entities: [
    'src/domain/entities/*.entity{.ts,.js}',
    'src/database/entities/*.entity{.ts,.js}',
  ],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development', // 개발 환경에서만 true
  logging: process.env.NODE_ENV === 'development',
  // 연결 풀 설정 (올바른 위치)
  acquireTimeout: 60000,
  timeout: 60000,
  extra: {
    connectionLimit: 10,
  },
  // SSL 설정 (AWS RDS 사용 시)
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});
