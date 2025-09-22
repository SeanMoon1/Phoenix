-- =====================================================
-- Phoenix Disaster Training System - Complete Database Schema
-- 생성일: 2025년 1월 10일
-- 설명: 재난 대응 훈련 시스템을 위한 완전한 MySQL 스키마
--       (기본 스키마 + 개선사항 통합)
-- =====================================================

-- 1. 데이터베이스 생성 및 선택

-- 데이터베이스 생성 및 선택
CREATE DATABASE IF NOT EXISTS phoenix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE phoenix;

-- 1. 팀 정보 테이블 (단일 팀 구조)
CREATE TABLE IF NOT EXISTS team (
    team_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '팀 ID',
    team_code VARCHAR(50) NOT NULL UNIQUE COMMENT '팀 코드 (예: TEAM001, TEAM002)',
    team_name VARCHAR(100) NOT NULL COMMENT '팀명',
    description TEXT COMMENT '팀 설명',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '상태',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    created_by BIGINT COMMENT '생성자 ID',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    updated_by BIGINT COMMENT '수정자 ID',
    deleted_at DATETIME NULL COMMENT '삭제일시',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)'
);

-- 2. 권한 레벨 정의 테이블 (단순화된 3단계)
CREATE TABLE IF NOT EXISTS admin_level (
    level_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '권한 레벨 ID',
    level_name VARCHAR(50) NOT NULL COMMENT '권한 레벨명',
    level_code VARCHAR(20) NOT NULL UNIQUE COMMENT '권한 레벨 코드',
    description TEXT COMMENT '권한 설명',
    can_manage_team TINYINT(1) NOT NULL DEFAULT 0 COMMENT '팀 관리 가능 (1: 가능, 0: 불가)',
    can_manage_users TINYINT(1) NOT NULL DEFAULT 0 COMMENT '사용자 관리 가능 (1: 가능, 0: 불가)',
    can_manage_scenarios TINYINT(1) NOT NULL DEFAULT 0 COMMENT '시나리오 관리 가능 (1: 가능, 0: 불가)',
    can_approve_scenarios TINYINT(1) NOT NULL DEFAULT 0 COMMENT '시나리오 승인 가능 (1: 가능, 0: 불가)',
    can_view_results TINYINT(1) NOT NULL DEFAULT 0 COMMENT '결과 조회 가능 (1: 가능, 0: 불가)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    deleted_at DATETIME NULL COMMENT '삭제일시',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)'
);

-- 3. 관리자 테이블 (팀 중심 권한 관리)
CREATE TABLE IF NOT EXISTS admin (
    admin_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '관리자 ID',
    team_id BIGINT NOT NULL COMMENT '팀 ID (팀 단위 관리자)',
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    FOREIGN KEY (admin_level_id) REFERENCES admin_level(level_id)
);

-- 4. 사용자 테이블 (팀 소속)
CREATE TABLE IF NOT EXISTS user (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 ID',
    team_id BIGINT NULL COMMENT '팀 ID',
    user_code VARCHAR(50) NULL COMMENT '사용자 코드 (예: USER001, USER002)',
    login_id VARCHAR(50) NOT NULL UNIQUE COMMENT '로그인 ID',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호',
    name VARCHAR(100) NOT NULL COMMENT '사용자명',
    email VARCHAR(200) NOT NULL COMMENT '이메일',
    -- OAuth 관련 필드들
    oauth_provider VARCHAR(50) NULL COMMENT 'OAuth 제공자 (google, kakao, naver 등)',
    oauth_provider_id VARCHAR(100) NULL COMMENT 'OAuth 제공자 사용자 ID',
    profile_image_url VARCHAR(500) NULL COMMENT '프로필 이미지 URL',
    use_yn CHAR(1) NOT NULL DEFAULT 'Y' COMMENT '사용 여부',
    -- 레벨업 시스템 관련 필드 추가
    user_level INT NOT NULL DEFAULT 1 COMMENT '사용자 레벨 (1-100)',
    user_exp BIGINT NOT NULL DEFAULT 0 COMMENT '사용자 경험치',
    total_score BIGINT NOT NULL DEFAULT 0 COMMENT '총점',
    completed_scenarios INT NOT NULL DEFAULT 0 COMMENT '완료한 시나리오 개수',
    current_tier VARCHAR(20) NOT NULL DEFAULT '초급자' COMMENT '현재 등급 (초급자, 중급자, 고급자, 전문가, 마스터)',
    level_progress DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '현재 레벨에서의 진행도 (0-100%)',
    next_level_exp BIGINT NOT NULL DEFAULT 100 COMMENT '다음 레벨까지 필요한 경험치',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    updated_by BIGINT COMMENT '수정자 ID',
    deleted_at DATETIME NULL COMMENT '삭제일시',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    UNIQUE KEY uk_team_user_code (team_id, user_code),
    UNIQUE KEY uk_team_user_login (team_id, login_id),
    UNIQUE KEY uk_team_email (team_id, email),
    UNIQUE KEY uk_team_name (team_id, name)
);

-- 5. 코드 테이블
CREATE TABLE IF NOT EXISTS code (
    code_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '코드 ID',
    team_id BIGINT COMMENT '팀 ID (NULL이면 시스템 공통 코드)',
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (team_id) REFERENCES team(team_id)
);

-- 6. 시나리오 테이블 (개선된 버전)
CREATE TABLE IF NOT EXISTS scenario (
    scenario_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '시나리오 ID',
    team_id BIGINT NOT NULL COMMENT '팀 ID (생성 팀)',
    scenario_code VARCHAR(50) NOT NULL COMMENT '시나리오 코드 (예: SCEN001, SCEN002)',
    title VARCHAR(255) NOT NULL COMMENT '시나리오 제목',
    disaster_type VARCHAR(50) NOT NULL COMMENT '재난 유형',
    description TEXT NOT NULL COMMENT '시나리오 설명',
    risk_level VARCHAR(20) NOT NULL COMMENT '위험도',
    difficulty VARCHAR(20) NOT NULL DEFAULT 'easy' COMMENT '난이도 (easy, medium, hard, expert)',
    approval_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT '승인 상태 (DRAFT, PENDING, APPROVED, REJECTED)',
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    UNIQUE KEY uk_team_scenario_code (team_id, scenario_code)
);

-- 7. 시나리오 씬 테이블 (새로 추가)
CREATE TABLE IF NOT EXISTS scenario_scene (
    scene_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '씬 ID',
    scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
    scene_code VARCHAR(50) NOT NULL COMMENT '씬 코드 (예: #1-1, #1-2)',
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id) ON DELETE CASCADE,
    UNIQUE KEY uk_scenario_scene_code (scenario_id, scene_code),
    UNIQUE KEY uk_scenario_scene_order (scenario_id, scene_order),
    INDEX idx_scenario_scene_order (scenario_id, scene_order)
);

-- 8. 의사결정 이벤트 테이블 (scenario_event로 이름 변경)
CREATE TABLE IF NOT EXISTS scenario_event (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '이벤트 ID',
    scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
    event_code VARCHAR(50) NOT NULL COMMENT '이벤트 코드 (예: EVENT001, EVENT002)',
    event_order INT NOT NULL COMMENT '이벤트 순서',
    event_description TEXT NOT NULL COMMENT '이벤트 설명',
    event_type VARCHAR(50) NOT NULL COMMENT '이벤트 유형',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    created_by BIGINT NOT NULL COMMENT '생성자 ID',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    updated_by BIGINT COMMENT '수정자 ID',
    deleted_at DATETIME NULL COMMENT '삭제일시',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
    UNIQUE KEY uk_scenario_event_code (scenario_id, event_code)
);

-- 9. 선택 옵션 테이블 (개선된 버전)
CREATE TABLE IF NOT EXISTS choice_option (
    choice_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '선택지 ID',
    event_id BIGINT NOT NULL COMMENT '이벤트 ID',
    scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
    scene_id BIGINT COMMENT '씬 ID',
    choice_code VARCHAR(50) NOT NULL COMMENT '선택지 코드 (예: CHOICE001, CHOICE002)',
    choice_text VARCHAR(500) NOT NULL COMMENT '선택지 텍스트',
    is_correct TINYINT(1) NOT NULL COMMENT '정답 여부 (1: 정답, 0: 오답)',
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (event_id) REFERENCES scenario_event(event_id),
    FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
    FOREIGN KEY (scene_id) REFERENCES scenario_scene(scene_id) ON DELETE CASCADE,
    FOREIGN KEY (next_event_id) REFERENCES scenario_event(event_id),
    UNIQUE KEY uk_event_choice_code (event_id, choice_code),
    INDEX idx_scene_options (scene_id),
    INDEX idx_next_scene (next_scene_code)
);

-- 10. 훈련 세션 테이블
CREATE TABLE IF NOT EXISTS training_session (
    session_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '세션 ID',
    team_id BIGINT NULL COMMENT '팀 ID (생성 팀)',
    scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
    session_code VARCHAR(50) NOT NULL COMMENT '세션 코드 (예: SESS001, SESS002)',
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
    UNIQUE KEY uk_team_session_code (team_id, session_code)
);

-- 11. 훈련 참가자 테이블
CREATE TABLE IF NOT EXISTS training_participant (
    participant_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '참가자 ID',
    session_id BIGINT NOT NULL COMMENT '세션 ID',
    team_id BIGINT NOT NULL COMMENT '팀 ID',
    scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
    user_id BIGINT NOT NULL COMMENT '사용자 ID',
    participant_code VARCHAR(50) NOT NULL COMMENT '참가자 코드 (예: PART001, PART002)',
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '참가 시간',
    completed_at DATETIME COMMENT '완료 시간',
    status VARCHAR(20) NOT NULL DEFAULT '참여중' COMMENT '상태',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    updated_by BIGINT COMMENT '수정자 ID',
    deleted_at DATETIME NULL COMMENT '삭제일시',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (session_id) REFERENCES training_session(session_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    UNIQUE KEY uk_session_participant_code (session_id, participant_code)
);

-- 12. 훈련 결과 테이블
CREATE TABLE IF NOT EXISTS training_result (
    result_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '결과 ID',
    participant_id BIGINT NOT NULL COMMENT '참가자 ID',
    session_id BIGINT NOT NULL COMMENT '세션 ID',
    scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
    user_id BIGINT NOT NULL COMMENT '사용자 ID',
    result_code VARCHAR(50) NOT NULL COMMENT '결과 코드 (예: RESULT001, RESULT002)',
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (participant_id) REFERENCES training_participant(participant_id),
    FOREIGN KEY (session_id) REFERENCES training_session(session_id),
    FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    UNIQUE KEY uk_participant_result_code (participant_id, result_code)
);

-- 13. 사용자 선택 로그 테이블
CREATE TABLE IF NOT EXISTS user_choice_log (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '로그 ID',
    result_id BIGINT NOT NULL COMMENT '결과 ID',
    event_id BIGINT NOT NULL COMMENT '이벤트 ID',
    choice_id BIGINT NOT NULL COMMENT '선택지 ID',
    log_code VARCHAR(50) NOT NULL COMMENT '로그 코드 (예: LOG001, LOG002)',
    response_time INT NOT NULL COMMENT '응답 시간 (초)',
    is_correct TINYINT(1) NOT NULL COMMENT '정답 여부 (1: 정답, 0: 오답)',
    selected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '선택 시간',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    updated_by BIGINT COMMENT '수정자 ID',
    deleted_at DATETIME NULL COMMENT '삭제일시',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (result_id) REFERENCES training_result(result_id),
    FOREIGN KEY (event_id) REFERENCES scenario_event(event_id),
    FOREIGN KEY (choice_id) REFERENCES choice_option(choice_id),
    UNIQUE KEY uk_result_log_code (result_id, log_code)
);

-- 14. 문의사항 테이블
CREATE TABLE IF NOT EXISTS inquiry (
    inquiry_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '문의 ID',
    team_id BIGINT NOT NULL COMMENT '팀 ID',
    user_id BIGINT NOT NULL COMMENT '사용자 ID',
    inquiry_code VARCHAR(50) NOT NULL COMMENT '문의 코드 (예: INQ001, INQ002)',
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (responded_by) REFERENCES admin(admin_id),
    UNIQUE KEY uk_team_inquiry_code (team_id, inquiry_code)
);

-- 15. FAQ 테이블
CREATE TABLE IF NOT EXISTS faq (
    faq_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'FAQ ID',
    team_id BIGINT NOT NULL COMMENT '팀 ID',
    faq_code VARCHAR(50) NOT NULL COMMENT 'FAQ 코드 (예: FAQ001, FAQ002)',
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    UNIQUE KEY uk_team_faq_code (team_id, faq_code)
);

-- 16. 사용자 진행 상황 테이블 (레벨업 시스템)
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    UNIQUE KEY uk_user_progress (user_id)
);

-- 17. 성취 시스템 테이블
CREATE TABLE IF NOT EXISTS achievement (
    achievement_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '성취 ID',
    user_id BIGINT NOT NULL COMMENT '사용자 ID',
    team_id BIGINT NOT NULL COMMENT '팀 ID',
    achievement_name VARCHAR(100) NOT NULL COMMENT '성취명',
    achievement_description TEXT COMMENT '성취 설명',
    achievement_type VARCHAR(50) NOT NULL COMMENT '성취 유형',
    progress DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '달성도 (0-100%)',
    is_completed TINYINT(1) NOT NULL DEFAULT 0 COMMENT '완료 여부 (1: 완료, 0: 미완료)',
    unlocked_at DATETIME COMMENT '달성일시',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    updated_by BIGINT COMMENT '수정자 ID',
    deleted_at DATETIME NULL COMMENT '삭제일시',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    UNIQUE KEY uk_user_achievement (user_id, achievement_type)
);

-- 18. 시나리오별 사용자 통계 테이블
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    UNIQUE KEY uk_user_scenario_stats (user_id, scenario_type)
);

-- 19. 레벨업 히스토리 테이블
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
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id)
);

-- =====================================================
-- 뷰 (Views)
-- =====================================================

-- 20. 권한 제어 뷰 (팀 중심)
CREATE VIEW v_admin_access_control AS
SELECT 
    a.admin_id,
    a.team_id,
    al.level_code,
    al.can_manage_team,
    al.can_manage_users,
    al.can_manage_scenarios,
    al.can_approve_scenarios,
    al.can_view_results
FROM admin a
JOIN admin_level al ON a.admin_level_id = al.level_id
WHERE a.use_yn = 'Y' AND a.is_active = 1;

-- 21. 팀별 데이터 접근 제어 뷰
CREATE VIEW v_team_data_access AS
SELECT 
    t.team_id,
    t.team_name,
    t.team_code,
    COUNT(DISTINCT u.user_id) as user_count,
    COUNT(DISTINCT s.scenario_id) as scenario_count,
    COUNT(DISTINCT ts.session_id) as session_count
FROM team t
LEFT JOIN user u ON t.team_id = u.team_id AND u.is_active = 1
LEFT JOIN scenario s ON t.team_id = s.team_id AND s.is_active = 1
LEFT JOIN training_session ts ON t.team_id = ts.team_id AND ts.is_active = 1
WHERE t.is_active = 1
GROUP BY t.team_id, t.team_name, t.team_code;

-- 22. 사용자별 권한 요약 뷰
CREATE VIEW v_user_permission_summary AS
SELECT 
    u.user_id,
    u.name as user_name,
    u.team_id,
    t.team_name,
    CASE 
        WHEN a.admin_id IS NOT NULL THEN 'ADMIN'
        ELSE 'USER'
    END as user_type,
    COALESCE(al.level_code, 'GENERAL_USER') as admin_level,
    u.is_active,
    u.use_yn
FROM user u
JOIN team t ON u.team_id = t.team_id
LEFT JOIN admin a ON u.user_id = a.admin_id AND a.use_yn = 'Y' AND a.is_active = 1
LEFT JOIN admin_level al ON a.admin_level_id = al.level_id
WHERE u.is_active = 1 AND t.is_active = 1;

-- =====================================================
-- 인덱스 (Indexes)
-- =====================================================

-- 기본 인덱스
CREATE INDEX idx_team_code ON team(team_code);
CREATE INDEX idx_user_team ON user(team_id);
CREATE INDEX idx_user_code ON user(user_code);
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_name ON user(name);
CREATE INDEX idx_user_level ON user(user_level);
CREATE INDEX idx_user_exp ON user(user_exp);
CREATE INDEX idx_user_tier ON user(current_tier);

-- 레벨업 시스템 인덱스
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_team ON user_progress(team_id);
CREATE INDEX idx_achievement_user ON achievement(user_id);
CREATE INDEX idx_achievement_type ON achievement(achievement_type);
CREATE INDEX idx_scenario_stats_user ON user_scenario_stats(user_id);
CREATE INDEX idx_scenario_stats_type ON user_scenario_stats(scenario_type);
CREATE INDEX idx_level_history_user ON user_level_history(user_id);
CREATE INDEX idx_level_history_level ON user_level_history(new_level);

-- 관리자 인덱스
CREATE INDEX idx_admin_team ON admin(team_id);
CREATE INDEX idx_admin_level ON admin(admin_level_id);

-- 시나리오 인덱스
CREATE INDEX idx_scenario_team ON scenario(team_id);
CREATE INDEX idx_scenario_code ON scenario(scenario_code);
CREATE INDEX idx_scenario_type ON scenario(disaster_type);
CREATE INDEX idx_scenario_difficulty ON scenario(difficulty);

-- 이벤트 및 선택지 인덱스
CREATE INDEX idx_scenario_event_scenario ON scenario_event(scenario_id);
CREATE INDEX idx_scenario_event_code ON scenario_event(event_code);
CREATE INDEX idx_choice_option_event ON choice_option(event_id);
CREATE INDEX idx_choice_option_scenario ON choice_option(scenario_id);

-- 훈련 관련 인덱스
CREATE INDEX idx_training_session_scenario ON training_session(scenario_id);
CREATE INDEX idx_training_session_team ON training_session(team_id);
CREATE INDEX idx_training_participant_session ON training_participant(session_id);
CREATE INDEX idx_training_result_participant ON training_result(participant_id);
CREATE INDEX idx_user_choice_log_result ON user_choice_log(result_id);

-- 기타 인덱스
CREATE INDEX idx_inquiry_team ON inquiry(team_id);
CREATE INDEX idx_faq_team ON faq(team_id);

-- =====================================================
-- 함수 (Functions) - 제거됨 (권한 문제로 인해 애플리케이션에서 처리)
-- =====================================================

-- 함수들은 애플리케이션 레벨에서 처리됩니다:
-- 1. 시나리오 코드 생성: Backend/src/application/services/scenario.service.ts
-- 2. 권한 검증: Backend/src/shared/guards/ 권한 가드들

-- =====================================================
-- 트리거 (Triggers) - 제거됨 (권한 문제로 인해 애플리케이션에서 처리)
-- =====================================================

-- 트리거들은 애플리케이션 레벨에서 처리됩니다:
-- 1. 시나리오 코드 생성: Backend/src/application/services/scenario.service.ts
-- 2. 코드 중복 방지: DTO validation 및 서비스 레벨 검증
-- 3. 권한 검증: Backend/src/shared/guards/ 권한 가드들

-- =====================================================
-- 저장 프로시저 (Stored Procedures) - 제거됨 (권한 문제로 인해 애플리케이션에서 처리)
-- =====================================================

-- 저장 프로시저들은 애플리케이션 레벨에서 처리됩니다:
-- 1. 권한 제어: Backend/src/shared/guards/ 권한 가드들
-- 2. 데이터 접근 제어: Backend/src/application/services/ 서비스들
-- 3. 팀별 데이터 격리: Repository 패턴과 서비스 레이어에서 처리

-- =====================================================
-- 기본 데이터 삽입 (Initial Data)
-- =====================================================

-- 31. 기본 데이터 삽입 (권한 레벨 - 단순화된 3단계)
INSERT INTO admin_level (level_name, level_code, description, can_manage_team, can_manage_users, can_manage_scenarios, can_approve_scenarios, can_view_results) VALUES
('팀관리자', 'TEAM_ADMIN', '팀 전체 관리자', 1, 1, 1, 1, 1),
('팀운영자', 'TEAM_OPERATOR', '팀 운영자', 0, 1, 1, 0, 1),
('일반사용자', 'GENERAL_USER', '일반 사용자', 0, 0, 0, 0, 0);

-- 32. 기본 데이터 삽입 (시스템 공통 코드)
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
('EVENT_TYPE', '순차형', 'SEQUENTIAL', '순차형 이벤트', 2, 1);

-- 33. 기본 팀 데이터 삽입
INSERT INTO team (team_code, team_name, description, status, created_by) VALUES
('TEAM001', '기본 팀', 'Phoenix 재난 대응 훈련 시스템 기본 팀', 'ACTIVE', 1);

-- 34. 기본 관리자 데이터 삽입
INSERT INTO admin (team_id, admin_level_id, login_id, password, name, email, phone, created_by) VALUES
(1, 1, 'admin', '$2b$10$example_hash_here', '시스템 관리자', 'admin@phoenix.com', '010-0000-0000', 1);

-- 35. 샘플 시나리오 데이터 삽입
INSERT INTO scenario (team_id, scenario_code, title, disaster_type, risk_level, difficulty, description, created_by) VALUES
(1, 'FIR001', '아파트 화재 대응', 'fire', 'MEDIUM', 'easy', '새벽 3시 아파트 화재 상황 대응', 1),
(1, 'EAR001', '지진 대피 훈련', 'earthquake', 'HIGH', 'medium', '지진 발생 시 대피 절차 훈련', 1),
(1, 'EME001', '응급처치 기본', 'emergency', 'LOW', 'easy', '기본 응급처치 방법 훈련', 1),
(1, 'TRA001', '교통사고 대응', 'traffic', 'MEDIUM', 'medium', '교통사고 발생 시 대응 절차', 1);

-- 36. 샘플 씬 데이터 삽입
INSERT INTO scenario_scene (scenario_id, scene_code, scene_order, title, content, scene_script, created_by) VALUES
-- 화재 시나리오 씬들
(1, '#1-1', 1, '화재 경보 발생', '새벽 3시, 아파트 화재 경보가 울렸습니다. 연기가 복도로 퍼져나가고 있습니다.', '경보음이 울리고 있습니다. 연기가 보입니다.', 1),
(1, '#1-2', 2, '현장 확인', '화재 현장을 확인해야 합니다. 어디서 불이 났는지 파악하세요.', '현장 상황을 파악하세요. 안전을 우선으로 하세요.', 1),
(1, '#1-3', 3, '대피 결정', '대피할지 진화할지 결정해야 합니다.', '빠른 판단이 필요합니다.', 1),
-- 지진 시나리오 씬들
(2, '#2-1', 1, '지진 발생', '지진이 발생했습니다. 땅이 흔들리고 있습니다.', '땅이 흔들리고 있습니다. 안전한 곳을 찾으세요.', 1),
(2, '#2-2', 2, '대피 준비', '안전한 곳으로 대피해야 합니다.', '대피 준비를 하세요. 머리를 보호하세요.', 1),
(2, '#2-3', 3, '대피 실행', '대피를 실행합니다.', '차근차근 대피하세요.', 1);

-- 37. 샘플 선택 옵션 데이터 삽입
-- 3. scenario_event 테이블에 이벤트 데이터 추가
INSERT INTO scenario_event (scenario_id, event_code, event_order, event_description, event_type, created_by) VALUES
-- 화재 시나리오 이벤트들
(1, 'FIR001_EVT001', 1, '화재 발생 상황 - 초기 대응', 'FIRE', 1),
(1, 'FIR001_EVT002', 2, '화재 진압 상황 - 소화기 사용', 'FIRE', 1),
(1, 'FIR001_EVT003', 3, '화재 대피 상황 - 안전한 대피', 'FIRE', 1),
-- 지진 시나리오 이벤트들
(2, 'EAR001_EVT001', 1, '지진 발생 상황 - 초기 대응', 'EARTHQUAKE', 1),
(2, 'EAR001_EVT002', 2, '지진 대피 상황 - 안전한 대피', 'EARTHQUAKE', 1),
-- 교통사고 시나리오 이벤트들
(3, 'TRA001_EVT001', 1, '교통사고 발생 상황 - 초기 대응', 'TRAFFIC', 1),
(3, 'TRA001_EVT002', 2, '교통사고 응급처치 상황', 'TRAFFIC', 1),
-- 응급처치 시나리오 이벤트들
(4, 'EMR001_EVT001', 1, '응급상황 발생 - 초기 대응', 'EMERGENCY', 1),
(4, 'EMR001_EVT002', 2, '응급처치 수행 상황', 'EMERGENCY', 1);

-- 4. choice_option 테이블에 선택지 데이터 추가 (event_id, score_weight 포함)
INSERT INTO choice_option (event_id, scene_id, scenario_id, choice_code, choice_text, reaction_text, speed_points, accuracy_points, exp_points, is_correct, next_scene_code, score_weight, created_by) VALUES
-- 화재 시나리오 씬 1의 선택지들 (event_id: 1)
(1, 1, 1, 'FIR001_OPT001', '119에 신고한다', '신고를 완료했습니다. 소방서에서 출동한다고 합니다.', 10, 10, 50, 1, '#1-2', 100, 1),
(1, 1, 1, 'FIR001_OPT002', '직접 진화한다', '위험합니다! 연기가 더 심해질 수 있습니다.', 5, 0, 10, 0, '#1-1', 50, 1),
(1, 1, 1, 'FIR001_OPT003', '대피한다', '안전한 곳으로 대피하세요.', 8, 8, 30, 1, '#1-3', 80, 1),
-- 화재 시나리오 씬 2의 선택지들 (event_id: 2)
(2, 2, 1, 'FIR001_OPT004', '화재 위치 확인', '화재 위치를 확인했습니다. 3층에서 발생했습니다.', 10, 10, 50, 1, '#1-3', 100, 1),
(2, 2, 1, 'FIR001_OPT005', '소화기 사용', '소화기를 사용해보세요.', 7, 5, 25, 0, '#1-2', 60, 1),
-- 지진 시나리오 씬 1의 선택지들 (event_id: 4)
(4, 4, 2, 'EAR001_OPT001', '책상 아래로 숨는다', '책상 아래로 숨었습니다. 안전합니다.', 10, 10, 50, 1, '#2-2', 100, 1),
(4, 4, 2, 'EAR001_OPT002', '바로 밖으로 나간다', '위험합니다! 떨어지는 물건에 맞을 수 있습니다.', 3, 0, 5, 0, '#2-1', 30, 1),
-- 교통사고 시나리오 씬 1의 선택지들 (event_id: 6)
(6, 5, 3, 'TRA001_OPT001', '119에 신고한다', '신고를 완료했습니다. 응급실에 연락했습니다.', 10, 10, 50, 1, '#3-2', 100, 1),
(6, 5, 3, 'TRA001_OPT002', '직접 응급처치한다', '응급처치를 시도해보세요.', 7, 8, 35, 1, '#3-3', 80, 1),
(6, 5, 3, 'TRA001_OPT003', '가만히 기다린다', '위험합니다! 신속한 대응이 필요합니다.', 2, 0, 5, 0, '#3-1', 20, 1),
-- 응급처치 시나리오 씬 1의 선택지들 (event_id: 8)
(8, 6, 4, 'EMR001_OPT001', '의식을 확인한다', '의식을 확인했습니다. 반응이 있습니다.', 10, 10, 50, 1, '#4-2', 100, 1),
(8, 6, 4, 'EMR001_OPT002', '호흡을 확인한다', '호흡을 확인했습니다. 정상적으로 숨을 쉬고 있습니다.', 8, 8, 40, 1, '#4-3', 90, 1),
(8, 6, 4, 'EMR001_OPT003', '가만히 기다린다', '위험합니다! 신속한 응급처치가 필요합니다.', 3, 0, 5, 0, '#4-1', 30, 1);

-- =====================================================
-- 완료 메시지
-- =====================================================

SELECT 'Phoenix Database Schema 생성 완료!' as status;
SELECT '총 테이블 수:' as info, COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE();
SELECT '총 뷰 수:' as info, COUNT(*) as count FROM information_schema.views WHERE table_schema = DATABASE();
SELECT '함수와 프로시저는 애플리케이션 레벨에서 처리됩니다.' as info;
