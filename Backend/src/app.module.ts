import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Clean Architecture 구조에 맞는 새로운 app.module.ts
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Presentation Layer - Controllers
import { AuthController } from './presentation/controllers/auth.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { ScenariosController } from './presentation/controllers/scenarios.controller';
import { TrainingController } from './presentation/controllers/training.controller';
import { TeamsController } from './presentation/controllers/teams.controller';
import { AdminController } from './presentation/controllers/admin.controller';

// Application Layer - Services
import { AuthService } from './application/services/auth.service';
import { UsersService } from './application/services/users.service';
import { ScenariosService } from './application/services/scenarios.service';
import { TrainingService } from './application/services/training.service';

// Domain Layer - Entities
import { User } from './domain/entities/user.entity';
import { Scenario } from './domain/entities/scenario.entity';
import { TrainingSession } from './domain/entities/training-session.entity';
import { Team } from './domain/entities/team.entity';

// Infrastructure Layer - Database
import { getDatabaseConfig } from './infrastructure/config/database.config';

// Shared Layer
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    // Domain entities registration
    TypeOrmModule.forFeature([User, Scenario, TrainingSession, Team]),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    ScenariosController,
    TrainingController,
    TeamsController,
    AdminController,
  ],
  providers: [
    AppService,
    AuthService,
    UsersService,
    ScenariosService,
    TrainingService,
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
