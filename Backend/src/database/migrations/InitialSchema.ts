import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 팀 정보 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS team (
        team_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '팀 ID',
        team_code VARCHAR(50) NOT NULL UNIQUE COMMENT '팀 코드',
        team_name VARCHAR(100) NOT NULL COMMENT '팀명',
        description TEXT COMMENT '팀 설명',
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '상태',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        created_by BIGINT COMMENT '생성자 ID',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. 권한 레벨 정의 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS admin_level (
        level_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '권한 레벨 ID',
        level_name VARCHAR(50) NOT NULL COMMENT '권한 레벨명',
        level_code VARCHAR(20) NOT NULL UNIQUE COMMENT '권한 레벨 코드',
        description TEXT COMMENT '권한 설명',
        can_manage_team TINYINT(1) NOT NULL DEFAULT 0 COMMENT '팀 관리 가능',
        can_manage_users TINYINT(1) NOT NULL DEFAULT 0 COMMENT '사용자 관리 가능',
        can_manage_scenarios TINYINT(1) NOT NULL DEFAULT 0 COMMENT '시나리오 관리 가능',
        can_approve_scenarios TINYINT(1) NOT NULL DEFAULT 0 COMMENT '시나리오 승인 가능',
        can_view_results TINYINT(1) NOT NULL DEFAULT 0 COMMENT '결과 조회 가능',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. 관리자 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS admin (
        admin_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '관리자 ID',
        team_id BIGINT NOT NULL COMMENT '팀 ID',
        admin_level_id INT NOT NULL COMMENT '권한 레벨 ID',
        login_id VARCHAR(50) NOT NULL UNIQUE COMMENT '로그인 ID',
        password VARCHAR(255) NOT NULL COMMENT '비밀번호',
        name VARCHAR(100) NOT NULL COMMENT '관리자명',
        email VARCHAR(200) NOT NULL COMMENT '이메일',
        phone VARCHAR(20) NOT NULL COMMENT '연락처',
        permissions TEXT COMMENT '추가 권한 정보 (JSON 형태)',
        use_yn CHAR(1) NOT NULL DEFAULT 'Y' COMMENT '사용 여부',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        created_by BIGINT NOT NULL COMMENT '생성자 ID',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (team_id) REFERENCES team(team_id),
        FOREIGN KEY (admin_level_id) REFERENCES admin_level(level_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. 사용자 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user (
        user_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 ID',
        team_id BIGINT NULL COMMENT '팀 ID',
        user_code VARCHAR(50) NULL COMMENT '사용자 코드',
        login_id VARCHAR(50) NOT NULL UNIQUE COMMENT '로그인 ID',
        password VARCHAR(255) NOT NULL COMMENT '비밀번호',
        name VARCHAR(100) NOT NULL COMMENT '사용자명',
        email VARCHAR(200) NOT NULL COMMENT '이메일',
        oauth_provider VARCHAR(50) NULL COMMENT 'OAuth 제공자',
        oauth_provider_id VARCHAR(100) NULL COMMENT 'OAuth 제공자 사용자 ID',
        profile_image_url VARCHAR(500) NULL COMMENT '프로필 이미지 URL',
        use_yn CHAR(1) NOT NULL DEFAULT 'Y' COMMENT '사용 여부',
        user_level INT NOT NULL DEFAULT 1 COMMENT '사용자 레벨',
        user_exp BIGINT NOT NULL DEFAULT 0 COMMENT '사용자 경험치',
        total_score BIGINT NOT NULL DEFAULT 0 COMMENT '총점',
        completed_scenarios INT NOT NULL DEFAULT 0 COMMENT '완료한 시나리오 개수',
        current_tier VARCHAR(20) NOT NULL DEFAULT '초급자' COMMENT '현재 등급',
        level_progress DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '현재 레벨에서의 진행도',
        next_level_exp BIGINT NOT NULL DEFAULT 100 COMMENT '다음 레벨까지 필요한 경험치',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (team_id) REFERENCES team(team_id),
        UNIQUE KEY uk_team_user_code (team_id, user_code),
        UNIQUE KEY uk_team_user_login (team_id, login_id),
        UNIQUE KEY uk_team_email (team_id, email),
        UNIQUE KEY uk_team_name (team_id, name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 5. 코드 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS code (
        code_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '코드 ID',
        team_id BIGINT COMMENT '팀 ID',
        code_class VARCHAR(100) NOT NULL COMMENT '코드 분류',
        code_name VARCHAR(100) NOT NULL COMMENT '코드명',
        code_value VARCHAR(100) NOT NULL COMMENT '코드값',
        code_desc VARCHAR(500) COMMENT '코드 설명',
        code_order INT NOT NULL COMMENT '코드 순서',
        use_yn CHAR(1) NOT NULL DEFAULT 'Y' COMMENT '사용 여부',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        created_by BIGINT COMMENT '생성자 ID',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (team_id) REFERENCES team(team_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 6. 시나리오 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS scenario (
        scenario_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '시나리오 ID',
        team_id BIGINT NOT NULL COMMENT '팀 ID',
        scenario_code VARCHAR(50) NOT NULL COMMENT '시나리오 코드',
        title VARCHAR(255) NOT NULL COMMENT '시나리오 제목',
        disaster_type VARCHAR(50) NOT NULL COMMENT '재난 유형',
        description TEXT NOT NULL COMMENT '시나리오 설명',
        risk_level VARCHAR(20) NOT NULL COMMENT '위험도',
        difficulty VARCHAR(20) NOT NULL DEFAULT 'easy' COMMENT '난이도',
        approval_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT '승인 상태',
        occurrence_condition TEXT COMMENT '발생 조건',
        status VARCHAR(20) NOT NULL DEFAULT '임시저장' COMMENT '상태',
        approval_comment TEXT COMMENT '승인 코멘트',
        image_url VARCHAR(500) COMMENT '이미지 URL',
        video_url VARCHAR(500) COMMENT '비디오 URL',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        created_by BIGINT NOT NULL COMMENT '생성자 ID',
        approved_at DATETIME COMMENT '승인일시',
        approved_by BIGINT COMMENT '승인자 ID',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (team_id) REFERENCES team(team_id),
        UNIQUE KEY uk_team_scenario_code (team_id, scenario_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 7. 시나리오 씬 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS scenario_scene (
        scene_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '씬 ID',
        scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
        scene_code VARCHAR(50) NOT NULL COMMENT '씬 코드',
        scene_order INT NOT NULL COMMENT '씬 순서',
        title VARCHAR(255) NOT NULL COMMENT '씬 제목',
        content TEXT NOT NULL COMMENT '씬 내용',
        scene_script TEXT NOT NULL COMMENT '씬 스크립트',
        image_url VARCHAR(500) COMMENT '씬 이미지 URL',
        video_url VARCHAR(500) COMMENT '씬 비디오 URL',
        estimated_time INT COMMENT '예상 소요 시간 (초)',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        created_by BIGINT NOT NULL COMMENT '생성자 ID',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id) ON DELETE CASCADE,
        UNIQUE KEY uk_scenario_scene_code (scenario_id, scene_code),
        UNIQUE KEY uk_scenario_scene_order (scenario_id, scene_order),
        INDEX idx_scenario_scene_order (scenario_id, scene_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 8. 의사결정 이벤트 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS scenario_event (
        event_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '이벤트 ID',
        scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
        event_code VARCHAR(50) NOT NULL COMMENT '이벤트 코드',
        event_order INT NOT NULL COMMENT '이벤트 순서',
        event_description TEXT NOT NULL COMMENT '이벤트 설명',
        event_type VARCHAR(50) NOT NULL COMMENT '이벤트 유형',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        created_by BIGINT NOT NULL COMMENT '생성자 ID',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
        UNIQUE KEY uk_scenario_event_code (scenario_id, event_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 9. 선택 옵션 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS choice_option (
        choice_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '선택지 ID',
        event_id BIGINT NOT NULL COMMENT '이벤트 ID',
        scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
        scene_id BIGINT COMMENT '씬 ID',
        choice_code VARCHAR(50) NOT NULL COMMENT '선택지 코드',
        choice_text VARCHAR(500) NOT NULL COMMENT '선택지 텍스트',
        is_correct TINYINT(1) NOT NULL COMMENT '정답 여부',
        speed_points INT NOT NULL DEFAULT 0 COMMENT '속도 점수',
        accuracy_points INT NOT NULL DEFAULT 0 COMMENT '정확도 점수',
        exp_points INT NOT NULL DEFAULT 0 COMMENT '경험치 점수',
        reaction_text TEXT COMMENT '선택 후 반응 텍스트',
        next_scene_code VARCHAR(50) COMMENT '다음 씬 코드',
        score_weight INT NOT NULL COMMENT '점수 가중치',
        next_event_id BIGINT COMMENT '다음 이벤트 ID',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        created_by BIGINT COMMENT '생성자 ID',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (event_id) REFERENCES scenario_event(event_id),
        FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
        FOREIGN KEY (scene_id) REFERENCES scenario_scene(scene_id) ON DELETE CASCADE,
        FOREIGN KEY (next_event_id) REFERENCES scenario_event(event_id),
        UNIQUE KEY uk_event_choice_code (event_id, choice_code),
        INDEX idx_scene_options (scene_id),
        INDEX idx_next_scene (next_scene_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 10. 훈련 세션 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS training_session (
        session_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '세션 ID',
        team_id BIGINT NOT NULL COMMENT '팀 ID',
        scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
        session_code VARCHAR(50) NOT NULL COMMENT '세션 코드',
        session_name VARCHAR(255) NOT NULL COMMENT '세션명',
        start_time DATETIME NOT NULL COMMENT '시작 시간',
        end_time DATETIME COMMENT '종료 시간',
        max_participants INT COMMENT '최대 참가자 수',
        status VARCHAR(20) NOT NULL DEFAULT '준비중' COMMENT '상태',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        created_by BIGINT NOT NULL COMMENT '생성자 ID',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (team_id) REFERENCES team(team_id),
        FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
        UNIQUE KEY uk_team_session_code (team_id, session_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 11. 훈련 참가자 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS training_participant (
        participant_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '참가자 ID',
        session_id BIGINT NOT NULL COMMENT '세션 ID',
        team_id BIGINT NOT NULL COMMENT '팀 ID',
        scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
        user_id BIGINT NOT NULL COMMENT '사용자 ID',
        participant_code VARCHAR(50) NOT NULL COMMENT '참가자 코드',
        joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '참가 시간',
        completed_at DATETIME COMMENT '완료 시간',
        status VARCHAR(20) NOT NULL DEFAULT '참여중' COMMENT '상태',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (session_id) REFERENCES training_session(session_id),
        FOREIGN KEY (team_id) REFERENCES team(team_id),
        FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
        FOREIGN KEY (user_id) REFERENCES user(user_id),
        UNIQUE KEY uk_session_participant_code (session_id, participant_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 12. 훈련 결과 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS training_result (
        result_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '결과 ID',
        participant_id BIGINT NOT NULL COMMENT '참가자 ID',
        session_id BIGINT NOT NULL COMMENT '세션 ID',
        scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
        user_id BIGINT NOT NULL COMMENT '사용자 ID',
        result_code VARCHAR(50) NOT NULL COMMENT '결과 코드',
        accuracy_score INT NOT NULL COMMENT '정확도 점수',
        speed_score INT NOT NULL COMMENT '속도 점수',
        total_score INT NOT NULL COMMENT '총점',
        completion_time INT COMMENT '완료 시간 (초)',
        feedback TEXT COMMENT '피드백',
        completed_at DATETIME NOT NULL COMMENT '완료일시',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (participant_id) REFERENCES training_participant(participant_id),
        FOREIGN KEY (session_id) REFERENCES training_session(session_id),
        FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
        FOREIGN KEY (user_id) REFERENCES user(user_id),
        UNIQUE KEY uk_participant_result_code (participant_id, result_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 13. 사용자 선택 로그 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_choice_log (
        log_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '로그 ID',
        result_id BIGINT NOT NULL COMMENT '결과 ID',
        event_id BIGINT NOT NULL COMMENT '이벤트 ID',
        choice_id BIGINT NOT NULL COMMENT '선택지 ID',
        log_code VARCHAR(50) NOT NULL COMMENT '로그 코드',
        response_time INT NOT NULL COMMENT '응답 시간 (초)',
        is_correct TINYINT(1) NOT NULL COMMENT '정답 여부',
        selected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '선택 시간',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (result_id) REFERENCES training_result(result_id),
        FOREIGN KEY (event_id) REFERENCES scenario_event(event_id),
        FOREIGN KEY (choice_id) REFERENCES choice_option(choice_id),
        UNIQUE KEY uk_result_log_code (result_id, log_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 14. 문의사항 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS inquiry (
        inquiry_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '문의 ID',
        team_id BIGINT NOT NULL COMMENT '팀 ID',
        user_id BIGINT NOT NULL COMMENT '사용자 ID',
        inquiry_code VARCHAR(50) NOT NULL COMMENT '문의 코드',
        category VARCHAR(100) NOT NULL COMMENT '카테고리',
        title VARCHAR(255) NOT NULL COMMENT '제목',
        content TEXT NOT NULL COMMENT '내용',
        status VARCHAR(20) NOT NULL DEFAULT '접수' COMMENT '상태',
        admin_response TEXT COMMENT '관리자 답변',
        responded_at DATETIME COMMENT '답변일시',
        responded_by BIGINT COMMENT '답변자 ID',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (team_id) REFERENCES team(team_id),
        FOREIGN KEY (user_id) REFERENCES user(user_id),
        FOREIGN KEY (responded_by) REFERENCES admin(admin_id),
        UNIQUE KEY uk_team_inquiry_code (team_id, inquiry_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 15. FAQ 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS faq (
        faq_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'FAQ ID',
        team_id BIGINT NOT NULL COMMENT '팀 ID',
        faq_code VARCHAR(50) NOT NULL COMMENT 'FAQ 코드',
        category VARCHAR(100) NOT NULL COMMENT '카테고리',
        question TEXT NOT NULL COMMENT '질문',
        answer TEXT NOT NULL COMMENT '답변',
        order_num INT NOT NULL COMMENT '정렬 순서',
        use_yn CHAR(1) NOT NULL DEFAULT 'Y' COMMENT '사용 여부',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        created_by BIGINT NOT NULL COMMENT '생성자 ID',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (team_id) REFERENCES team(team_id),
        UNIQUE KEY uk_team_faq_code (team_id, faq_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 16. 사용자 진행 상황 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        progress_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '진행 상황 ID',
        user_id BIGINT NOT NULL COMMENT '사용자 ID',
        team_id BIGINT NOT NULL COMMENT '팀 ID',
        user_level INT NOT NULL DEFAULT 1 COMMENT '사용자 레벨',
        user_exp BIGINT NOT NULL DEFAULT 0 COMMENT '사용자 경험치',
        total_score BIGINT NOT NULL DEFAULT 0 COMMENT '총점',
        completed_scenarios INT NOT NULL DEFAULT 0 COMMENT '완료한 시나리오 수',
        current_streak INT NOT NULL DEFAULT 0 COMMENT '연속 완료 횟수',
        longest_streak INT NOT NULL DEFAULT 0 COMMENT '최장 연속 완료 횟수',
        last_completed_at DATETIME COMMENT '마지막 완료일시',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (user_id) REFERENCES user(user_id),
        FOREIGN KEY (team_id) REFERENCES team(team_id),
        UNIQUE KEY uk_user_progress (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 17. 성취 시스템 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS achievement (
        achievement_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '성취 ID',
        user_id BIGINT NOT NULL COMMENT '사용자 ID',
        team_id BIGINT NOT NULL COMMENT '팀 ID',
        achievement_name VARCHAR(100) NOT NULL COMMENT '성취명',
        achievement_description TEXT COMMENT '성취 설명',
        achievement_type VARCHAR(50) NOT NULL COMMENT '성취 유형',
        progress DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '달성도',
        is_completed TINYINT(1) NOT NULL DEFAULT 0 COMMENT '완료 여부',
        unlocked_at DATETIME COMMENT '달성일시',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (user_id) REFERENCES user(user_id),
        FOREIGN KEY (team_id) REFERENCES team(team_id),
        UNIQUE KEY uk_user_achievement (user_id, achievement_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 18. 시나리오별 사용자 통계 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_scenario_stats (
        stats_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '통계 ID',
        user_id BIGINT NOT NULL COMMENT '사용자 ID',
        team_id BIGINT NOT NULL COMMENT '팀 ID',
        scenario_type VARCHAR(50) NOT NULL COMMENT '시나리오 유형',
        completed_count INT NOT NULL DEFAULT 0 COMMENT '완료 횟수',
        total_score BIGINT NOT NULL DEFAULT 0 COMMENT '총점',
        best_score INT NOT NULL DEFAULT 0 COMMENT '최고점수',
        average_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '평균점수',
        total_time_spent INT NOT NULL DEFAULT 0 COMMENT '총 소요시간 (초)',
        last_completed_at DATETIME COMMENT '마지막 완료일시',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (user_id) REFERENCES user(user_id),
        FOREIGN KEY (team_id) REFERENCES team(team_id),
        UNIQUE KEY uk_user_scenario_stats (user_id, scenario_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 19. 레벨업 히스토리 테이블
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_level_history (
        history_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '히스토리 ID',
        user_id BIGINT NOT NULL COMMENT '사용자 ID',
        team_id BIGINT NOT NULL COMMENT '팀 ID',
        old_level INT NOT NULL COMMENT '이전 레벨',
        new_level INT NOT NULL COMMENT '새로운 레벨',
        exp_gained BIGINT NOT NULL COMMENT '획득한 경험치',
        level_up_reason VARCHAR(200) COMMENT '레벨업 사유',
        scenario_id BIGINT COMMENT '관련 시나리오 ID',
        completed_at DATETIME NOT NULL COMMENT '완료일시',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        updated_by BIGINT COMMENT '수정자 ID',
        deleted_at DATETIME NULL COMMENT '삭제일시',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부',
        FOREIGN KEY (user_id) REFERENCES user(user_id),
        FOREIGN KEY (team_id) REFERENCES team(team_id),
        FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 기본 데이터 삽입
    await queryRunner.query(`
      INSERT INTO admin_level (level_name, level_code, description, can_manage_team, can_manage_users, can_manage_scenarios, can_approve_scenarios, can_view_results) VALUES
      ('팀관리자', 'TEAM_ADMIN', '팀 전체 관리자', 1, 1, 1, 1, 1),
      ('팀운영자', 'TEAM_OPERATOR', '팀 운영자', 0, 1, 1, 0, 1),
      ('일반사용자', 'GENERAL_USER', '일반 사용자', 0, 0, 0, 0, 0)
    `);

    await queryRunner.query(`
      INSERT INTO code (code_class, code_name, code_value, code_desc, code_order, created_by) VALUES
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

    await queryRunner.query(`
      INSERT INTO team (team_code, team_name, description, status, created_by) VALUES
      ('TEAM001', '기본 팀', 'Phoenix 재난 대응 훈련 시스템 기본 팀', 'ACTIVE', 1)
    `);

    await queryRunner.query(`
      INSERT INTO admin (team_id, admin_level_id, login_id, password, name, email, phone, created_by) VALUES
      (1, 1, 'admin', '$2b$10$example_hash_here', '시스템 관리자', 'admin@phoenix.com', '010-0000-0000', 1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 테이블 삭제 (역순으로)
    await queryRunner.query(`DROP TABLE IF EXISTS user_level_history`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_scenario_stats`);
    await queryRunner.query(`DROP TABLE IF EXISTS achievement`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_progress`);
    await queryRunner.query(`DROP TABLE IF EXISTS faq`);
    await queryRunner.query(`DROP TABLE IF EXISTS inquiry`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_choice_log`);
    await queryRunner.query(`DROP TABLE IF EXISTS training_result`);
    await queryRunner.query(`DROP TABLE IF EXISTS training_participant`);
    await queryRunner.query(`DROP TABLE IF EXISTS training_session`);
    await queryRunner.query(`DROP TABLE IF EXISTS choice_option`);
    await queryRunner.query(`DROP TABLE IF EXISTS scenario_event`);
    await queryRunner.query(`DROP TABLE IF EXISTS scenario_scene`);
    await queryRunner.query(`DROP TABLE IF EXISTS scenario`);
    await queryRunner.query(`DROP TABLE IF EXISTS code`);
    await queryRunner.query(`DROP TABLE IF EXISTS user`);
    await queryRunner.query(`DROP TABLE IF EXISTS admin`);
    await queryRunner.query(`DROP TABLE IF EXISTS admin_level`);
    await queryRunner.query(`DROP TABLE IF EXISTS team`);
  }
}
