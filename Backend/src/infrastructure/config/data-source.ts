import { DataSource } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Team } from '../../domain/entities/team.entity';
import { Scenario } from '../../domain/entities/scenario.entity';
import { TrainingSession } from '../../domain/entities/training-session.entity';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import { UserScenarioStats } from '../../domain/entities/user-scenario-stats.entity';
import { ScenarioScene } from '../../domain/entities/scenario-scene.entity';
import { ScenarioEvent } from '../../domain/entities/scenario-event.entity';
import { ChoiceOption } from '../../domain/entities/choice-option.entity';
import { TrainingParticipant } from '../../domain/entities/training-participant.entity';
import { UserChoiceLog } from '../../domain/entities/user-choice-log.entity';
import { Inquiry } from '../../domain/entities/inquiry.entity';
import { Faq } from '../../domain/entities/faq.entity';
import { UserProgress } from '../../domain/entities/user-progress.entity';
import { Achievement } from '../../domain/entities/achievement.entity';
import { UserLevelHistory } from '../../domain/entities/user-level-history.entity';

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

export const AppDataSource = new DataSource({
  type: 'mysql',
  ...dbConfig,
  entities: [
    User,
    Team,
    Scenario,
    TrainingSession,
    TrainingResult,
    UserScenarioStats,
    ScenarioScene,
    ScenarioEvent,
    ChoiceOption,
    TrainingParticipant,
    UserChoiceLog,
    Inquiry,
    Faq,
    UserProgress,
    Achievement,
    UserLevelHistory,
  ],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/database/subscribers/*.ts'],
});
