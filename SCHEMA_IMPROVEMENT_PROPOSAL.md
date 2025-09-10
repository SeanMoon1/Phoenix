# 🗄️ Phoenix 데이터베이스 스키마 개선 제안

## 📋 현재 문제점

### 1. 시나리오 데이터 구조 불일치

- Frontend JSON과 DB 스키마 간 필드 불일치
- `scene` 테이블 누락으로 씬별 데이터 저장 불가
- `difficulty` 컬럼 누락

### 2. 시나리오 ID 중복 위험

- 여러 시나리오가 동일한 `id: 1` 사용
- `scenario_code`로만 구분하는 구조의 한계

## 🔧 개선 방안

### 1. 시나리오 테이블 수정

```sql
-- 기존 scenario 테이블에 difficulty 컬럼 추가
ALTER TABLE scenario
ADD COLUMN difficulty VARCHAR(20) NOT NULL DEFAULT 'easy'
COMMENT '난이도 (easy, medium, hard, expert)'
AFTER risk_level;

-- scenario_code에 UNIQUE 제약 추가 (전체 DB에서 유일)
ALTER TABLE scenario
ADD CONSTRAINT uk_scenario_code UNIQUE (scenario_code);
```

### 2. 시나리오 씬 테이블 추가

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
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    created_by BIGINT NOT NULL COMMENT '생성자 ID',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    updated_by BIGINT COMMENT '수정자 ID',
    deleted_at DATETIME NULL COMMENT '삭제일시',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
    UNIQUE KEY uk_scenario_scene_code (scenario_id, scene_code)
);
```

### 3. 선택 옵션 테이블 수정

```sql
-- 기존 choice_option 테이블에 씬 정보 추가
ALTER TABLE choice_option
ADD COLUMN scene_id BIGINT COMMENT '씬 ID'
AFTER scenario_id;

-- 씬 ID 외래키 추가
ALTER TABLE choice_option
ADD CONSTRAINT fk_choice_scene
FOREIGN KEY (scene_id) REFERENCES scenario_scene(scene_id);

-- 선택 옵션에 포인트 정보 추가
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
ADD COLUMN next_scene_code VARCHAR(50) COMMENT '다음 씬 코드'
AFTER exp_points;
```

### 4. 시나리오 코드 체계 개선

```sql
-- 시나리오 코드 체계 개선
-- 형식: {DISASTER_TYPE}{SEQUENCE_NUMBER}
-- 예시: FIRE001, EMERGENCY001, TRAFFIC001, EARTHQUAKE001

-- 기존 데이터 업데이트 예시
UPDATE scenario SET scenario_code = 'FIRE001' WHERE disaster_type = 'fire' AND scenario_code = 'SCEN001';
UPDATE scenario SET scenario_code = 'EMERGENCY001' WHERE disaster_type = 'emergency' AND scenario_code = 'EMERGENCY001';
UPDATE scenario SET scenario_code = 'TRAFFIC001' WHERE disaster_type = 'traffic' AND scenario_code = 'TRAFFIC001';
UPDATE scenario SET scenario_code = 'EARTHQUAKE001' WHERE disaster_type = 'earthquake';
```

## 📊 개선된 데이터 구조

### 시나리오 테이블 (수정)

```sql
scenario (
    scenario_id BIGINT PRIMARY KEY,           -- 자동 증가 ID
    team_id BIGINT NOT NULL,                  -- 팀 ID
    scenario_code VARCHAR(50) UNIQUE,         -- 시나리오 코드 (FIRE001, EMERGENCY001 등)
    title VARCHAR(255) NOT NULL,              -- 시나리오 제목
    disaster_type VARCHAR(50) NOT NULL,       -- 재난 유형
    description TEXT NOT NULL,                -- 시나리오 설명
    risk_level VARCHAR(20) NOT NULL,          -- 위험도
    difficulty VARCHAR(20) NOT NULL,          -- 난이도 (NEW!)
    -- ... 기타 컬럼들
);
```

### 시나리오 씬 테이블 (신규)

```sql
scenario_scene (
    scene_id BIGINT PRIMARY KEY,              -- 자동 증가 ID
    scenario_id BIGINT NOT NULL,              -- 시나리오 ID
    scene_code VARCHAR(50) NOT NULL,          -- 씬 코드 (#1-1, #1-2 등)
    scene_order INT NOT NULL,                 -- 씬 순서
    title VARCHAR(255) NOT NULL,              -- 씬 제목
    content TEXT NOT NULL,                    -- 씬 내용
    scene_script TEXT NOT NULL,               -- 씬 스크립트
    -- ... 기타 컬럼들
);
```

## 🎯 Frontend JSON 구조 개선

### 개선된 JSON 구조

```json
{
  "scenarioCode": "FIRE001", // 시나리오 코드 (UNIQUE)
  "title": "아파트 화재 경보", // 시나리오 제목
  "disasterType": "fire", // 재난 유형
  "riskLevel": "MEDIUM", // 위험도
  "difficulty": "easy", // 난이도
  "scenes": [
    // 씬 배열
    {
      "sceneCode": "#1-1", // 씬 코드
      "title": "아파트 화재 경보", // 씬 제목
      "content": "새벽 3시...", // 씬 내용
      "sceneScript": "화재 경보가...", // 씬 스크립트
      "order": 1, // 씬 순서
      "options": [
        // 선택 옵션
        {
          "answerId": "answer1", // 답변 ID
          "answer": "가족을 깨우고...", // 답변 텍스트
          "reaction": "정답!...", // 반응
          "nextSceneCode": "#1-2", // 다음 씬 코드
          "points": {
            // 점수 정보
            "speed": 10,
            "accuracy": 10
          },
          "exp": 50 // 경험치
        }
      ]
    }
  ]
}
```

## 🚀 마이그레이션 전략

### 1. 단계별 마이그레이션

1. **스키마 수정**: 테이블 구조 변경
2. **데이터 변환**: 기존 JSON 데이터를 DB 형식으로 변환
3. **Frontend 수정**: 새로운 데이터 구조에 맞게 수정
4. **테스트**: 데이터 일관성 검증

### 2. 데이터 변환 스크립트

```typescript
// JSON to DB 변환 예시
const convertScenarioToDB = (jsonData: any) => {
  return {
    scenario_code: jsonData.scenarioCode,
    title: jsonData.title,
    disaster_type: jsonData.disasterType,
    risk_level: jsonData.riskLevel,
    difficulty: jsonData.difficulty,
    description: jsonData.content,
    // ... 기타 필드들
  };
};
```

## 📈 기대 효과

### 1. 데이터 일관성 향상

- 시나리오 코드로 명확한 구분
- 씬별 데이터 구조화
- 중복 데이터 방지

### 2. 확장성 개선

- 새로운 시나리오 유형 추가 용이
- 씬별 세부 관리 가능
- 통계 및 분석 데이터 풍부화

### 3. 유지보수성 향상

- 명확한 데이터 구조
- 일관된 네이밍 컨벤션
- 타입 안전성 보장

---

**작성일**: 2024년 12월 19일  
**작성자**: AI Assistant  
**상태**: 제안 단계
