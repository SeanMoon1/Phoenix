# Phoenix Backend API 문서

## 📚 API 개요

Phoenix 재난 대응 훈련 시스템의 Backend API 문서입니다.

### Base URL

- 개발환경: `http://localhost:3000/api`
- 프로덕션: `https://your-domain.com/api`

### 인증

JWT Bearer Token을 사용합니다.

```
Authorization: Bearer <your-jwt-token>
```

## 🔐 인증 (Auth)

### POST /auth/login

사용자 로그인

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "userLevel": 5,
    "currentTier": "초급자"
  }
}
```

### POST /auth/register

사용자 회원가입

**Request Body:**

```json
{
  "teamId": 1,
  "userCode": "USER001",
  "loginId": "user001",
  "name": "홍길동",
  "email": "user@example.com",
  "password": "password123"
}
```

## 👥 사용자 관리 (Users)

### GET /users

모든 사용자 조회

### GET /users/:id

특정 사용자 조회

### POST /users

사용자 생성

### PUT /users/:id

사용자 정보 수정

### DELETE /users/:id

사용자 삭제

## 🏢 팀 관리 (Teams)

### GET /teams

모든 팀 조회

### GET /teams/:id

특정 팀 조회

### POST /teams

팀 생성

### PUT /teams/:id

팀 정보 수정

### DELETE /teams/:id

팀 삭제

## 📋 시나리오 관리 (Scenarios)

### GET /scenarios

모든 시나리오 조회

### GET /scenarios/:id

특정 시나리오 조회

### POST /scenarios

시나리오 생성

### PUT /scenarios/:id

시나리오 수정

### DELETE /scenarios/:id

시나리오 삭제

## 🎯 훈련 관리 (Training)

### GET /training/sessions

모든 훈련 세션 조회

### GET /training/sessions/:id

특정 훈련 세션 조회

### POST /training/sessions

훈련 세션 생성

### PUT /training/sessions/:id

훈련 세션 수정

### DELETE /training/sessions/:id

훈련 세션 삭제

## 📊 훈련 결과 (Training Results)

### GET /training-results/user/:userId

사용자별 훈련 결과 조회

### GET /training-results/session/:sessionId

세션별 훈련 결과 조회

### GET /training-results/statistics/:userId

사용자 훈련 통계 조회

**Response:**

```json
{
  "totalTrainings": 10,
  "totalScore": 8500,
  "averageScore": 850.0,
  "bestScore": 950
}
```

### POST /training-results

훈련 결과 생성

### GET /training-results/choice-logs/:resultId

사용자 선택 로그 조회

### POST /training-results/choice-logs

사용자 선택 로그 생성

## 🎮 사용자 진행상황 (User Progress)

### GET /user-progress/:userId

사용자 진행상황 조회

### POST /user-progress/:userId/experience

경험치 추가

**Request Body:**

```json
{
  "expGained": 100,
  "reason": "시나리오 완료",
  "scenarioId": 1
}
```

### GET /user-progress/:userId/achievements

사용자 성취 목록 조회

### GET /user-progress/:userId/scenario-stats

사용자 시나리오별 통계 조회

### GET /user-progress/:userId/level-history

레벨업 히스토리 조회

## 🆘 지원 (Support)

### POST /support/inquiries

문의사항 생성

**Request Body:**

```json
{
  "teamId": 1,
  "userId": 1,
  "category": "TECHNICAL",
  "title": "로그인 문제",
  "content": "로그인이 안됩니다."
}
```

### GET /support/inquiries/user/:userId

사용자별 문의사항 조회

### GET /support/inquiries/team/:teamId

팀별 문의사항 조회

### PUT /support/inquiries/:inquiryId/status

문의사항 상태 업데이트

### GET /support/faqs/team/:teamId

팀별 FAQ 조회

### POST /support/faqs

FAQ 생성

## 🔧 코드 관리 (Codes)

### GET /codes/system

시스템 공통 코드 조회

### GET /codes/team/:teamId

팀별 코드 조회

### GET /codes/disaster-types

재난 유형 코드 조회

### GET /codes/risk-levels

위험도 코드 조회

### GET /codes/event-types

이벤트 유형 코드 조회

### GET /codes/inquiry-categories

문의 카테고리 코드 조회

### GET /codes/faq-categories

FAQ 카테고리 코드 조회

## 👨‍💼 관리자 (Admin)

### GET /admin/users

관리자용 사용자 목록 조회

### GET /admin/teams

관리자용 팀 목록 조회

### GET /admin/scenarios

관리자용 시나리오 목록 조회

### GET /admin/statistics

관리자용 통계 조회

## 🔧 공통 (Common)

### GET /common/health

서비스 상태 확인

**Response:**

```json
{
  "status": "ok",
  "service": "common",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /common/utils/generate-code

코드 생성 테스트

## 📝 데이터 모델

### User (사용자)

```typescript
{
  id: number;
  teamId: number;
  userCode: string;
  loginId: string;
  name: string;
  email: string;
  useYn: string;
  userLevel: number;
  userExp: number;
  totalScore: number;
  completedScenarios: number;
  currentTier: string;
  levelProgress: number;
  nextLevelExp: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Scenario (시나리오)

```typescript
{
  id: number;
  teamId: number;
  scenarioCode: string;
  title: string;
  disasterType: string;
  description: string;
  riskLevel: string;
  occurrenceCondition?: string;
  status: string;
  approvalComment?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdBy: number;
  approvedAt?: Date;
  approvedBy?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### TrainingResult (훈련 결과)

```typescript
{
  id: number;
  participantId: number;
  sessionId: number;
  scenarioId: number;
  userId: number;
  resultCode: string;
  accuracyScore: number;
  speedScore: number;
  totalScore: number;
  completionTime?: number;
  feedback?: string;
  completedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🚨 에러 응답

### 일반적인 에러 코드

- `400` - 잘못된 요청
- `401` - 인증 실패
- `403` - 권한 없음
- `404` - 리소스 없음
- `500` - 서버 오류

### 에러 응답 형식

```json
{
  "success": false,
  "error": "에러 메시지",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users"
}
```

## 🔄 상태 코드

### 시나리오 상태

- `임시저장` - 임시 저장된 시나리오
- `승인대기` - 승인 대기 중인 시나리오
- `활성화` - 승인되어 활성화된 시나리오
- `비활성화` - 비활성화된 시나리오

### 훈련 세션 상태

- `준비중` - 훈련 세션 준비 중
- `진행중` - 훈련 세션 진행 중
- `완료` - 훈련 세션 완료
- `취소` - 훈련 세션 취소

### 문의사항 상태

- `접수` - 문의사항 접수
- `처리중` - 문의사항 처리 중
- `완료` - 문의사항 처리 완료

## 📊 레벨 시스템

### 사용자 등급

- `초급자` - 레벨 1-10
- `중급자` - 레벨 11-25
- `고급자` - 레벨 26-50
- `전문가` - 레벨 51-75
- `마스터` - 레벨 76+

### 경험치 계산

- 기본 시나리오 완료: 100 EXP
- 고난이도 시나리오 완료: 150 EXP
- 연속 완료 보너스: +10% (최대 5회)

## 🔐 권한 시스템

### 권한 레벨

- `TEAM_ADMIN` - 팀 관리자 (모든 권한)
- `TEAM_OPERATOR` - 팀 운영자 (사용자/시나리오 관리)
- `GENERAL_USER` - 일반 사용자 (기본 권한)

### 권한별 접근 가능 기능

- **팀 관리**: 팀 정보 수정, 사용자 관리
- **사용자 관리**: 사용자 생성/수정/삭제
- **시나리오 관리**: 시나리오 생성/수정
- **시나리오 승인**: 시나리오 승인/거부
- **결과 조회**: 훈련 결과 조회

이 API 문서를 참고하여 Frontend와 Backend를 연동할 수 있습니다.
