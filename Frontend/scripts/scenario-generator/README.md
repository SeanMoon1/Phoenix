# 시나리오 생성기 (Scenario Generator)

Phoenix 시스템용 시나리오 데이터를 생성하고 변환하는 도구입니다.

## 📋 기능

### 1. 데이터 변환

- **JSON → MySQL INSERT**: 시나리오 JSON을 MySQL INSERT 문으로 변환
- **데이터 검증**: 시나리오 데이터 유효성 검사
- **형식 표준화**: Phoenix 시스템 형식에 맞게 데이터 변환

### 2. 배치 처리

- **대량 시나리오 생성**: 여러 시나리오를 한 번에 처리
- **자동 ID 생성**: 시나리오, 이벤트, 선택지 ID 자동 생성
- **관계 매핑**: 시나리오 간 관계 자동 설정

### 3. 데이터 관리

- **백업 생성**: 변환 전 원본 데이터 백업
- **버전 관리**: 시나리오 버전 추적
- **통계 생성**: 시나리오 통계 및 분석

## 🚀 사용법

### 설치 및 빌드

```bash
# 의존성 설치
npm install

# TypeScript 빌드
npm run build

# 개발 모드 실행
npm run dev
```

### 기본 변환

```bash
# 단일 시나리오 변환
npm run convert ../data/fire_training_scenario.json

# 모든 시나리오 변환
npm run convert-all

# 데이터 검증
npm run validate
```

### 고급 옵션

```bash
# 특정 팀 ID로 변환
npm run convert ../data/fire_training_scenario.json -- --team-id=2

# 백업 생성과 함께 변환
npm run convert ../data/fire_training_scenario.json -- --backup

# 상세 로그와 함께 변환
npm run convert ../data/fire_training_scenario.json -- --verbose

# 통계 생성
npm run stats
```

### CLI 직접 사용

```bash
# 빌드 후 직접 실행
node dist/convert-scenario.js ../data/fire_training_scenario.json --team-id=2 --backup

# 또는 ts-node로 직접 실행
npx ts-node src/convert-scenario.ts ../data/fire_training_scenario.json --verbose
```

## 📁 파일 구조

```
scenario-generator/
├── README.md                 # 이 파일
├── package.json              # 프로젝트 설정
├── tsconfig.json             # TypeScript 설정
├── src/                      # 소스 코드
│   ├── index.ts              # 메인 진입점
│   ├── types.ts              # 타입 정의
│   ├── config.ts             # 설정 및 템플릿
│   ├── logger.ts             # 로깅 유틸리티
│   ├── validator.ts          # 데이터 검증기
│   ├── converter.ts          # 데이터 변환기
│   ├── convert-scenario.ts   # 단일 시나리오 변환
│   ├── convert-all.ts        # 모든 시나리오 변환
│   └── validate-data.ts      # 데이터 검증
├── dist/                     # 빌드된 JavaScript 파일
├── templates/                # 템플릿 파일
└── output/                   # 출력 파일
    ├── sql/                  # 생성된 SQL 파일
    ├── backup/               # 백업 파일
    └── stats/                # 통계 파일
```

## 🔧 설정

### 환경 변수

```bash
# .env 파일 생성
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=phoenix_dev
DB_PASSWORD=phoenix_dev_2024
DB_DATABASE=phoenix
```

### 설정 파일

```json
// config.json
{
  "defaultTeamId": 1,
  "defaultCreatedBy": 1,
  "backupEnabled": true,
  "validateData": true,
  "outputFormat": "sql"
}
```

## 📊 출력 형식

### MySQL INSERT 문 예시

```sql
-- 시나리오 생성
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, approval_status, created_by, created_at)
VALUES (1, 'SCEN001', '감염된 도시의 화재 경보', '세상의 끝이 온 지 몇 달...', 'fire', 'MEDIUM', 'easy', 'ACTIVE', 'APPROVED', 1, NOW());

-- 의사결정 이벤트 생성
INSERT INTO decision_event (scenario_id, event_code, title, content, event_script, event_order, event_type, created_by, created_at)
VALUES (LAST_INSERT_ID(), 'EVENT001', '감염된 도시의 화재 경보', '세상의 끝이 온 지 몇 달...', '경보가 울리고...', 1, 'CHOICE', 1, NOW());

-- 선택 옵션 생성
INSERT INTO choice_option (event_id, option_code, option_text, reaction_text, next_event_id, points_speed, points_accuracy, exp_reward, is_correct, created_by, created_at)
VALUES (LAST_INSERT_ID(), 'OPT001', '주변 생존자들에게 소리치고 긴급 신호 보내기', '정답! 목소리가 떨리지만...', '#1-2', 10, 10, 50, 1, 1, NOW());
```

## 🚨 주의사항

1. **데이터 백업**: 변환 전 항상 원본 데이터를 백업하세요
2. **ID 충돌**: 기존 데이터와 ID가 충돌하지 않도록 주의하세요
3. **관계 무결성**: 시나리오-이벤트-선택지 간 관계를 확인하세요
4. **권한 확인**: 데이터베이스 쓰기 권한이 있는지 확인하세요

## 🔍 트러블슈팅

### 일반적인 문제

- **JSON 파싱 오류**: JSON 형식이 올바른지 확인
- **ID 충돌**: 기존 데이터베이스의 ID 범위 확인
- **관계 오류**: next_event_id가 존재하는지 확인

### 로그 확인

```bash
# 상세 로그와 함께 실행
node convert-scenario.js --verbose ../data/fire_training_scenario.json

# 디버그 모드
node convert-scenario.js --debug ../data/fire_training_scenario.json
```
