# Phoenix 데이터베이스 설계 문서

## 📊 데이터베이스 개요

Phoenix 재난 대응 훈련 시스템의 MySQL 데이터베이스 설계 문서입니다.

## 🗄️ 데이터베이스 구조

### 핵심 테이블

#### 1. 팀 관리

- **`team`** - 팀 정보
- **`admin_level`** - 권한 레벨 정의
- **`admin`** - 관리자 정보

#### 2. 사용자 관리

- **`user`** - 사용자 정보 (게임화 시스템 포함)
- **`user_progress`** - 사용자 진행상황
- **`user_level_history`** - 레벨업 히스토리
- **`user_scenario_stats`** - 시나리오별 통계

#### 3. 시나리오 시스템

- **`scenario`** - 시나리오 정보
- **`decision_event`** - 의사결정 이벤트
- **`choice_option`** - 선택 옵션

#### 4. 훈련 시스템

- **`training_session`** - 훈련 세션
- **`training_participant`** - 훈련 참가자
- **`training_result`** - 훈련 결과
- **`user_choice_log`** - 사용자 선택 로그

#### 5. 게임화 시스템

- **`achievement`** - 성취 시스템

#### 6. 지원 시스템

- **`inquiry`** - 문의사항
- **`faq`** - FAQ

#### 7. 코드 관리

- **`code`** - 시스템/팀별 코드

## 🎮 게임화 시스템

### 레벨 시스템

- **사용자 레벨**: 1-100
- **경험치 시스템**: 시나리오 완료 시 경험치 획득
- **등급 시스템**: 초급자, 중급자, 고급자, 전문가, 마스터

### 성취 시스템

- **성취 유형**: 시나리오 완료, 연속 완료, 고득점 등
- **진행도 추적**: 0-100% 달성도
- **달성 시점 기록**: 언제 달성했는지 추적

### 통계 시스템

- **시나리오별 통계**: 완료 횟수, 최고점수, 평균점수
- **시간 추적**: 총 소요시간, 평균 소요시간
- **연속 완료**: 현재 연속, 최장 연속 기록

## 🔐 권한 시스템

### 권한 레벨

1. **팀관리자 (TEAM_ADMIN)**

   - 팀 전체 관리
   - 사용자 관리
   - 시나리오 관리 및 승인
   - 결과 조회

2. **팀운영자 (TEAM_OPERATOR)**

   - 사용자 관리
   - 시나리오 관리
   - 결과 조회

3. **일반사용자 (GENERAL_USER)**
   - 기본 훈련 참여

### 팀별 데이터 격리

- 모든 데이터는 팀 단위로 격리
- 관리자는 자신의 팀 데이터만 접근 가능
- 저장 프로시저를 통한 권한 검증

## 📈 성능 최적화

### 인덱스 설계

```sql
-- 사용자 관련 인덱스
CREATE INDEX idx_user_team ON user(team_id);
CREATE INDEX idx_user_level ON user(user_level);
CREATE INDEX idx_user_exp ON user(user_exp);

-- 시나리오 관련 인덱스
CREATE INDEX idx_scenario_team ON scenario(team_id);
CREATE INDEX idx_decision_event_scenario ON decision_event(scenario_id);

-- 훈련 결과 관련 인덱스
CREATE INDEX idx_training_result_participant ON training_result(participant_id);
CREATE INDEX idx_user_choice_log_result ON user_choice_log(result_id);
```

### 뷰 설계

- **`v_admin_access_control`** - 관리자 권한 요약
- **`v_team_data_access`** - 팀별 데이터 접근 제어
- **`v_user_permission_summary`** - 사용자별 권한 요약

## 🔄 데이터 마이그레이션

### TypeORM 마이그레이션

```bash
# 마이그레이션 생성
npm run migration:generate -- src/database/migrations/MigrationName

# 마이그레이션 실행
npm run migration:run

# 마이그레이션 되돌리기
npm run migration:revert
```

### 수동 SQL 마이그레이션

- `Database/schema/phoenix_schema_mysql.sql` - 전체 스키마
- `Database/migrations/` - 수동 마이그레이션 파일들

## 🗃️ 데이터 백업

### 백업 전략

- **일일 백업**: 전체 데이터베이스
- **주간 백업**: 스키마 + 데이터
- **월간 백업**: 아카이브 백업

### 백업 스크립트

```bash
# 전체 백업
mysqldump -u root -p phoenix > backup_$(date +%Y%m%d).sql

# 스키마만 백업
mysqldump -u root -p --no-data phoenix > schema_backup.sql

# 특정 테이블만 백업
mysqldump -u root -p phoenix user scenario > tables_backup.sql
```

## 🔧 데이터베이스 설정

### 개발 환경

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=phoenix_dev
DB_PASSWORD=phoenix_dev_2024
DB_DATABASE=phoenix
```

### 운영 환경

```env
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=3306
DB_USERNAME=phoenix_prod
DB_PASSWORD=secure_production_password
DB_DATABASE=phoenix
```

## 📊 모니터링

### 성능 모니터링

- **슬로우 쿼리 로그** 활성화
- **쿼리 실행 시간** 추적
- **인덱스 사용률** 모니터링

### 용량 모니터링

- **테이블별 용량** 추적
- **로그 파일 크기** 모니터링
- **백업 파일 크기** 관리

## 🚀 AWS RDS 최적화

### 인스턴스 타입

- **개발**: db.t3.micro
- **스테이징**: db.t3.small
- **운영**: db.t3.medium 이상

### 스토리지

- **GP2 SSD** 사용
- **자동 백업** 활성화
- **멀티 AZ** 배포 (운영환경)

### 보안

- **VPC 내부** 배치
- **보안 그룹** 설정
- **SSL 연결** 강제
