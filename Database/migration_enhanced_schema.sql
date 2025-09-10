-- =====================================================
-- Phoenix 시나리오 스키마 개선 마이그레이션
-- 생성일: 2024년 12월 19일
-- 설명: 시나리오 씬 테이블 생성 및 ID 고유성 보장
-- =====================================================

-- 1. 시나리오 테이블에 difficulty 컬럼 추가
ALTER TABLE scenario 
ADD COLUMN difficulty VARCHAR(20) NOT NULL DEFAULT 'easy' 
COMMENT '난이도 (easy, medium, hard, expert)' 
AFTER risk_level;

-- 2. 시나리오 코드 고유성 보장을 위한 인덱스 추가
ALTER TABLE scenario 
ADD UNIQUE KEY uk_team_scenario_code (team_id, scenario_code);

-- 3. 시나리오 씬 테이블 생성
CREATE TABLE scenario_scene (
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

-- 4. choice_option 테이블에 씬 관련 컬럼 추가
ALTER TABLE choice_option 
ADD COLUMN scene_id BIGINT COMMENT '씬 ID' 
AFTER scenario_id;

-- 5. 포인트 시스템 컬럼 추가
ALTER TABLE choice_option 
ADD COLUMN speed_points INT NOT NULL DEFAULT 0 COMMENT '속도 점수' 
AFTER is_correct;

ALTER TABLE choice_option 
ADD COLUMN accuracy_points INT NOT NULL DEFAULT 0 COMMENT '정확도 점수' 
AFTER speed_points;

ALTER TABLE choice_option 
ADD COLUMN exp_points INT NOT NULL DEFAULT 0 COMMENT '경험치 점수' 
AFTER accuracy_points;

ALTER TABLE choice_option 
ADD COLUMN reaction_text TEXT COMMENT '선택 후 반응 텍스트' 
AFTER exp_points;

ALTER TABLE choice_option 
ADD COLUMN next_scene_code VARCHAR(50) COMMENT '다음 씬 코드' 
AFTER reaction_text;

-- 6. 외래키 제약조건 추가
ALTER TABLE choice_option 
ADD CONSTRAINT fk_choice_scene 
FOREIGN KEY (scene_id) REFERENCES scenario_scene(scene_id) ON DELETE CASCADE;

-- 7. 인덱스 추가
ALTER TABLE choice_option 
ADD INDEX idx_scene_options (scene_id);

ALTER TABLE choice_option 
ADD INDEX idx_next_scene (next_scene_code);

-- 8. 시나리오 코드 자동 생성 함수
DELIMITER $$
CREATE FUNCTION generate_scenario_code(team_id BIGINT, disaster_type VARCHAR(50)) 
RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_number INT;
    DECLARE type_code VARCHAR(3);
    DECLARE result_code VARCHAR(50);
    
    -- 재난 유형별 코드 생성
    SET type_code = CASE 
        WHEN disaster_type = 'fire' THEN 'FIR'
        WHEN disaster_type = 'earthquake' THEN 'EAR'
        WHEN disaster_type = 'emergency' THEN 'EME'
        WHEN disaster_type = 'traffic' THEN 'TRA'
        WHEN disaster_type = 'flood' THEN 'FLO'
        ELSE 'GEN'
    END;
    
    -- 다음 시퀀스 번호 조회
    SELECT COALESCE(MAX(CAST(SUBSTRING(scenario_code, 5) AS UNSIGNED)), 0) + 1
    INTO next_number
    FROM scenario 
    WHERE team_id = team_id 
    AND scenario_code LIKE CONCAT(type_code, '%')
    AND is_active = 1;
    
    SET result_code = CONCAT(type_code, LPAD(next_number, 3, '0'));
    RETURN result_code;
END$$
DELIMITER ;

-- 9. 시나리오 코드 생성 트리거
DELIMITER $$
CREATE TRIGGER tr_scenario_code_generation
BEFORE INSERT ON scenario
FOR EACH ROW
BEGIN
    IF NEW.scenario_code IS NULL OR NEW.scenario_code = '' THEN
        SET NEW.scenario_code = generate_scenario_code(NEW.team_id, NEW.disaster_type);
    END IF;
END$$
DELIMITER ;

-- 10. 시나리오 코드 중복 방지 트리거
DELIMITER $$
CREATE TRIGGER tr_scenario_code_unique
BEFORE INSERT ON scenario
FOR EACH ROW
BEGIN
    DECLARE code_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO code_count
    FROM scenario 
    WHERE team_id = NEW.team_id 
    AND scenario_code = NEW.scenario_code
    AND is_active = 1;
    
    IF code_count > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = '시나리오 코드가 이미 존재합니다.';
    END IF;
END$$
DELIMITER ;

-- 11. 기존 데이터 마이그레이션 (선택사항)
-- 기존 decision_event 데이터가 있다면 scenario_scene으로 변환
-- INSERT INTO scenario_scene (scenario_id, scene_code, scene_order, title, content, scene_script, created_by)
-- SELECT 
--     scenario_id,
--     CONCAT('#', scenario_id, '-', event_order) as scene_code,
--     event_order as scene_order,
--     CONCAT('씬 ', event_order) as title,
--     event_description as content,
--     event_description as scene_script,
--     created_by
-- FROM decision_event
-- WHERE is_active = 1;

-- 12. 샘플 데이터 삽입 (테스트용)
-- 화재 시나리오
INSERT INTO scenario (team_id, scenario_code, title, disaster_type, risk_level, difficulty, description, created_by) 
VALUES (1, 'FIR001', '아파트 화재 대응', 'fire', 'MEDIUM', 'easy', '새벽 3시 아파트 화재 상황 대응', 1);

-- 지진 시나리오  
INSERT INTO scenario (team_id, scenario_code, title, disaster_type, risk_level, difficulty, description, created_by)
VALUES (1, 'EAR001', '지진 대피 훈련', 'earthquake', 'HIGH', 'medium', '지진 발생 시 대피 절차 훈련', 1);

-- 응급처치 시나리오
INSERT INTO scenario (team_id, scenario_code, title, disaster_type, risk_level, difficulty, description, created_by)
VALUES (1, 'EME001', '응급처치 기본', 'emergency', 'LOW', 'easy', '기본 응급처치 방법 훈련', 1);

-- 교통사고 시나리오
INSERT INTO scenario (team_id, scenario_code, title, disaster_type, risk_level, difficulty, description, created_by)
VALUES (1, 'TRA001', '교통사고 대응', 'traffic', 'MEDIUM', 'medium', '교통사고 발생 시 대응 절차', 1);

-- 13. 샘플 씬 데이터 삽입 (테스트용)
-- 화재 시나리오 씬들
INSERT INTO scenario_scene (scenario_id, scene_code, scene_order, title, content, scene_script, created_by)
VALUES 
(1, '#1-1', 1, '화재 경보 발생', '새벽 3시, 아파트 화재 경보가 울렸습니다. 연기가 복도로 퍼져나가고 있습니다.', '경보음이 울리고 있습니다. 연기가 보입니다.', 1),
(1, '#1-2', 2, '현장 확인', '화재 현장을 확인해야 합니다. 어디서 불이 났는지 파악하세요.', '현장 상황을 파악하세요. 안전을 우선으로 하세요.', 1),
(1, '#1-3', 3, '대피 결정', '대피할지 진화할지 결정해야 합니다.', '빠른 판단이 필요합니다.', 1);

-- 지진 시나리오 씬들
INSERT INTO scenario_scene (scenario_id, scene_code, scene_order, title, content, scene_script, created_by)
VALUES 
(2, '#2-1', 1, '지진 발생', '지진이 발생했습니다. 땅이 흔들리고 있습니다.', '땅이 흔들리고 있습니다. 안전한 곳을 찾으세요.', 1),
(2, '#2-2', 2, '대피 준비', '안전한 곳으로 대피해야 합니다.', '대피 준비를 하세요. 머리를 보호하세요.', 1),
(2, '#2-3', 3, '대피 실행', '대피를 실행합니다.', '차근차근 대피하세요.', 1);

-- 14. 샘플 선택 옵션 데이터 삽입 (테스트용)
-- 화재 시나리오 씬 1의 선택지들
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, speed_points, accuracy_points, exp_points, is_correct, next_scene_code, created_by)
VALUES 
(1, 1, 'FIR001_OPT001', '119에 신고한다', '신고를 완료했습니다. 소방서에서 출동한다고 합니다.', 10, 10, 50, 1, '#1-2', 1),
(1, 1, 'FIR001_OPT002', '직접 진화한다', '위험합니다! 연기가 더 심해질 수 있습니다.', 5, 0, 10, 0, '#1-1', 1),
(1, 1, 'FIR001_OPT003', '대피한다', '안전한 곳으로 대피하세요.', 8, 8, 30, 1, '#1-3', 1);

-- 화재 시나리오 씬 2의 선택지들
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, speed_points, accuracy_points, exp_points, is_correct, next_scene_code, created_by)
VALUES 
(2, 1, 'FIR001_OPT004', '화재 위치 확인', '화재 위치를 확인했습니다. 3층에서 발생했습니다.', 10, 10, 50, 1, '#1-3', 1),
(2, 1, 'FIR001_OPT005', '소화기 사용', '소화기를 사용해보세요.', 7, 5, 25, 0, '#1-2', 1);

-- 지진 시나리오 씬 1의 선택지들
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, speed_points, accuracy_points, exp_points, is_correct, next_scene_code, created_by)
VALUES 
(4, 2, 'EAR001_OPT001', '책상 아래로 숨는다', '책상 아래로 숨었습니다. 안전합니다.', 10, 10, 50, 1, '#2-2', 1),
(4, 2, 'EAR001_OPT002', '바로 밖으로 나간다', '위험합니다! 떨어지는 물건에 맞을 수 있습니다.', 3, 0, 5, 0, '#2-1', 1);

-- 15. 마이그레이션 완료 확인
SELECT 'Migration completed successfully' as status;

-- 16. 생성된 테이블 및 데이터 확인
SELECT 'Scenario count:' as info, COUNT(*) as count FROM scenario;
SELECT 'Scene count:' as info, COUNT(*) as count FROM scenario_scene;
SELECT 'Option count:' as info, COUNT(*) as count FROM choice_option;

-- 17. 시나리오 코드 생성 테스트
SELECT 'Testing scenario code generation:' as info;
SELECT generate_scenario_code(1, 'fire') as fire_code;
SELECT generate_scenario_code(1, 'earthquake') as earthquake_code;
SELECT generate_scenario_code(1, 'emergency') as emergency_code;
