import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// 환경 변수 로드
config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    'src/domain/entities/*.entity{.ts,.js}',
    'src/database/entities/*.entity{.ts,.js}',
  ],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  extra: {
    connectTimeout: 10000,
    waitForConnections: true,
    queueLimit: 0,
  },
});
