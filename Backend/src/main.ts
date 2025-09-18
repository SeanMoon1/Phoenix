import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { runSeeds } from './database/seeds';
import { FixOAuthConstraint1700000000002 } from './database/migrations/FixOAuthConstraint';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // CORS 설정
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://www.phoenix-4.com',
        'https://phoenix-4.com',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // Swagger 설정
    const config = new DocumentBuilder()
      .setTitle('Phoenix Training Platform API')
      .setDescription('Phoenix 훈련 플랫폼 API 문서')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // OAuth 문제 해결을 위한 마이그레이션 실행
    try {
      const dataSource = app.get(DataSource);
      const oauthFix = new FixOAuthConstraint1700000000002();
      await oauthFix.up(dataSource.createQueryRunner());
      console.log('✅ OAuth 문제 해결 마이그레이션 완료');
    } catch (error) {
      console.warn(
        '⚠️ OAuth 마이그레이션 실행 중 오류 (무시 가능):',
        error.message,
      );
    }

    // 개발 환경에서만 시드 실행
    if (process.env.NODE_ENV === 'development') {
      try {
        const dataSource = app.get(DataSource);
        await runSeeds(dataSource);
      } catch (error) {
        console.warn('⚠️ 시드 실행 중 오류 (무시 가능):', error.message);
      }
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Phoenix Backend 서버가 포트 ${port}에서 실행 중입니다.`);
    console.log(`📚 API 문서: http://localhost:${port}/api`);
  } catch (error) {
    console.error('❌ 애플리케이션 시작 중 오류:', error.message);
    console.log('⚠️ 데이터베이스 연결 실패로 인한 오류일 수 있습니다.');
    console.log(
      '⚠️ 환경 변수(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE)를 확인해주세요.',
    );
    process.exit(1);
  }
}

bootstrap();
