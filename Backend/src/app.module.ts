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
import { UserExpController } from './presentation/controllers/user-exp.controller';
import { TeamsController } from './presentation/controllers/teams.controller';
import { AdminController } from './presentation/controllers/admin.controller';
import { AdminAuthController } from './presentation/controllers/admin-auth.controller';
import { ContactController } from './presentation/controllers/contact.controller';
import { ExcelExportController } from './presentation/controllers/excel-export.controller';
import { GmailController } from './presentation/controllers/gmail.controller';
import { TeamStatsController } from './presentation/controllers/team-stats.controller';

// Security Services
import { JwtSecurityService } from './application/services/jwt-security.service';
import { RefreshTokenService } from './application/services/refresh-token.service';

// Application Layer - Services
import { AuthService } from './application/services/auth.service';
import { UsersService } from './application/services/users.service';
import { ScenariosService } from './application/services/scenarios.service';
import { TrainingService } from './application/services/training.service';
import { TrainingResultService } from './application/services/training-result.service';
import { UserExpService } from './application/services/user-exp.service';
import { TeamsService } from './application/services/teams.service';
import { AdminService } from './application/services/admin.service';
import { EmailService } from './application/services/email.service';
import { GmailService } from './application/services/gmail.service';
import { MemoryAuthService } from './application/services/memory-auth.service';
import { ExcelExportService } from './application/services/excel-export.service';
import { PdfExportService } from './application/services/pdf-export.service';

// Domain Layer - Services
import { UserDomainService } from './domain/services/user-domain.service';

// Application Layer - Use Cases
import { CreateUserUseCase } from './application/use-cases/user/create-user.use-case';
import { GetUserUseCase } from './application/use-cases/user/get-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/user/update-user.use-case';

// Infrastructure Layer - Repository Implementations
import { RepositoriesModule } from './infrastructure/database/repositories/repositories.module';
import { TypeOrmUserRepository } from './infrastructure/database/repositories/user.repository.impl';

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
import { Admin } from './domain/entities/admin.entity';
import { AdminLevel } from './domain/entities/admin-level.entity';

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
import { AdminStrategy } from './shared/strategies/admin.strategy';

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
      Admin,
      AdminLevel,
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
        signOptions: { expiresIn: '15m' }, // 15분으로 단축
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
    UserExpController,
    TeamsController,
    AdminController,
    AdminAuthController,
    ContactController,
    ExcelExportController,
    GmailController,
    TeamStatsController,
  ],
  providers: [
    AppService,
    AuthService,
    UsersService,
    ScenariosService,
    TrainingService,
    TrainingResultService,
    UserExpService,
    TeamsService,
    AdminService,
    EmailService,
    GmailService,
    JwtSecurityService,
    RefreshTokenService,
    MemoryAuthService,
    ExcelExportService,
    PdfExportService,
    // Domain Services
    UserDomainService,
    // Use Cases
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    // Strategies
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
    AdminStrategy,
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
