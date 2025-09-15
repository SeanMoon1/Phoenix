import { DataSource } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Team } from '../../domain/entities/team.entity';
import { Scenario } from '../../domain/entities/scenario.entity';
import { TrainingSession } from '../../domain/entities/training-session.entity';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import { UserScenarioStats } from '../../domain/entities/user-scenario-stats.entity';
import { Admin } from '../../domain/entities/admin.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: '43.203.112.213',
  port: 3306,
  username: 'admin',
  password: 'F12oGsLp4y6T6fJyrRW9',
  database: 'phoenix',
  entities: [
    User,
    Team,
    Scenario,
    TrainingSession,
    TrainingResult,
    UserScenarioStats,
    Admin,
  ],
  synchronize: true,
  logging: true,
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/database/subscribers/*.ts'],
});