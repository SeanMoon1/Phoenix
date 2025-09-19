import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DataSource } from 'typeorm';

// Clean Architecture 구조에 맞는 새로운 app.module.ts
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Presentation Layer - Controllers
import { AuthController } from './presentation/controllers/auth.controller';
import { OAuthController } from './presentation/controllers/oauth.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { ScenariosController } from './presentation/controllers/scenarios.controller';
import { TrainingController } from './presentation/controllers/training.controller';
import { TrainingResultController } from './presentation/controllers/training-result.controller';
import { UserProgressController } from './presentation/controllers/user-progress.controller';
import { TeamsController } from './presentation/controllers/teams.controller';
import { AdminController } from './presentation/controllers/admin.controller';

// Application Layer - Services
import { AuthService } from './application/services/auth.service';
import { UsersService } from './application/services/users.service';
import { ScenariosService } from './application/services/scenarios.service';
import { TrainingService } from './application/services/training.service';
import { TrainingResultService } from './application/services/training-result.service';
import { TeamsService } from './application/services/teams.service';
import { AdminService } from './application/services/admin.service';

// Domain Layer - Services
import { UserDomainService } from './domain/services/user-domain.service';

// Application Layer - Use Cases
import { CreateUserUseCase } from './application/use-cases/user/create-user.use-case';
import { GetUserUseCase } from './application/use-cases/user/get-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/user/update-user.use-case';

// Infrastructure Layer - Repository Implementations
import { RepositoriesModule } from './infrastructure/database/repositories/repositories.module';
import { TypeOrmUserRepository } from './infrastructure/database/repositories/user.repository.impl';
import { TypeOrmScenarioRepository } from './infrastructure/database/repositories/scenario.repository.impl';
import { TypeOrmTeamRepository } from './infrastructure/database/repositories/team.repository.impl';
import { TypeOrmTrainingSessionRepository } from './infrastructure/database/repositories/training-session.repository.impl';

// Domain Layer - Entities
import { User } from './domain/entities/user.entity';
import { Scenario } from './domain/entities/scenario.entity';
import { TrainingSession } from './domain/entities/training-session.entity';
import { TrainingResult } from './domain/entities/training-result.entity';
import { UserScenarioStats } from './domain/entities/user-scenario-stats.entity';
import { Team } from './domain/entities/team.entity';
import { TrainingParticipant } from './domain/entities/training-participant.entity';
import { ScenarioScene } from './domain/entities/scenario-scene.entity';
import { ScenarioEvent } from './domain/entities/scenario-event.entity';
import { ChoiceOption } from './domain/entities/choice-option.entity';
import { UserChoiceLog } from './domain/entities/user-choice-log.entity';
import { UserProgress } from './domain/entities/user-progress.entity';
import { Achievement } from './domain/entities/achievement.entity';
import { UserLevelHistory } from './domain/entities/user-level-history.entity';
import { Inquiry } from './domain/entities/inquiry.entity';
import { Faq } from './domain/entities/faq.entity';

// Infrastructure Layer - Database
import { getDatabaseConfig } from './infrastructure/config/database.config';
import oauthConfig from './infrastructure/config/oauth.config';

// Shared Layer
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { LocalStrategy } from './shared/strategies/local.strategy';
import { JwtStrategy } from './shared/strategies/jwt.strategy';
import { GoogleStrategy } from './shared/strategies/google.strategy';
import { NaverStrategy } from './shared/strategies/naver.strategy';
import { KakaoStrategy } from './shared/strategies/kakao.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'], // NODE_ENV 우선
      load: [oauthConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    RepositoriesModule,
    // Domain entities registration
    TypeOrmModule.forFeature([
      User,
      Scenario,
      TrainingSession,
      TrainingResult,
      UserScenarioStats,
      Team,
      TrainingParticipant,
      ScenarioScene,
      ScenarioEvent,
      ChoiceOption,
      UserChoiceLog,
      UserProgress,
      Achievement,
      UserLevelHistory,
      Inquiry,
      Faq,
    ]),
    // Database module with entities (removed - using TypeOrmModule.forFeature directly)
    // JWT and Passport modules
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'default-jwt-secret-change-in-production',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    OAuthController,
    UsersController,
    ScenariosController,
    TrainingController,
    TrainingResultController,
    UserProgressController,
    TeamsController,
    AdminController,
  ],
  providers: [
    AppService,
    AuthService,
    UsersService,
    ScenariosService,
    TrainingService,
    TrainingResultService,
    TeamsService,
    AdminService,
    // Domain Services
    UserDomainService,
    // Use Cases
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    // Repository Implementations
    {
      provide: 'UserRepository',
      useFactory: (typeOrmUserRepository: TypeOrmUserRepository) =>
        typeOrmUserRepository,
      inject: [TypeOrmUserRepository],
    },
    TypeOrmScenarioRepository,
    {
      provide: 'ScenarioRepository',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(Scenario),
      inject: [DataSource],
    },
    TypeOrmTeamRepository,
    {
      provide: 'TeamRepository',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Team),
      inject: [DataSource],
    },
    TypeOrmTrainingSessionRepository,
    {
      provide: 'TrainingSessionRepository',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(TrainingSession),
      inject: [DataSource],
    },
    // Strategies
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
    // Global Filters and Interceptors
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
