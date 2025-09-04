-- Phoenix Disaster Training System Database Schema (MySQL Compatible Version)
-- 생성일: 2025년 9월 1일
-- 설명: 재난 대응 훈련 시스템을 위한 데이터베이스 스키마 (단일 팀 중심 MVP 버전)

-- 1. 팀 정보 테이블 (단일 팀 구조)
CREATE TABLE team (
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
CREATE TABLE admin_level (
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
CREATE TABLE admin (
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
CREATE TABLE user (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 ID',
    team_id BIGINT NOT NULL COMMENT '팀 ID',
    user_code VARCHAR(50) NOT NULL COMMENT '사용자 코드 (예: USER001, USER002)',
    login_id VARCHAR(50) NOT NULL UNIQUE COMMENT '로그인 ID',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호',
    name VARCHAR(100) NOT NULL COMMENT '사용자명',
    email VARCHAR(200) NOT NULL COMMENT '이메일',
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
CREATE TABLE code (
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

-- 6. 시나리오 테이블
CREATE TABLE scenario (
    scenario_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '시나리오 ID',
    team_id BIGINT NOT NULL COMMENT '팀 ID (생성 팀)',
    scenario_code VARCHAR(50) NOT NULL COMMENT '시나리오 코드 (예: SCEN001, SCEN002)',
    title VARCHAR(255) NOT NULL COMMENT '시나리오 제목',
    disaster_type VARCHAR(50) NOT NULL COMMENT '재난 유형',
    description TEXT NOT NULL COMMENT '시나리오 설명',
    risk_level VARCHAR(20) NOT NULL COMMENT '위험도',
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

-- 7. 의사결정 이벤트 테이블
CREATE TABLE decision_event (
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

-- 8. 선택 옵션 테이블
CREATE TABLE choice_option (
    choice_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '선택지 ID',
    event_id BIGINT NOT NULL COMMENT '이벤트 ID',
    scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
    choice_code VARCHAR(50) NOT NULL COMMENT '선택지 코드 (예: CHOICE001, CHOICE002)',
    choice_text VARCHAR(500) NOT NULL COMMENT '선택지 텍스트',
    is_correct TINYINT(1) NOT NULL COMMENT '정답 여부 (1: 정답, 0: 오답)',
    score_weight INT NOT NULL COMMENT '점수 가중치',
    next_event_id BIGINT COMMENT '다음 이벤트 ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    updated_by BIGINT COMMENT '수정자 ID',
    deleted_at DATETIME NULL COMMENT '삭제일시',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (event_id) REFERENCES decision_event(event_id),
    FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
    FOREIGN KEY (next_event_id) REFERENCES decision_event(event_id),
    UNIQUE KEY uk_event_choice_code (event_id, choice_code)
);

-- 9. 훈련 세션 테이블
CREATE TABLE training_session (
    session_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '세션 ID',
    team_id BIGINT NOT NULL COMMENT '팀 ID (생성 팀)',
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

-- 10. 훈련 참가자 테이블
CREATE TABLE training_participant (
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

-- 11. 훈련 결과 테이블
CREATE TABLE training_result (
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

-- 12. 사용자 선택 로그 테이블
CREATE TABLE user_choice_log (
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
    FOREIGN KEY (event_id) REFERENCES decision_event(event_id),
    FOREIGN KEY (choice_id) REFERENCES choice_option(choice_id),
    UNIQUE KEY uk_result_log_code (result_id, log_code)
);

-- 13. 문의사항 테이블
CREATE TABLE inquiry (
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

-- 14. FAQ 테이블
CREATE TABLE faq (
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

-- 15. 권한 제어 뷰 (팀 중심)
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

-- 16. 사용자 진행 상황 테이블 (레벨업 시스템)
CREATE TABLE user_progress (
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
CREATE TABLE achievement (
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
CREATE TABLE user_scenario_stats (
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
CREATE TABLE user_level_history (
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

-- 16. 팀별 데이터 접근 제어 뷰
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

-- 17. 사용자별 권한 요약 뷰
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

-- 인덱스 생성
CREATE INDEX idx_team_code ON team(team_code);
CREATE INDEX idx_user_team ON user(team_id);
CREATE INDEX idx_user_code ON user(user_code);
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_name ON user(name);
CREATE INDEX idx_user_level ON user(user_level);
CREATE INDEX idx_user_exp ON user(user_exp);
CREATE INDEX idx_user_tier ON user(current_tier);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_team ON user_progress(team_id);
CREATE INDEX idx_achievement_user ON achievement(user_id);
CREATE INDEX idx_achievement_type ON achievement(achievement_type);
CREATE INDEX idx_scenario_stats_user ON user_scenario_stats(user_id);
CREATE INDEX idx_scenario_stats_type ON user_scenario_stats(scenario_type);
CREATE INDEX idx_level_history_user ON user_level_history(user_id);
CREATE INDEX idx_level_history_level ON user_level_history(new_level);
CREATE INDEX idx_admin_team ON admin(team_id);
CREATE INDEX idx_admin_level ON admin(admin_level_id);
CREATE INDEX idx_scenario_team ON scenario(team_id);
CREATE INDEX idx_scenario_code ON scenario(scenario_code);
CREATE INDEX idx_decision_event_scenario ON decision_event(scenario_id);
CREATE INDEX idx_decision_event_code ON decision_event(event_code);
CREATE INDEX idx_choice_option_event ON choice_option(event_id);
CREATE INDEX idx_training_session_scenario ON training_session(scenario_id);
CREATE INDEX idx_training_session_team ON training_session(team_id);
CREATE INDEX idx_training_participant_session ON training_participant(session_id);
CREATE INDEX idx_training_result_participant ON training_result(participant_id);
CREATE INDEX idx_user_choice_log_result ON user_choice_log(result_id);
CREATE INDEX idx_inquiry_team ON inquiry(team_id);
CREATE INDEX idx_faq_team ON faq(team_id);

-- 기본 데이터 삽입 (권한 레벨 - 단순화된 3단계)
INSERT INTO admin_level (level_name, level_code, description, can_manage_team, can_manage_users, can_manage_scenarios, can_approve_scenarios, can_view_results) VALUES
('팀관리자', 'TEAM_ADMIN', '팀 전체 관리자', 1, 1, 1, 1, 1),
('팀운영자', 'TEAM_OPERATOR', '팀 운영자', 0, 1, 1, 0, 1),
('일반사용자', 'GENERAL_USER', '일반 사용자', 0, 0, 0, 0, 0);

-- 기본 데이터 삽입 (시스템 공통 코드)
INSERT INTO code (code_class, code_name, code_value, code_desc, code_order, created_by) VALUES
('DISASTER_TYPE', '화재', 'FIRE', '화재 재난', 1, 1),
('DISASTER_TYPE', '지진', 'EARTHQUAKE', '지진 재난', 2, 1),
('DISASTER_TYPE', '응급처치', 'EMERGENCY', '응급처치 상황', 3, 1),
('DISASTER_TYPE', '침수홍수', 'FLOOD', '침수 및 홍수', 4, 1),
('RISK_LEVEL', '낮음', 'LOW', '위험도 낮음', 1, 1),
('RISK_LEVEL', '보통', 'MEDIUM', '위험도 보통', 2, 1),
('RISK_LEVEL', '높음', 'HIGH', '위험도 높음', 3, 1),
('RISK_LEVEL', '매우높음', 'VERY_HIGH', '위험도 매우 높음', 4, 1),
('EVENT_TYPE', '선택형', 'CHOICE', '선택형 이벤트', 1, 1),
('EVENT_TYPE', '순차형', 'SEQUENTIAL', '순차형 이벤트', 2, 1);

-- 권한 제어를 위한 저장 프로시저 예시 (팀 중심, MySQL 호환)
DELIMITER //
CREATE PROCEDURE GetUserResultsByAdmin(
    IN p_admin_id BIGINT,
    IN p_team_id BIGINT
)
BEGIN
    DECLARE v_can_view_results TINYINT(1) DEFAULT 0;
    DECLARE v_admin_team_id BIGINT;
    DECLARE v_error_msg VARCHAR(500);
    
    -- 관리자 권한 확인
    SELECT 
        can_view_results,
        team_id
    INTO 
        v_can_view_results,
        v_admin_team_id
    FROM v_admin_access_control 
    WHERE admin_id = p_admin_id;
    
    -- 권한 검증 (MySQL 호환 방식)
    IF v_can_view_results = 0 THEN
        SET v_error_msg = '결과 조회 권한이 없습니다.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END IF;
    
    -- 팀별 접근 권한 검증
    IF v_admin_team_id != p_team_id THEN
        SET v_error_msg = '해당 팀 데이터에 접근할 수 없습니다.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END IF;
    
    -- 결과 조회 (팀별)
    SELECT tr.*, tp.team_id, u.name as user_name, t.team_name
    FROM training_result tr
    JOIN training_participant tp ON tr.participant_id = tp.participant_id
    JOIN user u ON tr.user_id = u.user_id
    JOIN team t ON tp.team_id = t.team_id
    WHERE tp.team_id = p_team_id
    AND tr.is_active = 1;
    
END //
DELIMITER ;

-- 권한 검증을 위한 트리거 예시 (MySQL 호환)
DELIMITER //
CREATE TRIGGER tr_admin_team_check
BEFORE INSERT ON admin
FOR EACH ROW
BEGIN
    DECLARE v_team_exists TINYINT(1) DEFAULT 0;
    
    -- 팀 존재 여부 확인
    SELECT COUNT(*) INTO v_team_exists
    FROM team 
    WHERE team_id = NEW.team_id AND is_active = 1;
    
    IF v_team_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '존재하지 않는 팀입니다.';
    END IF;
END //
DELIMITER ;

-- 팀별 데이터 접근 제어를 위한 저장 프로시저
DELIMITER //
CREATE PROCEDURE GetTeamDataByAdmin(
    IN p_admin_id BIGINT,
    IN p_target_team_id BIGINT,
    IN p_data_type VARCHAR(50)
)
BEGIN
    DECLARE v_admin_team_id BIGINT;
    DECLARE v_can_access TINYINT(1) DEFAULT 0;
    DECLARE v_error_msg VARCHAR(500);
    
    -- 관리자 팀 정보 조회
    SELECT team_id INTO v_admin_team_id
    FROM admin 
    WHERE admin_id = p_admin_id AND use_yn = 'Y' AND is_active = 1;
    
    -- 팀별 접근 권한 검증
    IF v_admin_team_id != p_target_team_id THEN
        SET v_error_msg = '다른 팀 데이터에 접근할 수 없습니다.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END IF;
    
    -- 데이터 타입별 조회
    CASE p_data_type
        WHEN 'USERS' THEN
            SELECT u.*, t.team_name
            FROM user u
            JOIN team t ON u.team_id = t.team_id
            WHERE u.team_id = p_target_team_id AND u.is_active = 1;
        WHEN 'SCENARIOS' THEN
            SELECT s.*, t.team_name
            FROM scenario s
            JOIN team t ON s.team_id = t.team_id
            WHERE s.team_id = p_target_team_id AND s.is_active = 1;
        WHEN 'TRAINING_RESULTS' THEN
            SELECT tr.*, u.name as user_name, t.team_name
            FROM training_result tr
            JOIN training_participant tp ON tr.participant_id = tp.participant_id
            JOIN user u ON tr.user_id = u.user_id
            JOIN team t ON tp.team_id = t.team_id
            WHERE tp.team_id = p_target_team_id AND tr.is_active = 1;
        ELSE
            SET v_error_msg = '지원하지 않는 데이터 타입입니다.';
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END CASE;
    
END //
DELIMITER ;

-- MySQL 권한 검증을 위한 함수
DELIMITER //
CREATE FUNCTION CheckUserPermission(
    p_user_id BIGINT,
    p_required_permission VARCHAR(50)
) RETURNS TINYINT(1)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_has_permission TINYINT(1) DEFAULT 0;
    DECLARE v_admin_level VARCHAR(20);
    
    -- 사용자가 관리자인지 확인
    SELECT level_code INTO v_admin_level
    FROM admin a
    JOIN admin_level al ON a.admin_level_id = al.level_id
    WHERE a.admin_id = p_user_id AND a.use_yn = 'Y' AND a.is_active = 1;
    
    -- 권한 레벨에 따른 권한 확인
    CASE p_required_permission
        WHEN 'MANAGE_TEAM' THEN
            IF v_admin_level = 'TEAM_ADMIN' THEN
                SET v_has_permission = 1;
            END IF;
        WHEN 'MANAGE_USERS' THEN
            IF v_admin_level IN ('TEAM_ADMIN', 'TEAM_OPERATOR') THEN
                SET v_has_permission = 1;
            END IF;
        WHEN 'MANAGE_SCENARIOS' THEN
            IF v_admin_level IN ('TEAM_ADMIN', 'TEAM_OPERATOR') THEN
                SET v_has_permission = 1;
            END IF;
        WHEN 'APPROVE_SCENARIOS' THEN
            IF v_admin_level = 'TEAM_ADMIN' THEN
                SET v_has_permission = 1;
            END IF;
        WHEN 'VIEW_RESULTS' THEN
            IF v_admin_level IN ('TEAM_ADMIN', 'TEAM_OPERATOR') THEN
                SET v_has_permission = 1;
            END IF;
        ELSE
            SET v_has_permission = 0;
    END CASE;
    
    RETURN v_has_permission;
END //
DELIMITER ;

-- 팀별 데이터 격리를 위한 저장 프로시저
DELIMITER //
CREATE PROCEDURE GetTeamIsolatedData(
    IN p_admin_id BIGINT,
    IN p_data_type VARCHAR(50)
)
BEGIN
    DECLARE v_admin_team_id BIGINT;
    DECLARE v_error_msg VARCHAR(500);
    
    -- 관리자 팀 정보 조회
    SELECT team_id INTO v_admin_team_id
    FROM admin 
    WHERE admin_id = p_admin_id AND use_yn = 'Y' AND is_active = 1;
    
    IF v_admin_team_id IS NULL THEN
        SET v_error_msg = '유효하지 않은 관리자입니다.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END IF;
    
    -- 데이터 타입별 조회 (자신의 팀 데이터만)
    CASE p_data_type
        WHEN 'USERS' THEN
            SELECT u.*, t.team_name
            FROM user u
            JOIN team t ON u.team_id = t.team_id
            WHERE u.team_id = v_admin_team_id AND u.is_active = 1;
        WHEN 'SCENARIOS' THEN
            SELECT s.*, t.team_name
            FROM scenario s
            JOIN team t ON s.team_id = t.team_id
            WHERE s.team_id = v_admin_team_id AND s.is_active = 1;
        WHEN 'TRAINING_SESSIONS' THEN
            SELECT ts.*, t.team_name, s.title as scenario_title
            FROM training_session ts
            JOIN team t ON ts.team_id = t.team_id
            JOIN scenario s ON ts.scenario_id = s.scenario_id
            WHERE ts.team_id = v_admin_team_id AND ts.is_active = 1;
        WHEN 'TRAINING_RESULTS' THEN
            SELECT tr.*, u.name as user_name, t.team_name, s.title as scenario_title
            FROM training_result tr
            JOIN training_participant tp ON tr.participant_id = tp.participant_id
            JOIN user u ON tr.user_id = u.user_id
            JOIN team t ON tp.team_id = t.team_id
            JOIN scenario s ON tr.scenario_id = s.scenario_id
            WHERE tp.team_id = v_admin_team_id AND tr.is_active = 1;
        ELSE
            SET v_error_msg = '지원하지 않는 데이터 타입입니다.';
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END CASE;
    
END //
DELIMITER ;

-- 사용 예시 쿼리들
-- 1. 특정 팀의 사용자 수 조회
SELECT 
    t.team_name,
    COUNT(u.user_id) as user_count
FROM team t
LEFT JOIN user u ON t.team_id = u.team_id AND u.use_yn = 'Y' AND u.is_active = 1
WHERE t.is_active = 1
GROUP BY t.team_id, t.team_name;

-- 2. 권한별 관리자 수 조회
SELECT 
    al.level_name,
    COUNT(a.admin_id) as admin_count
FROM admin_level al
LEFT JOIN admin a ON al.level_id = a.admin_level_id AND a.use_yn = 'Y' AND a.is_active = 1
WHERE al.is_active = 1
GROUP BY al.level_id, al.level_name;

-- 3. 팀별 시나리오 통계
SELECT 
    t.team_name,
    COUNT(s.scenario_id) as total_scenarios,
    COUNT(CASE WHEN s.status = '활성화' THEN 1 END) as active_scenarios,
    COUNT(CASE WHEN s.status = '승인대기' THEN 1 END) as pending_scenarios
FROM team t
LEFT JOIN scenario s ON t.team_id = s.team_id AND s.is_active = 1
WHERE t.is_active = 1
GROUP BY t.team_id, t.team_name;

-- 4. 개인 훈련 결과 통계 (팀 중심)
SELECT 
    u.name as user_name,
    t.team_name,
    COUNT(tr.result_id) as total_trainings,
    AVG(tr.total_score) as avg_score,
    AVG(tr.accuracy_score) as avg_accuracy,
    AVG(tr.speed_score) as avg_speed
FROM user u
JOIN team t ON u.team_id = t.team_id
LEFT JOIN training_result tr ON u.user_id = tr.user_id AND tr.is_active = 1
WHERE u.is_active = 1 AND t.is_active = 1
GROUP BY u.user_id, u.name, t.team_name
ORDER BY avg_score DESC;

-- 5. 권한 검증 예시
-- 특정 사용자가 팀 관리 권한이 있는지 확인
SELECT 
    u.name,
    CheckUserPermission(u.user_id, 'MANAGE_TEAM') as can_manage_team,
    CheckUserPermission(u.user_id, 'MANAGE_USERS') as can_manage_users
FROM user u
WHERE u.user_id = 1;

-- 6. 팀별 데이터 접근 제어 테스트
-- CALL GetTeamIsolatedData(1, 'USERS');
-- CALL GetTeamIsolatedData(1, 'SCENARIOS');
-- CALL GetTeamIsolatedData(1, 'TRAINING_RESULTS');
