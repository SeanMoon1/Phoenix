import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS 설정 - 환경 변수에서 가져오기
  const corsOrigins = configService
    .get(
      'CORS_ORIGIN',
      'http://43.203.112.213:3000,http://43.203.112.213,https://www.phoenix-4.com,https://api.phoenix-4.com',
    )
    .split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Swagger 설정 - 환경 변수에서 가져오기
  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get('APP_NAME', 'Phoenix Training Platform API'))
    .setDescription('Phoenix 훈련 플랫폼 API 문서')
    .setVersion(configService.get('APP_VERSION', '1.0'))
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // 시드 기능은 향후 구현 예정

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 Phoenix Backend 서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`📚 API 문서: http://43.203.112.213:${port}/api`);
  console.log(`🌍 CORS Origins: ${corsOrigins.join(', ')}`);
}

bootstrap();
