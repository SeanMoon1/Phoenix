import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

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
import { TeamsController } from './presentation/controllers/teams.controller';
import { AdminController } from './presentation/controllers/admin.controller';
import { ScenarioImportController } from './presentation/controllers/scenario-import.controller';

// Application Layer - Services
import { AuthService } from './application/services/auth.service';
import { UsersService } from './application/services/users.service';
import { ScenariosService } from './application/services/scenarios.service';
import { TrainingService } from './application/services/training.service';
import { TrainingResultService } from './application/services/training-result.service';
import { TeamsService } from './application/services/teams.service';
import { AdminService } from './application/services/admin.service';
import { ScenarioImportService } from './application/services/scenario-import.service';

// Application Layer - Use Cases
import { CreateUserUseCase } from './application/use-cases/user/create-user.use-case';

// Domain Layer - Entities
import { User } from './domain/entities/user.entity';
import { Scenario } from './domain/entities/scenario.entity';
import { TrainingSession } from './domain/entities/training-session.entity';
import { TrainingResult } from './domain/entities/training-result.entity';
import { UserScenarioStats } from './domain/entities/user-scenario-stats.entity';
import { Team } from './domain/entities/team.entity';
import { TrainingParticipant } from './infrastructure/database/entities/training-participant.entity';
import { Admin } from './domain/entities/admin.entity';

// Infrastructure Layer - Database
import { getDatabaseConfig } from './infrastructure/config/database.config';
import oauthConfig from './infrastructure/config/oauth.config';

// Shared Layer
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { LocalStrategy } from './shared/strategies/local.strategy';
import { JwtStrategy } from './shared/strategies/jwt.strategy';
import { GoogleStrategy } from './shared/strategies/google.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [oauthConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    // Domain entities registration
    TypeOrmModule.forFeature([
      User,
      Scenario,
      TrainingSession,
      TrainingResult,
      UserScenarioStats,
      Team,
      TrainingParticipant,
      Admin,
    ]),
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
    TeamsController,
    AdminController,
    ScenarioImportController,
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
    ScenarioImportService,
    // CreateUserUseCase, // 임시 비활성화 - Repository 주입 문제
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
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
