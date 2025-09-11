import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { runSeeds } from './database/seeds';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix 설정
  app.setGlobalPrefix('api');

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
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
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
}

bootstrap();
