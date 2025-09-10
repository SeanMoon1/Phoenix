# 🗄️ 개선된 시나리오 스키마 설계

## 📋 현재 스키마 문제점 분석

### 1. **시나리오 ID 중복 문제**

- JSON 파일에서 모든 시나리오가 `id: 1` 사용
- `scenario_code`로만 구분하는 구조의 한계
- 시나리오 종류가 늘어나면 충돌 위험

### 2. **씬 데이터 저장 불가**

- `scenario_scene` 테이블이 존재하지 않음
- JSON의 `sceneId: "#1-1"` 데이터를 저장할 수 없음
- 씬별 순서와 내용 관리 불가

### 3. **데이터 구조 불일치**

- JSON의 씬 구조와 DB의 이벤트 구조 불일치
- `difficulty` 필드가 DB에 없음
- 포인트 시스템 정보 부족

## 🔧 개선된 스키마 설계

### 1. 시나리오 테이블 개선

```sql
-- 기존 scenario 테이블에 difficulty 컬럼 추가
ALTER TABLE scenario
ADD COLUMN difficulty VARCHAR(20) NOT NULL DEFAULT 'easy'
COMMENT '난이도 (easy, medium, hard, expert)'
AFTER risk_level;

-- 시나리오 코드 고유성 보장을 위한 인덱스 추가
ALTER TABLE scenario
ADD UNIQUE KEY uk_team_scenario_code (team_id, scenario_code);

-- 시나리오 코드 자동 생성 함수 (선택사항)
DELIMITER $$
CREATE FUNCTION generate_scenario_code(team_id BIGINT, disaster_type VARCHAR(50))
RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_number INT;
    DECLARE type_code VARCHAR(3);
    DECLARE result_code VARCHAR(50);

    -- 재난 유형별 코드 생성 (FIRE, EAR, EME, TRA, FLO)
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
    AND scenario_code LIKE CONCAT(type_code, '%');

    SET result_code = CONCAT(type_code, LPAD(next_number, 3, '0'));
    RETURN result_code;
END$$
DELIMITER ;
```

### 2. 시나리오 씬 테이블 생성

```sql
-- 시나리오 씬 테이블 생성
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
```

### 3. 선택 옵션 테이블 개선

```sql
-- choice_option 테이블에 씬 관련 컬럼 추가
ALTER TABLE choice_option
ADD COLUMN scene_id BIGINT COMMENT '씬 ID'
AFTER scenario_id;

-- 포인트 시스템 컬럼 추가
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

-- 외래키 제약조건 추가
ALTER TABLE choice_option
ADD CONSTRAINT fk_choice_scene
FOREIGN KEY (scene_id) REFERENCES scenario_scene(scene_id) ON DELETE CASCADE;

-- 인덱스 추가
ALTER TABLE choice_option
ADD INDEX idx_scene_options (scene_id);

ALTER TABLE choice_option
ADD INDEX idx_next_scene (next_scene_code);
```

### 4. 시나리오 ID 고유성 보장 전략

```sql
-- 시나리오 ID 자동 증가 설정 (글로벌 시퀀스)
-- 각 팀별로 독립적인 시나리오 ID 관리
ALTER TABLE scenario
MODIFY COLUMN scenario_id BIGINT AUTO_INCREMENT;

-- 시나리오 코드 생성 트리거
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

-- 시나리오 코드 중복 방지 트리거
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
```

## 🎯 시나리오 ID 고유성 보장 전략

### 1. **계층적 ID 구조**

```
시나리오 ID = 팀ID + 재난유형코드 + 시퀀스번호
예: 1FIR001, 1EAR001, 1EME001
```

### 2. **자동 생성 규칙**

- **팀 ID**: 1 (현재 단일 팀)
- **재난 유형 코드**:
  - `FIR` (화재)
  - `EAR` (지진)
  - `EME` (응급처치)
  - `TRA` (교통사고)
  - `FLO` (홍수)
- **시퀀스 번호**: 001, 002, 003...

### 3. **충돌 방지 메커니즘**

- 데이터베이스 레벨에서 UNIQUE 제약조건
- 트리거를 통한 자동 코드 생성
- 중복 검사 및 예외 처리

## 📊 개선된 데이터 구조 예시

### 시나리오 데이터

```sql
-- 화재 시나리오
INSERT INTO scenario (team_id, scenario_code, title, disaster_type, risk_level, difficulty, description, created_by)
VALUES (1, 'FIR001', '아파트 화재 대응', 'fire', 'MEDIUM', 'easy', '새벽 3시 아파트 화재 상황 대응', 1);

-- 지진 시나리오
INSERT INTO scenario (team_id, scenario_code, title, disaster_type, risk_level, difficulty, description, created_by)
VALUES (1, 'EAR001', '지진 대피 훈련', 'earthquake', 'HIGH', 'medium', '지진 발생 시 대피 절차 훈련', 1);
```

### 씬 데이터

```sql
-- 화재 시나리오 씬들
INSERT INTO scenario_scene (scenario_id, scene_code, scene_order, title, content, scene_script, created_by)
VALUES
(1, '#1-1', 1, '화재 경보 발생', '새벽 3시, 아파트 화재 경보가 울렸습니다...', '경보음이 울리고 있습니다...', 1),
(1, '#1-2', 2, '현장 확인', '화재 현장을 확인해야 합니다...', '현장 상황을 파악하세요...', 1);

-- 지진 시나리오 씬들
INSERT INTO scenario_scene (scenario_id, scene_code, scene_order, title, content, scene_script, created_by)
VALUES
(2, '#2-1', 1, '지진 발생', '지진이 발생했습니다...', '땅이 흔들리고 있습니다...', 1),
(2, '#2-2', 2, '대피 준비', '안전한 곳으로 대피해야 합니다...', '대피 준비를 하세요...', 1);
```

### 선택 옵션 데이터

```sql
-- 화재 시나리오 씬 1의 선택지들
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, speed_points, accuracy_points, exp_points, is_correct, next_scene_code, created_by)
VALUES
(1, 1, 'FIR001_OPT001', '119에 신고한다', '신고를 완료했습니다.', 10, 10, 50, 1, '#1-2', 1),
(1, 1, 'FIR001_OPT002', '직접 진화한다', '위험합니다!', 5, 0, 10, 0, '#1-1', 1);
```

## 🚀 마이그레이션 실행 계획

### 1. **1단계: 스키마 수정**

```sql
-- difficulty 컬럼 추가
-- scenario_scene 테이블 생성
-- choice_option 테이블 개선
```

### 2. **2단계: 데이터 마이그레이션**

```sql
-- 기존 decision_event 데이터를 scenario_scene으로 변환
-- JSON 데이터를 새로운 구조로 변환
-- 시나리오 코드 자동 생성
```

### 3. **3단계: 변환기 업데이트**

```typescript
-- 새로운 스키마에 맞는 변환 로직 구현
-- 씬 기반 데이터 구조로 변경
-- 시나리오 ID 고유성 보장
```

## ✅ 개선 효과

### 1. **데이터 일관성**

- 시나리오 ID 고유성 보장
- 씬별 세부 관리 가능
- JSON과 DB 간 완벽한 매핑

### 2. **확장성**

- 새로운 시나리오 유형 추가 용이
- 팀별 독립적인 시나리오 관리
- 무제한 시나리오 생성 가능

### 3. **유지보수성**

- 명확한 데이터 구조
- 자동화된 ID 생성
- 타입 안전성 보장

---

**작성일**: 2024년 12월 19일  
**작성자**: AI Assistant  
**상태**: 설계 완료
