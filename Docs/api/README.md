# Phoenix API 문서

## 📚 API 개요

Phoenix 재난 대응 훈련 시스템의 RESTful API 문서입니다.

## 🔗 API 엔드포인트

### 기본 정보

- **Base URL**: `http://localhost:3000` (개발환경)
- **API Prefix**: `/api`
- **Swagger 문서**: `http://localhost:3000/api`

### 인증 (Authentication)

- **JWT 토큰 기반 인증**
- **Bearer Token** 방식 사용

### 주요 API 모듈

#### 1. 사용자 관리 (Users)

- `GET /users` - 사용자 목록 조회
- `GET /users/:id` - 특정 사용자 조회
- `POST /users` - 사용자 생성
- `PUT /users/:id` - 사용자 정보 수정
- `DELETE /users/:id` - 사용자 삭제

#### 2. 인증 (Auth)

- `POST /auth/login` - 로그인
- `POST /auth/register` - 회원가입
- `POST /auth/refresh` - 토큰 갱신
- `POST /auth/logout` - 로그아웃

#### 3. 팀 관리 (Teams)

- `GET /teams` - 팀 목록 조회
- `GET /teams/:id` - 특정 팀 조회
- `POST /teams` - 팀 생성
- `PUT /teams/:id` - 팀 정보 수정

#### 4. 시나리오 관리 (Scenarios)

- `GET /scenarios` - 시나리오 목록 조회
- `GET /scenarios/:id` - 특정 시나리오 조회
- `POST /scenarios` - 시나리오 생성
- `PUT /scenarios/:id` - 시나리오 수정
- `DELETE /scenarios/:id` - 시나리오 삭제

#### 5. 훈련 관리 (Training)

- `GET /training/sessions` - 훈련 세션 목록
- `POST /training/sessions` - 훈련 세션 생성
- `GET /training/sessions/:id` - 특정 세션 조회
- `POST /training/sessions/:id/start` - 훈련 시작
- `POST /training/sessions/:id/complete` - 훈련 완료

#### 6. 훈련 결과 (Training Results)

- `GET /training-results/user/:userId` - 사용자별 결과
- `GET /training-results/session/:sessionId` - 세션별 결과
- `GET /training-results/statistics/:userId` - 사용자 통계

#### 7. 사용자 진행상황 (User Progress)

- `GET /user-progress/:userId` - 사용자 진행상황
- `POST /user-progress/:userId/experience` - 경험치 추가
- `GET /user-progress/:userId/achievements` - 성취 목록
- `GET /user-progress/:userId/scenario-stats` - 시나리오별 통계

#### 8. 지원 (Support)

- `POST /support/inquiries` - 문의사항 생성
- `GET /support/inquiries/user/:userId` - 사용자별 문의
- `GET /support/faqs/team/:teamId` - 팀별 FAQ

#### 9. 코드 관리 (Codes)

- `GET /codes/system` - 시스템 공통 코드
- `GET /codes/team/:teamId` - 팀별 코드
- `GET /codes/disaster-types` - 재난 유형 코드
- `GET /codes/risk-levels` - 위험도 코드

## 🔐 인증 방식

### JWT 토큰 사용

```bash
# 로그인 요청
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# 응답
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

### API 요청 시 토큰 포함

```bash
# 인증이 필요한 API 요청
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "message": "요청이 성공적으로 처리되었습니다."
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 올바르지 않습니다.",
    "details": { ... }
  }
}
```

## 🚀 API 테스트

### Swagger UI 사용

1. 개발 서버 실행: `npm run start:dev`
2. 브라우저에서 `http://localhost:3000/api` 접속
3. Swagger UI에서 API 테스트 가능

### Postman Collection

- Postman Collection 파일: `Docs/api/phoenix-api.postman_collection.json`
- 환경 변수 파일: `Docs/api/phoenix-dev.postman_environment.json`

## 📝 API 버전 관리

- 현재 버전: v1
- 버전 변경 시 URL에 버전 포함: `/api/v2/...`

## 🔧 개발자 가이드

### 새로운 API 추가 시

1. Controller에서 엔드포인트 정의
2. Service에서 비즈니스 로직 구현
3. DTO로 요청/응답 타입 정의
4. Swagger 데코레이터 추가
5. API 문서 업데이트

### 에러 처리

- HTTP 상태 코드 사용
- 일관된 에러 응답 형식
- 적절한 에러 메시지 제공
