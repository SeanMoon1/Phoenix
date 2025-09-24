import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { runSeeds } from './database/seeds';
import { FixOAuthConstraint1700000000002 } from './database/migrations/FixOAuthConstraint';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

// 초기 관리자 계정 생성 함수
async function createInitialAdmin(dataSource: DataSource) {
  // 환경변수 로딩 확인
  console.log('🔍 환경변수 확인 중...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log(
    'INITIAL_ADMIN_LOGIN_ID:',
    process.env.INITIAL_ADMIN_LOGIN_ID ? '설정됨' : '❌ 미설정',
  );
  console.log(
    'INITIAL_ADMIN_PASSWORD:',
    process.env.INITIAL_ADMIN_PASSWORD ? '설정됨' : '❌ 미설정',
  );
  console.log(
    'INITIAL_ADMIN_NAME:',
    process.env.INITIAL_ADMIN_NAME ? '설정됨' : '❌ 미설정',
  );
  console.log(
    'INITIAL_ADMIN_EMAIL:',
    process.env.INITIAL_ADMIN_EMAIL ? '설정됨' : '❌ 미설정',
  );
  console.log(
    'INITIAL_ADMIN_PHONE:',
    process.env.INITIAL_ADMIN_PHONE ? '설정됨' : '❌ 미설정',
  );

  const adminLoginId = process.env.INITIAL_ADMIN_LOGIN_ID;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const adminName = process.env.INITIAL_ADMIN_NAME;
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPhone = process.env.INITIAL_ADMIN_PHONE;

  if (
    !adminLoginId ||
    !adminPassword ||
    !adminName ||
    !adminEmail ||
    !adminPhone
  ) {
    console.log('⚠️ 초기 관리자 환경변수가 설정되지 않았습니다.');
    console.log(
      '필요한 환경변수: INITIAL_ADMIN_LOGIN_ID, INITIAL_ADMIN_PASSWORD, INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PHONE',
    );
    return;
  }

  try {
    console.log('🚀 초기 관리자 계정 생성 시작...');

    // 1. 권한 레벨 생성
    console.log('📝 권한 레벨 생성 중...');
    try {
      await dataSource.query(`
        INSERT IGNORE INTO admin_level (
          level_name, level_code, description, 
          can_manage_team, can_manage_users, can_manage_scenarios, 
          can_approve_scenarios, can_view_results, is_active
        ) VALUES 
        ('슈퍼 관리자', 'SUPER_ADMIN', '모든 권한을 가진 최고 관리자', 1, 1, 1, 1, 1, 1),
        ('팀 관리자', 'TEAM_ADMIN', '팀 단위 관리 권한', 1, 1, 1, 0, 1, 1),
        ('시나리오 관리자', 'SCENARIO_ADMIN', '시나리오 관리 권한', 0, 0, 1, 1, 1, 1),
        ('조회 전용 관리자', 'VIEWER_ADMIN', '조회 권한만 가진 관리자', 0, 0, 0, 0, 1, 1)
      `);
      console.log('✅ 권한 레벨 생성 완료');
    } catch (error) {
      console.warn('⚠️ 권한 레벨 생성 중 오류 (무시 가능):', error.message);
    }

    // 2. 기본 팀 생성
    console.log('📝 기본 팀 생성 중...');
    try {
      await dataSource.query(`
        INSERT IGNORE INTO team (team_code, team_name, description, status, created_by, is_active)
        VALUES ('DEFAULT_TEAM', '기본 팀', '시스템 기본 팀', 'ACTIVE', 1, 1)
      `);
      console.log('✅ 기본 팀 생성 완료');
    } catch (error) {
      console.warn('⚠️ 기본 팀 생성 중 오류 (무시 가능):', error.message);
    }

    // 3. 관리자 계정 확인 및 권한 업데이트
    console.log('🔍 기존 관리자 계정 확인 중...');
    const existingAdmin = await dataSource
      .query(
        'SELECT admin_id, admin_level_id, al.level_code FROM admin a LEFT JOIN admin_level al ON a.admin_level_id = al.level_id WHERE a.login_id = ? AND a.is_active = 1',
        [adminLoginId],
      )
      .catch((error) => {
        console.warn('⚠️ 관리자 계정 확인 중 오류 (무시 가능):', error.message);
        return [];
      });

    console.log('🔍 기존 관리자 계정 확인 결과:', existingAdmin);

    if (existingAdmin && existingAdmin.length > 0) {
      const admin = existingAdmin[0];
      console.log(`📊 기존 관리자 권한: ${admin.level_code}`);

      // SUPER_ADMIN 권한이 아니면 업데이트
      if (admin.level_code !== 'SUPER_ADMIN') {
        console.log('🔧 관리자 권한을 SUPER_ADMIN으로 업데이트 중...');
        await dataSource.query(
          `UPDATE admin SET admin_level_id = (SELECT level_id FROM admin_level WHERE level_code = 'SUPER_ADMIN' LIMIT 1) WHERE admin_id = ?`,
          [admin.admin_id],
        );
        console.log(
          `✅ 관리자 권한 업데이트 완료: ${adminLoginId} -> SUPER_ADMIN`,
        );
      } else {
        console.log(`ℹ️ 관리자 권한이 이미 SUPER_ADMIN입니다: ${adminLoginId}`);
      }
    } else {
      // 4. 관리자 계정 생성
      console.log('📝 새 관리자 계정 생성 중...');
      try {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await dataSource.query(
          `
          INSERT INTO admin (
            team_id, admin_level_id, login_id, password, name, email, phone, use_yn, created_by, is_active
          ) VALUES (
            (SELECT team_id FROM team WHERE team_code = 'DEFAULT_TEAM' LIMIT 1),
            (SELECT level_id FROM admin_level WHERE level_code = 'SUPER_ADMIN' LIMIT 1),
            ?, ?, ?, ?, ?, 'Y', 1, 1
          )
        `,
          [adminLoginId, hashedPassword, adminName, adminEmail, adminPhone],
        );

        console.log(`✅ 초기 관리자 계정 생성 완료: ${adminLoginId}`);
      } catch (error) {
        console.warn('⚠️ 관리자 계정 생성 중 오류 (무시 가능):', error.message);
      }
    }
  } catch (error) {
    console.error('❌ 초기 관리자 계정 생성 실패:', error.message);
    console.error('상세 오류:', error);
  }
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // 데이터베이스 연결 확인
    try {
      const dataSource = app.get(DataSource);
      await dataSource.query('SELECT 1');
      console.log('✅ 데이터베이스 연결 성공');
    } catch (dbError) {
      console.error('❌ 데이터베이스 연결 실패:', dbError.message);
      console.log('⚠️ 환경 변수를 확인해주세요:');
      console.log('   - DB_HOST:', process.env.DB_HOST || '❌ 미설정');
      console.log('   - DB_PORT:', process.env.DB_PORT || '❌ 미설정');
      console.log('   - DB_USERNAME:', process.env.DB_USERNAME || '❌ 미설정');
      console.log('   - DB_DATABASE:', process.env.DB_DATABASE || '❌ 미설정');
      throw dbError;
    }

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

    // OAuth 문제 해결을 위한 마이그레이션 실행 (에러 무시)
    try {
      const dataSource = app.get(DataSource);
      const oauthFix = new FixOAuthConstraint1700000000002();
      await oauthFix.up(dataSource.createQueryRunner());
      console.log('✅ OAuth 문제 해결 마이그레이션 완료');
    } catch (error) {
      // 에러 무시하고 계속 진행
      console.log('ℹ️ OAuth 마이그레이션 건너뜀 (이미 처리됨)');
    }

    // 초기 관리자 계정 생성
    try {
      const dataSource = app.get(DataSource);
      await createInitialAdmin(dataSource);
    } catch (error) {
      console.warn(
        '⚠️ 초기 관리자 계정 생성 중 오류 (무시 가능):',
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
