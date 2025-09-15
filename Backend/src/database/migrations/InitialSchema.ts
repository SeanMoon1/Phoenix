import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704067200000 implements MigrationInterface {
  name = 'InitialSchema1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 팀 정보 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`team\` (
        \`team_id\` bigint NOT NULL AUTO_INCREMENT,
        \`team_code\` varchar(50) NOT NULL,
        \`team_name\` varchar(100) NOT NULL,
        \`description\` text,
        \`status\` varchar(20) NOT NULL DEFAULT 'ACTIVE',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`created_by\` bigint,
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`team_id\`),
        UNIQUE KEY \`UQ_team_code\` (\`team_code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. 권한 레벨 정의 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`admin_level\` (
        \`level_id\` int NOT NULL AUTO_INCREMENT,
        \`level_name\` varchar(50) NOT NULL,
        \`level_code\` varchar(20) NOT NULL,
        \`description\` text,
        \`can_manage_team\` tinyint NOT NULL DEFAULT 0,
        \`can_manage_users\` tinyint NOT NULL DEFAULT 0,
        \`can_manage_scenarios\` tinyint NOT NULL DEFAULT 0,
        \`can_approve_scenarios\` tinyint NOT NULL DEFAULT 0,
        \`can_view_results\` tinyint NOT NULL DEFAULT 0,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`level_id\`),
        UNIQUE KEY \`UQ_level_code\` (\`level_code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. 관리자 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`admin\` (
        \`admin_id\` bigint NOT NULL AUTO_INCREMENT,
        \`team_id\` bigint NOT NULL,
        \`admin_level_id\` int NOT NULL,
        \`login_id\` varchar(50) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`email\` varchar(200) NOT NULL,
        \`phone\` varchar(20) NOT NULL,
        \`permissions\` text,
        \`use_yn\` char(1) NOT NULL DEFAULT 'Y',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`created_by\` bigint NOT NULL,
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`admin_id\`),
        UNIQUE KEY \`UQ_login_id\` (\`login_id\`),
        KEY \`FK_admin_team\` (\`team_id\`),
        KEY \`FK_admin_level\` (\`admin_level_id\`),
        CONSTRAINT \`FK_admin_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_admin_level\` FOREIGN KEY (\`admin_level_id\`) REFERENCES \`admin_level\` (\`level_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. 사용자 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`user\` (
        \`user_id\` bigint NOT NULL AUTO_INCREMENT,
        \`team_id\` bigint,
        \`user_code\` varchar(50),
        \`login_id\` varchar(50) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`email\` varchar(200) NOT NULL,
        \`oauth_provider\` varchar(50),
        \`oauth_provider_id\` varchar(100),
        \`profile_image_url\` varchar(500),
        \`use_yn\` char(1) NOT NULL DEFAULT 'Y',
        \`user_level\` int NOT NULL DEFAULT 1,
        \`user_exp\` bigint NOT NULL DEFAULT 0,
        \`total_score\` bigint NOT NULL DEFAULT 0,
        \`completed_scenarios\` int NOT NULL DEFAULT 0,
        \`current_tier\` varchar(20) NOT NULL DEFAULT '초급자',
        \`level_progress\` decimal(5,2) NOT NULL DEFAULT 0.00,
        \`next_level_exp\` bigint NOT NULL DEFAULT 100,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`user_id\`),
        UNIQUE KEY \`UQ_login_id\` (\`login_id\`),
        UNIQUE KEY \`UQ_email\` (\`email\`),
        KEY \`FK_user_team\` (\`team_id\`),
        UNIQUE KEY \`uk_team_user_code\` (\`team_id\`, \`user_code\`),
        UNIQUE KEY \`uk_team_user_login\` (\`team_id\`, \`login_id\`),
        UNIQUE KEY \`uk_team_email\` (\`team_id\`, \`email\`),
        UNIQUE KEY \`uk_team_name\` (\`team_id\`, \`name\`),
        CONSTRAINT \`FK_user_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 5. 코드 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`code\` (
        \`code_id\` bigint NOT NULL AUTO_INCREMENT,
        \`team_id\` bigint,
        \`code_class\` varchar(100) NOT NULL,
        \`code_name\` varchar(100) NOT NULL,
        \`code_value\` varchar(100) NOT NULL,
        \`code_desc\` varchar(500),
        \`code_order\` int NOT NULL,
        \`use_yn\` char(1) NOT NULL DEFAULT 'Y',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`created_by\` bigint,
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`code_id\`),
        KEY \`FK_code_team\` (\`team_id\`),
        CONSTRAINT \`FK_code_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 6. 시나리오 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`scenario\` (
        \`scenario_id\` bigint NOT NULL AUTO_INCREMENT,
        \`team_id\` bigint NOT NULL,
        \`scenario_code\` varchar(50) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`disaster_type\` varchar(50) NOT NULL,
        \`description\` text NOT NULL,
        \`risk_level\` varchar(20) NOT NULL,
        \`difficulty\` varchar(20) NOT NULL DEFAULT 'easy',
        \`approval_status\` varchar(20) NOT NULL DEFAULT 'DRAFT',
        \`occurrence_condition\` text,
        \`status\` varchar(20) NOT NULL DEFAULT '임시저장',
        \`approval_comment\` text,
        \`image_url\` varchar(500),
        \`video_url\` varchar(500),
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`created_by\` bigint NOT NULL,
        \`approved_at\` datetime(6),
        \`approved_by\` bigint,
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`scenario_id\`),
        UNIQUE KEY \`uk_team_scenario_code\` (\`team_id\`, \`scenario_code\`),
        KEY \`FK_scenario_team\` (\`team_id\`),
        CONSTRAINT \`FK_scenario_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 7. 시나리오 씬 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`scenario_scene\` (
        \`scene_id\` bigint NOT NULL AUTO_INCREMENT,
        \`scenario_id\` bigint NOT NULL,
        \`scene_code\` varchar(50) NOT NULL,
        \`scene_order\` int NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`content\` text NOT NULL,
        \`scene_script\` text NOT NULL,
        \`image_url\` varchar(500),
        \`video_url\` varchar(500),
        \`estimated_time\` int,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`created_by\` bigint NOT NULL,
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`scene_id\`),
        UNIQUE KEY \`uk_scenario_scene_code\` (\`scenario_id\`, \`scene_code\`),
        UNIQUE KEY \`uk_scenario_scene_order\` (\`scenario_id\`, \`scene_order\`),
        KEY \`idx_scenario_scene_order\` (\`scenario_id\`, \`scene_order\`),
        CONSTRAINT \`FK_scene_scenario\` FOREIGN KEY (\`scenario_id\`) REFERENCES \`scenario\` (\`scenario_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 8. 시나리오 이벤트 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`scenario_event\` (
        \`event_id\` bigint NOT NULL AUTO_INCREMENT,
        \`scenario_id\` bigint NOT NULL,
        \`event_code\` varchar(50) NOT NULL,
        \`event_order\` int NOT NULL,
        \`event_description\` text NOT NULL,
        \`event_type\` varchar(50) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`created_by\` bigint NOT NULL,
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`event_id\`),
        UNIQUE KEY \`uk_scenario_event_code\` (\`scenario_id\`, \`event_code\`),
        KEY \`FK_event_scenario\` (\`scenario_id\`),
        CONSTRAINT \`FK_event_scenario\` FOREIGN KEY (\`scenario_id\`) REFERENCES \`scenario\` (\`scenario_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 9. 선택 옵션 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`choice_option\` (
        \`choice_id\` bigint NOT NULL AUTO_INCREMENT,
        \`event_id\` bigint NOT NULL,
        \`scenario_id\` bigint NOT NULL,
        \`scene_id\` bigint,
        \`choice_code\` varchar(50) NOT NULL,
        \`choice_text\` varchar(500) NOT NULL,
        \`is_correct\` tinyint NOT NULL,
        \`speed_points\` int NOT NULL DEFAULT 0,
        \`accuracy_points\` int NOT NULL DEFAULT 0,
        \`exp_points\` int NOT NULL DEFAULT 0,
        \`reaction_text\` text,
        \`next_scene_code\` varchar(50),
        \`score_weight\` int NOT NULL,
        \`next_event_id\` bigint,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`created_by\` bigint,
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`choice_id\`),
        UNIQUE KEY \`uk_event_choice_code\` (\`event_id\`, \`choice_code\`),
        KEY \`idx_scene_options\` (\`scene_id\`),
        KEY \`idx_next_scene\` (\`next_scene_code\`),
        KEY \`FK_choice_event\` (\`event_id\`),
        KEY \`FK_choice_scenario\` (\`scenario_id\`),
        KEY \`FK_choice_scene\` (\`scene_id\`),
        KEY \`FK_choice_next_event\` (\`next_event_id\`),
        CONSTRAINT \`FK_choice_event\` FOREIGN KEY (\`event_id\`) REFERENCES \`scenario_event\` (\`event_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_choice_scenario\` FOREIGN KEY (\`scenario_id\`) REFERENCES \`scenario\` (\`scenario_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_choice_scene\` FOREIGN KEY (\`scene_id\`) REFERENCES \`scenario_scene\` (\`scene_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_choice_next_event\` FOREIGN KEY (\`next_event_id\`) REFERENCES \`scenario_event\` (\`event_id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 10. 훈련 세션 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`training_session\` (
        \`session_id\` bigint NOT NULL AUTO_INCREMENT,
        \`team_id\` bigint NOT NULL,
        \`scenario_id\` bigint NOT NULL,
        \`session_code\` varchar(50) NOT NULL,
        \`session_name\` varchar(200) NOT NULL,
        \`session_description\` text,
        \`start_time\` datetime(6) NOT NULL,
        \`end_time\` datetime(6),
        \`status\` varchar(20) NOT NULL DEFAULT 'SCHEDULED',
        \`max_participants\` int NOT NULL DEFAULT 10,
        \`current_participants\` int NOT NULL DEFAULT 0,
        \`session_data\` longtext,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`created_by\` bigint NOT NULL,
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`session_id\`),
        UNIQUE KEY \`UQ_session_code\` (\`session_code\`),
        KEY \`FK_session_team\` (\`team_id\`),
        KEY \`FK_session_scenario\` (\`scenario_id\`),
        CONSTRAINT \`FK_session_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_session_scenario\` FOREIGN KEY (\`scenario_id\`) REFERENCES \`scenario\` (\`scenario_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 8. 훈련 참가자 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`training_participant\` (
        \`participant_id\` bigint NOT NULL AUTO_INCREMENT,
        \`session_id\` bigint NOT NULL,
        \`team_id\` bigint NOT NULL,
        \`scenario_id\` bigint NOT NULL,
        \`user_id\` bigint NOT NULL,
        \`participant_code\` varchar(50) NOT NULL,
        \`joined_at\` datetime(6) NOT NULL,
        \`status\` varchar(20) NOT NULL DEFAULT '참여중',
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`participant_id\`),
        KEY \`FK_participant_session\` (\`session_id\`),
        KEY \`FK_participant_team\` (\`team_id\`),
        KEY \`FK_participant_scenario\` (\`scenario_id\`),
        KEY \`FK_participant_user\` (\`user_id\`),
        CONSTRAINT \`FK_participant_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`training_session\` (\`session_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_participant_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_participant_scenario\` FOREIGN KEY (\`scenario_id\`) REFERENCES \`scenario\` (\`scenario_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_participant_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`user_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 9. 훈련 결과 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`training_result\` (
        \`result_id\` bigint NOT NULL AUTO_INCREMENT,
        \`session_id\` bigint NOT NULL,
        \`user_id\` bigint NOT NULL,
        \`scenario_id\` bigint NOT NULL,
        \`team_id\` bigint NOT NULL,
        \`participant_id\` bigint NOT NULL,
        \`result_code\` varchar(50) NOT NULL,
        \`score\` decimal(10,2) NOT NULL DEFAULT 0.00,
        \`max_score\` decimal(10,2) NOT NULL DEFAULT 100.00,
        \`completion_time\` int NOT NULL DEFAULT 0,
        \`completion_rate\` decimal(5,2) NOT NULL DEFAULT 0.00,
        \`correct_answers\` int NOT NULL DEFAULT 0,
        \`total_questions\` int NOT NULL DEFAULT 0,
        \`result_data\` longtext,
        \`feedback\` text,
        \`status\` varchar(20) NOT NULL DEFAULT 'COMPLETED',
        \`started_at\` datetime(6) NOT NULL,
        \`completed_at\` datetime(6),
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`created_by\` bigint NOT NULL,
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`result_id\`),
        UNIQUE KEY \`UQ_result_code\` (\`result_code\`),
        KEY \`FK_result_session\` (\`session_id\`),
        KEY \`FK_result_user\` (\`user_id\`),
        KEY \`FK_result_scenario\` (\`scenario_id\`),
        KEY \`FK_result_team\` (\`team_id\`),
        KEY \`FK_result_participant\` (\`participant_id\`),
        CONSTRAINT \`FK_result_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`training_session\` (\`session_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_result_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`user_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_result_scenario\` FOREIGN KEY (\`scenario_id\`) REFERENCES \`scenario\` (\`scenario_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_result_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_result_participant\` FOREIGN KEY (\`participant_id\`) REFERENCES \`training_participant\` (\`participant_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 11. 사용자 선택 로그 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`user_choice_log\` (
        \`log_id\` bigint NOT NULL AUTO_INCREMENT,
        \`result_id\` bigint NOT NULL,
        \`event_id\` bigint NOT NULL,
        \`choice_id\` bigint NOT NULL,
        \`log_code\` varchar(50) NOT NULL,
        \`response_time\` int NOT NULL,
        \`is_correct\` tinyint NOT NULL,
        \`selected_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`log_id\`),
        UNIQUE KEY \`uk_result_log_code\` (\`result_id\`, \`log_code\`),
        KEY \`FK_log_result\` (\`result_id\`),
        KEY \`FK_log_event\` (\`event_id\`),
        KEY \`FK_log_choice\` (\`choice_id\`),
        CONSTRAINT \`FK_log_result\` FOREIGN KEY (\`result_id\`) REFERENCES \`training_result\` (\`result_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_log_event\` FOREIGN KEY (\`event_id\`) REFERENCES \`scenario_event\` (\`event_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_log_choice\` FOREIGN KEY (\`choice_id\`) REFERENCES \`choice_option\` (\`choice_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 12. 문의사항 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`inquiry\` (
        \`inquiry_id\` bigint NOT NULL AUTO_INCREMENT,
        \`team_id\` bigint NOT NULL,
        \`user_id\` bigint NOT NULL,
        \`inquiry_code\` varchar(50) NOT NULL,
        \`category\` varchar(100) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`content\` text NOT NULL,
        \`status\` varchar(20) NOT NULL DEFAULT '접수',
        \`admin_response\` text,
        \`responded_at\` datetime(6),
        \`responded_by\` bigint,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`inquiry_id\`),
        UNIQUE KEY \`uk_team_inquiry_code\` (\`team_id\`, \`inquiry_code\`),
        KEY \`FK_inquiry_team\` (\`team_id\`),
        KEY \`FK_inquiry_user\` (\`user_id\`),
        KEY \`FK_inquiry_responded_by\` (\`responded_by\`),
        CONSTRAINT \`FK_inquiry_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_inquiry_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`user_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_inquiry_responded_by\` FOREIGN KEY (\`responded_by\`) REFERENCES \`admin\` (\`admin_id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 13. FAQ 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`faq\` (
        \`faq_id\` bigint NOT NULL AUTO_INCREMENT,
        \`team_id\` bigint NOT NULL,
        \`faq_code\` varchar(50) NOT NULL,
        \`category\` varchar(100) NOT NULL,
        \`question\` text NOT NULL,
        \`answer\` text NOT NULL,
        \`order_num\` int NOT NULL,
        \`use_yn\` char(1) NOT NULL DEFAULT 'Y',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`created_by\` bigint NOT NULL,
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`faq_id\`),
        UNIQUE KEY \`uk_team_faq_code\` (\`team_id\`, \`faq_code\`),
        KEY \`FK_faq_team\` (\`team_id\`),
        CONSTRAINT \`FK_faq_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 14. 사용자 진행 상황 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`user_progress\` (
        \`progress_id\` bigint NOT NULL AUTO_INCREMENT,
        \`user_id\` bigint NOT NULL,
        \`team_id\` bigint NOT NULL,
        \`user_level\` int NOT NULL DEFAULT 1,
        \`user_exp\` bigint NOT NULL DEFAULT 0,
        \`total_score\` bigint NOT NULL DEFAULT 0,
        \`completed_scenarios\` int NOT NULL DEFAULT 0,
        \`current_streak\` int NOT NULL DEFAULT 0,
        \`longest_streak\` int NOT NULL DEFAULT 0,
        \`last_completed_at\` datetime(6),
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`progress_id\`),
        UNIQUE KEY \`uk_user_progress\` (\`user_id\`),
        KEY \`FK_progress_user\` (\`user_id\`),
        KEY \`FK_progress_team\` (\`team_id\`),
        CONSTRAINT \`FK_progress_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`user_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_progress_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 15. 성취 시스템 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`achievement\` (
        \`achievement_id\` bigint NOT NULL AUTO_INCREMENT,
        \`user_id\` bigint NOT NULL,
        \`team_id\` bigint NOT NULL,
        \`achievement_name\` varchar(100) NOT NULL,
        \`achievement_description\` text,
        \`achievement_type\` varchar(50) NOT NULL,
        \`progress\` decimal(5,2) NOT NULL DEFAULT 0.00,
        \`is_completed\` tinyint NOT NULL DEFAULT 0,
        \`unlocked_at\` datetime(6),
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`achievement_id\`),
        UNIQUE KEY \`uk_user_achievement\` (\`user_id\`, \`achievement_type\`),
        KEY \`FK_achievement_user\` (\`user_id\`),
        KEY \`FK_achievement_team\` (\`team_id\`),
        CONSTRAINT \`FK_achievement_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`user_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_achievement_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 16. 레벨업 히스토리 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`user_level_history\` (
        \`history_id\` bigint NOT NULL AUTO_INCREMENT,
        \`user_id\` bigint NOT NULL,
        \`team_id\` bigint NOT NULL,
        \`old_level\` int NOT NULL,
        \`new_level\` int NOT NULL,
        \`exp_gained\` bigint NOT NULL,
        \`level_up_reason\` varchar(200),
        \`scenario_id\` bigint,
        \`completed_at\` datetime(6) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`history_id\`),
        KEY \`FK_history_user\` (\`user_id\`),
        KEY \`FK_history_team\` (\`team_id\`),
        KEY \`FK_history_scenario\` (\`scenario_id\`),
        CONSTRAINT \`FK_history_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`user_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_history_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_history_scenario\` FOREIGN KEY (\`scenario_id\`) REFERENCES \`scenario\` (\`scenario_id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 17. 사용자 시나리오 통계 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`user_scenario_stats\` (
        \`stats_id\` bigint NOT NULL AUTO_INCREMENT,
        \`user_id\` bigint NOT NULL,
        \`team_id\` bigint NOT NULL,
        \`scenario_type\` varchar(50) NOT NULL,
        \`completed_count\` int NOT NULL DEFAULT 0,
        \`total_score\` bigint NOT NULL DEFAULT 0,
        \`best_score\` int NOT NULL DEFAULT 0,
        \`average_score\` decimal(5,2) NOT NULL DEFAULT 0.00,
        \`total_time_spent\` int NOT NULL DEFAULT 0,
        \`last_completed_at\` datetime(6),
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`updated_by\` bigint,
        \`deleted_at\` datetime(6),
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        PRIMARY KEY (\`stats_id\`),
        UNIQUE KEY \`uk_user_scenario_stats\` (\`user_id\`, \`scenario_type\`),
        KEY \`FK_stats_user\` (\`user_id\`),
        KEY \`FK_stats_team\` (\`team_id\`),
        CONSTRAINT \`FK_stats_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`user_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_stats_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\` (\`team_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 18. 기본 데이터 삽입
    // 권한 레벨 데이터
    await queryRunner.query(`
      INSERT INTO \`admin_level\` (\`level_name\`, \`level_code\`, \`description\`, \`can_manage_team\`, \`can_manage_users\`, \`can_manage_scenarios\`, \`can_approve_scenarios\`, \`can_view_results\`) VALUES
      ('팀관리자', 'TEAM_ADMIN', '팀 전체 관리자', 1, 1, 1, 1, 1),
      ('팀운영자', 'TEAM_OPERATOR', '팀 운영자', 0, 1, 1, 0, 1),
      ('일반사용자', 'GENERAL_USER', '일반 사용자', 0, 0, 0, 0, 0)
    `);

    // 기본 팀 생성
    await queryRunner.query(`
      INSERT INTO \`team\` (\`team_code\`, \`team_name\`, \`description\`, \`status\`, \`created_by\`) VALUES
      ('TEAM001', '기본 팀', 'Phoenix 재난 대응 훈련 시스템 기본 팀', 'ACTIVE', 1)
    `);

    // 기본 관리자 생성
    await queryRunner.query(`
      INSERT INTO \`admin\` (\`team_id\`, \`admin_level_id\`, \`login_id\`, \`password\`, \`name\`, \`email\`, \`phone\`, \`created_by\`) VALUES
      (1, 1, 'admin', '$2b$10$example_hash_here', '시스템 관리자', 'admin@phoenix.com', '010-0000-0000', 1)
    `);

    // 코드 데이터
    await queryRunner.query(`
      INSERT INTO \`code\` (\`code_class\`, \`code_name\`, \`code_value\`, \`code_desc\`, \`code_order\`, \`created_by\`) VALUES
      ('DISASTER_TYPE', '화재', 'FIRE', '화재 재난', 1, 1),
      ('DISASTER_TYPE', '지진', 'EARTHQUAKE', '지진 재난', 2, 1),
      ('DISASTER_TYPE', '응급처치', 'EMERGENCY', '응급처치 상황', 3, 1),
      ('DISASTER_TYPE', '교통사고', 'TRAFFIC', '교통사고 대응', 4, 1),
      ('DISASTER_TYPE', '침수홍수', 'FLOOD', '침수 및 홍수', 5, 1),
      ('RISK_LEVEL', '낮음', 'LOW', '위험도 낮음', 1, 1),
      ('RISK_LEVEL', '보통', 'MEDIUM', '위험도 보통', 2, 1),
      ('RISK_LEVEL', '높음', 'HIGH', '위험도 높음', 3, 1),
      ('RISK_LEVEL', '매우높음', 'VERY_HIGH', '위험도 매우 높음', 4, 1),
      ('DIFFICULTY', '쉬움', 'easy', '난이도 쉬움', 1, 1),
      ('DIFFICULTY', '보통', 'medium', '난이도 보통', 2, 1),
      ('DIFFICULTY', '어려움', 'hard', '난이도 어려움', 3, 1),
      ('DIFFICULTY', '전문가', 'expert', '난이도 전문가', 4, 1),
      ('EVENT_TYPE', '선택형', 'CHOICE', '선택형 이벤트', 1, 1),
      ('EVENT_TYPE', '순차형', 'SEQUENTIAL', '순차형 이벤트', 2, 1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 테이블 삭제 (외래키 제약조건 때문에 역순으로 삭제)
    await queryRunner.query(`DROP TABLE IF EXISTS \`user_level_history\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`achievement\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`user_progress\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`faq\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`inquiry\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`user_choice_log\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`user_scenario_stats\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`training_result\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`training_participant\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`training_session\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`choice_option\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`scenario_event\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`scenario_scene\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`scenario\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`code\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`user\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`admin\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`admin_level\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`team\``);
  }
}
