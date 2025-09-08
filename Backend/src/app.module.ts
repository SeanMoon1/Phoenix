import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { ScenariosModule } from './modules/scenarios/scenarios.module';
import { TrainingModule } from './modules/training/training.module';
import { TrainingResultsModule } from './modules/training-results/training-results.module';
import { SupportModule } from './modules/support/support.module';
import { UserProgressModule } from './modules/user-progress/user-progress.module';
import { CodesModule } from './modules/codes/codes.module';
import { AdminModule } from './modules/admin/admin.module';
import { CommonModule } from './modules/common/common.module';
import { getDatabaseConfig } from './config/database.config';
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
    AuthModule,
    UsersModule,
    TeamsModule,
    ScenariosModule,
    TrainingModule,
    TrainingResultsModule,
    SupportModule,
    UserProgressModule,
    CodesModule,
    AdminModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
