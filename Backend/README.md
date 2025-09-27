# Phoenix Training Platform Backend
테스트4
Phoenix 훈련 플랫폼의 백엔드 API 서버입니다.

## 기술 스택

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL (AWS RDS)
- **Cache**: Redis (AWS ElastiCache)
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Email**: AWS SES
- **Documentation**: Swagger
- **Validation**: class-validator

## 프로젝트 구조

```
src/
├── modules/           # 기능별 모듈
│   ├── auth/         # 인증/인가
│   ├── users/        # 사용자 관리
│   ├── teams/        # 팀 관리
│   ├── scenarios/    # 시나리오 관리
│   ├── training/     # 훈련 세션 관리
│   └── admin/        # 관리자 기능
├── shared/           # 공통 모듈
│   ├── decorators/   # 커스텀 데코레이터
│   ├── filters/      # 예외 필터
│   ├── guards/       # 가드
│   ├── interceptors/ # 인터셉터
│   └── pipes/        # 파이프
├── config/           # 설정 파일
├── database/         # 데이터베이스 관련
│   ├── entities/     # 엔티티
│   ├── migrations/   # 마이그레이션
│   └── seeds/        # 시드 데이터
└── utils/            # 유틸리티 함수
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

#### 개발 환경

```bash
npm run setup:dev
```

#### 운영 환경

```bash
npm run setup:prod
```

또는 수동으로 `.env.development` 또는 `.env.production` 파일을 `.env`로 복사하세요.

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=phoenix

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 3. Redis 설정

#### 개발 환경

- **로컬 Redis**: `localhost:6379`
- **설정**: `.env.development` 파일 사용

#### 운영 환경

- **AWS ElastiCache**: `phoenix-redis-cluster.c9kciawyijr0.cache.amazonaws.com:6379`
- **설정**: `.env.production` 파일 사용

### 4. 데이터베이스 설정

MySQL 데이터베이스를 생성하고 연결 정보를 `.env` 파일에 설정하세요.

### 5. 개발 서버 실행

```bash
# 개발 모드 (핫 리로드)
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

## 환경별 설정

### 개발 환경

- **Redis**: 로컬 Docker 또는 로컬 Redis
- **Database**: 로컬 MySQL
- **OAuth**: 개발용 클라이언트 ID
- **Email**: 개발용 AWS SES 설정

### 운영 환경

- **Redis**: AWS ElastiCache
- **Database**: AWS RDS
- **OAuth**: 운영용 클라이언트 ID
- **Email**: 운영용 AWS SES 설정

## API 문서

서버 실행 후 다음 URL에서 Swagger API 문서를 확인할 수 있습니다:

- **개발 환경**: http://localhost:3000/api
- **운영 환경**: https://api.phoenix-4.com/api

## 주요 기능

### 인증 (Auth)

- 사용자 회원가입/로그인
- JWT 토큰 기반 인증
- 비밀번호 암호화

### 사용자 관리 (Users)

- 사용자 CRUD 작업
- 프로필 관리
- 역할 기반 접근 제어

### 팀 관리 (Teams)

- 팀 생성 및 관리
- 팀원 관리
- 팀 상태 관리

### 시나리오 관리 (Scenarios)

- 훈련 시나리오 생성/수정
- 시나리오 타입별 분류
- 난이도 설정

### 훈련 세션 (Training)

- 훈련 세션 스케줄링
- 훈련 진행 상태 관리
- 훈련 결과 저장

### 관리자 (Admin)

- 시스템 통계 조회
- 대시보드 데이터
- 전체 시스템 관리

## 개발 명령어

```bash
# 개발 서버 실행
npm run start:dev

# 빌드
npm run build

# 프로덕션 실행
npm run start:prod

# 테스트
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e

# 린팅
npm run lint

# 포맷팅
npm run format
```

## 데이터베이스 마이그레이션

```bash
# 마이그레이션 생성
npm run migration:generate -- -n MigrationName

# 마이그레이션 실행
npm run migration:run

# 마이그레이션 되돌리기
npm run migration:revert
```

## 배포

1. 프로덕션 환경 변수 설정
2. 데이터베이스 마이그레이션 실행
3. 빌드 및 배포

```bash
npm run build
npm run start:prod
```

## 라이선스

이 프로젝트는 비공개 라이선스입니다.
