# 🚀 Phoenix - 재난 대응 훈련 시스템

**Phoenix**는 재난 상황에 대한 체계적인 훈련을 제공하는 웹 기반 시뮬레이션 플랫폼입니다. 게임화 요소를 통해 사용자들이 재난 대응 능력을 단계적으로 향상시킬 수 있도록 설계되었습니다.

## ✨ 주요 기능

### 🎮 게임화 시스템

- **레벨 시스템**: 1-100단계 사용자 레벨
- **경험치 시스템**: 시나리오 완료 시 경험치 획득
- **성취 시스템**: 다양한 성취 목표 및 배지
- **통계 추적**: 시나리오별 상세 통계 및 진행도

### 🏢 팀 관리

- **다중 팀 지원**: 조직별 독립적인 훈련 환경
- **팀 코드 시스템**: 회원가입 후 팀 코드로 가입
- **권한 관리**: 팀관리자, 팀운영자, 일반사용자 권한
- **데이터 격리**: 팀별 완전한 데이터 분리

### 🔐 고급 인증 시스템

- **다중 인증 방식**: 이메일/비밀번호, Google OAuth
- **이중 토큰 시스템**: Access Token (15분) + Refresh Token (7일)
- **자동 토큰 갱신**: 사용자 경험 유지하면서 보안 강화
- **JWT 보안 강화**: alg:none 공격 방어, 토큰 타입 검증
- **자동 사용자 코드 생성**: 시스템에서 자동 생성 및 관리
- **팀 코드 기반 가입**: 회원가입 후 팀 코드로 팀 가입

### 📚 시나리오 시스템

- **4가지 재난 유형**: 🔥 화재, 🌍 지진, 🚑 응급처치, 🚗 교통사고
- **의사결정 이벤트**: 선택형 및 순차형 이벤트
- **실시간 피드백**: 즉시 결과 확인 및 학습
- **아이콘 시스템**: React Icons 기반 통합 아이콘 관리
- **유연한 데이터 소스**: 정적 파일과 데이터베이스 API 모두 지원
- **환경별 설정**: 개발/테스트/운영 환경에 맞는 데이터 소스 선택

### 📊 분석 및 리포팅

- **훈련 결과 분석**: 상세한 성과 리포트
- **진행도 추적**: 개인 및 팀별 진행 상황
- **통계 대시보드**: 시각화된 데이터 분석

### 📧 고객지원 시스템

- **문의하기 기능**: AWS SES를 통한 이메일 문의 시스템
- **Gmail 관리자 패널**: 관리자가 Gmail에서 직접 문의 확인 및 답장
- **이메일 템플릿**: 아름다운 HTML 형식으로 문의 및 답장 처리
- **FAQ 시스템**: 자주 묻는 질문과 답변
- **실시간 응답**: 빠른 고객 지원 서비스

### 🔧 시스템 관리

- **PM2 프로세스 관리**: 무중단 서비스 및 자동 재시작
- **Nginx 리버스 프록시**: SSL/TLS 보안 및 성능 최적화
- **환경별 설정**: 개발/테스트/운영 환경 분리
- **자동 초기화**: 첫 배포 시 관리자 계정 및 기본 데이터 자동 생성
- **보안 강화**: XSS, CSRF 등 웹 보안 취약점 방지
- **Rate Limiting**: API 남용 방지를 위한 요청 제한 기능

## 🏗️ 기술 스택

### Frontend

- **React 19** + **TypeScript**
- **Vite** (빌드 도구)
- **TailwindCSS** (스타일링)
- **React Icons** (아이콘 시스템)
- **Zustand** (상태 관리)
- **React Hook Form** (폼 관리)
- **React Router** (라우팅)

### Backend

- **NestJS** + **TypeScript** (Clean Architecture)
- **TypeORM** (ORM)
- **MySQL** (데이터베이스)
- **Redis** (캐시 및 토큰 관리)
- **JWT** (이중 토큰 시스템)
- **Passport** (OAuth 인증)
- **AWS SES** (이메일 서비스)
- **Gmail API** (관리자 이메일 관리)
- **Swagger** (API 문서)
- **Class Validator** (유효성 검사)

### DevOps

- **PM2** (프로세스 관리)
- **Nginx** (리버스 프록시)
- **AWS EC2** (클라우드 배포)
- **AWS SES** (이메일 서비스)
- **AWS RDS** (관계형 데이터베이스)
- **AWS ElastiCache** (Redis 캐시)
- **Docker** (컨테이너화)
- **GitHub Actions** (CI/CD)

## 🏛️ Clean Architecture

Phoenix Backend는 Clean Architecture 원칙을 따라 설계되었습니다:

### 계층 구조

1. **Domain Layer** (도메인 계층)

   - 핵심 비즈니스 로직과 규칙
   - 엔티티, 값 객체, 도메인 서비스
   - 외부 의존성 없음

2. **Application Layer** (애플리케이션 계층)

   - 유스케이스 구현
   - 애플리케이션 서비스
   - 도메인 계층에만 의존

3. **Infrastructure Layer** (인프라 계층)

   - 데이터베이스, 외부 API 연동
   - 도메인 인터페이스 구현
   - 기술적 세부사항 처리

4. **Presentation Layer** (프레젠테이션 계층)
   - REST API 컨트롤러
   - DTO 및 요청/응답 처리
   - 사용자 인터페이스

### 장점

- **테스트 용이성**: 각 계층을 독립적으로 테스트 가능
- **유지보수성**: 비즈니스 로직과 기술적 세부사항 분리
- **확장성**: 새로운 기능 추가 시 기존 코드 영향 최소화
- **의존성 역전**: 고수준 모듈이 저수준 모듈에 의존하지 않음

## 📁 프로젝트 구조

```
Phoenix/
├── 📁 Frontend/                    # React 애플리케이션
│   ├── 📁 src/
│   │   ├── 📁 components/          # 재사용 가능한 컴포넌트
│   │   │   ├── 📁 admin/           # 관리자 전용 컴포넌트
│   │   │   │   └── ScenarioGeneratorPanel.tsx  # 시나리오 생성기 패널
│   │   │   ├── 📁 common/          # 공통 컴포넌트
│   │   │   ├── 📁 game/            # 게임 관련 컴포넌트
│   │   │   │   ├── 📁 Partials/    # 시나리오 편집기 컴포넌트
│   │   │   │   └── ScriptView.tsx  # 시나리오 뷰어
│   │   │   ├── 📁 layout/          # 레이아웃 컴포넌트
│   │   │   └── 📁 ui/              # UI 컴포넌트
│   │   ├── 📁 pages/               # 페이지 컴포넌트
│   │   │   ├── 📁 admin/           # 관리자 기능
│   │   │   │   └── ScriptToolPage.tsx  # 시나리오 관리 도구 페이지
│   │   │   ├── 📁 auth/            # 인증 관련
│   │   │   ├── 📁 training/        # 훈련 관련
│   │   │   └── 📁 user/            # 사용자 기능
│   │   ├── 📁 services/            # API 통신 서비스
│   │   │   └── scenarioGeneratorService.ts  # 시나리오 생성기 서비스
│   │   ├── 📁 stores/              # 상태 관리
│   │   ├── 📁 types/               # TypeScript 타입
│   │   │   └── scenario.ts         # 시나리오 관련 타입 정의
│   │   ├── 📁 utils/               # 유틸리티 함수
│   │   │   ├── 📁 scenario-generator/  # 시나리오 생성기 유틸리티
│   │   │   │   ├── config.ts       # 설정 파일
│   │   │   │   ├── converter.ts    # 데이터 변환기
│   │   │   │   ├── logger.ts       # 로깅 유틸리티
│   │   │   │   └── validator.ts    # 데이터 검증기
│   │   │   └── icons.tsx           # 🎨 통합 아이콘 시스템
│   │   └── 📁 hooks/               # 커스텀 훅
│   ├── 📁 scripts/                 # 빌드 및 배포 스크립트
│   │   ├── 📁 deploy/              # 배포 스크립트
│   │   └── 📁 setup/               # 개발 환경 설정
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── 📁 Backend/                     # NestJS 애플리케이션 (Clean Architecture)
│   ├── 📁 src/
│   │   ├── 📁 application/         # 애플리케이션 계층
│   │   │   ├── 📁 interfaces/      # 인터페이스 정의
│   │   │   ├── 📁 services/        # 애플리케이션 서비스
│   │   │   └── 📁 use-cases/       # 유스케이스 (비즈니스 로직)
│   │   ├── 📁 domain/              # 도메인 계층 (핵심 비즈니스 로직)
│   │   │   ├── 📁 entities/        # 도메인 엔티티
│   │   │   ├── 📁 repositories/    # 리포지토리 인터페이스
│   │   │   ├── 📁 services/        # 도메인 서비스
│   │   │   └── 📁 value-objects/   # 값 객체
│   │   ├── 📁 infrastructure/      # 인프라 계층
│   │   │   ├── 📁 config/          # 설정 관리
│   │   │   ├── 📁 database/        # 데이터베이스 구현
│   │   │   └── 📁 external/        # 외부 서비스 연동
│   │   ├── 📁 presentation/        # 프레젠테이션 계층
│   │   │   ├── 📁 controllers/     # REST API 컨트롤러
│   │   │   └── 📁 dto/             # 데이터 전송 객체
│   │   ├── 📁 shared/              # 공유 계층
│   │   │   ├── 📁 decorators/      # 커스텀 데코레이터
│   │   │   ├── 📁 filters/         # 예외 필터
│   │   │   ├── 📁 guards/          # 인증/인가 가드
│   │   │   ├── 📁 interceptors/    # 인터셉터
│   │   │   ├── 📁 pipes/           # 파이프
│   │   │   └── 📁 strategies/      # 인증 전략
│   │   ├── 📁 database/            # 데이터베이스 관련
│   │   │   ├── 📁 entities/        # TypeORM 엔티티
│   │   │   ├── 📁 migrations/      # 마이그레이션
│   │   │   └── 📁 seeds/           # 시드 데이터
│   │   ├── 📁 config/              # 환경 설정
│   │   ├── 📁 utils/               # 유틸리티
│   │   ├── app.module.ts           # 루트 모듈
│   │   ├── main.ts                 # 애플리케이션 진입점
│   │   └── ormconfig.ts            # TypeORM 설정
│   ├── package.json
│   └── ecosystem.config.js         # PM2 설정
│
├── 📁 Database/                    # SQL 스키마 및 백업 (운영용)
│   └── phoenix_complete_schema.sql # 완전한 MySQL 스키마
│
├── 📁 nginx/                       # Nginx 설정
│   └── nginx.conf                  # 리버스 프록시 설정
│
├── 📁 Docs/                        # 📚 포괄적 문서
│   ├── 📁 api/                     # ✅ API 문서 및 가이드
│   │   └── README.md               # API 사용법
│   ├── 📁 database/                # ✅ DB 설계 및 최적화
│   │   └── README.md               # 데이터베이스 가이드
│   └── 📁 deployment/              # ✅ 배포 가이드 및 AWS 최적화
│       └── README.md               # 배포 가이드
│
├── .gitignore                      # Git 무시 파일
├── env.example                     # 환경 변수 예시
├── README.md                       # 프로젝트 문서
└── package.json                    # 루트 패키지
```

## 🚀 빠른 시작

### 1. 환경 변수 설정

#### Backend 환경 변수 (.env 파일 생성)

```bash
# Backend/.env 파일 생성
cd Backend
cp ../env.example .env  # 또는 직접 생성
```

**필수 환경 변수:**

```env
# Database
DB_HOST=your_database_host
DB_PORT=3306
DB_USERNAME=your_database_username
DB_PASSWORD=your_secure_password_here
DB_DATABASE=phoenix

# JWT (이중 토큰 시스템)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=15m  # Access Token (15분)
REFRESH_TOKEN_EXPIRES_IN=7d  # Refresh Token (7일)

# OAuth 설정
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback

KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_CALLBACK_URL=https://your-domain.com/auth/kakao/callback

NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
NAVER_CALLBACK_URL=https://your-domain.com/auth/naver/callback

# OAuth 리다이렉션 설정
OAUTH_REDIRECT_BASE=https://your-domain.com
OAUTH_SUCCESS_REDIRECT=https://your-domain.com/auth/callback
OAUTH_FAILURE_REDIRECT=https://your-domain.com/login?error=oauth

# API URL
API_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Gmail API 설정
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_PROJECT_ID=your_project_id
GMAIL_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GMAIL_TOKEN_URI=https://oauth2.googleapis.com/token
GMAIL_REDIRECT_URIS=https://your-domain.com
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.send

# Server
PORT=3000
NODE_ENV=production
```

#### Frontend 환경 변수 (.env 파일 생성)

```bash
# Frontend/.env 파일 생성
cd Frontend
cp .env.example .env  # 또는 직접 생성
```

**필수 환경 변수:**

```env
# API URL
VITE_API_BASE_URL=https://api.your-domain.com

# Environment
VITE_SCENARIO_DATA_SOURCE=auto
```

### 2. 프로덕션 배포

#### 자동 배포 (권장)

```bash
# 저장소 클론
git clone <repository-url>
cd Phoenix

# 배포 스크립트 실행
chmod +x deploy-direct.sh
./deploy-direct.sh production
```

#### 수동 배포

```bash
# 1. Backend 빌드 및 실행
cd Backend
npm install --production
npm run build
pm2 start dist/main.js --name phoenix-backend --env production

# 2. Frontend 빌드 및 배포
cd ../Frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/

# 3. nginx 설정 및 재시작
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
```

### 3. 접속 확인

- **Frontend**: https://www.phoenix-4.com
- **Backend API**: https://api.phoenix-4.com
- **API 문서**: https://api.phoenix-4.com/api

## 🎯 시나리오 관리 도구

Phoenix 시스템에는 강력한 시나리오 생성 및 관리 도구가 통합되어 있습니다. 이 도구는 [game-script-tool](https://github.com/1000ship/game-script-tool)을 기반으로 개발되었으며, 재난 대응 훈련에 특화되도록 수정되었습니다.

### 🔧 통합된 시나리오 생성기

#### 원본 출처 및 라이선스

- **원본 프로젝트**: [1000ship/game-script-tool](https://github.com/1000ship/game-script-tool)
- **라이선스**: 원본 개발자로부터 사용 허가를 받아 수정하여 사용
- **수정 사항**: 재난 대응 훈련 시스템에 맞게 커스터마이징

#### 주요 기능

##### 1. 블록 기반 시나리오 편집기

- **직관적인 편집**: 드래그 앤 드롭으로 시나리오 블록 구성
- **실시간 미리보기**: 작성 중인 시나리오를 실시간으로 확인
- **다양한 재난 유형 지원**: 화재, 지진, 응급처치, 교통사고

##### 2. 데이터 관리 시스템

- **JSON 내보내기/가져오기**: 시나리오 데이터 백업 및 공유
- **SQL 변환**: 데이터베이스 직접 삽입을 위한 SQL 생성
- **데이터 검증**: 시나리오 데이터 유효성 자동 검사
- **통계 생성**: 시나리오별 상세 통계 및 분석

##### 3. 관리자 인터페이스

- **웹 기반 편집기**: 브라우저에서 직접 시나리오 편집
- **시각적 편집**: 블록 기반의 직관적인 시나리오 구성
- **선택지 관리**: 각 상황별 선택지 및 결과 설정
- **점수 시스템**: 속도와 정확도 기반 점수 설정

#### 접근 방법

1. **관리자 로그인**: 관리자 계정으로 시스템 로그인
2. **시나리오 도구 접근**: 관리자 페이지 → "시나리오 도구" 탭
3. **시나리오 생성**: 블록 기반으로 새로운 시나리오 작성
4. **데이터 관리**: JSON/SQL 형태로 데이터 내보내기/가져오기

### 📊 시나리오 데이터 구조

```typescript
interface ScenarioGeneratorEvent {
  id?: number;
  teamId?: number;
  scenarioCode?: string;
  sceneId: string;
  title: string;
  content: string;
  sceneScript: string;
  disasterType: "fire" | "earthquake" | "emergency" | "traffic" | "flood";
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  difficulty: "easy" | "medium" | "hard" | "expert";
  options: ChoiceOption[];
  status?: "ACTIVE" | "INACTIVE";
  approvalStatus?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string;
  createdBy?: number | string;
  order?: number;
}

// 선택 옵션 구조
interface ChoiceOption {
  answerId: string;
  answer: string;
  reaction: string;
  nextId: string;
  points: {
    speed: number;
    accuracy: number;
  };
}
```

### 🎮 구현된 시나리오 유형

- 🔥 **화재 재난 시나리오** (`fire`): 건물 화재, 산불, 화학물질 화재 등
- 🌍 **지진 재난 시나리오** (`earthquake`): 지진 발생, 건물 붕괴, 대피 상황 등
- 🚑 **응급처치 시나리오** (`emergency`): 심폐소생술, 출혈 응급처치, 화상 응급처치 등
- 🚗 **교통사고 시나리오** (`traffic`): 교통사고 초기 대응, 부상자 응급처치 등

### 🔄 데이터 변환 프로세스

```
게임 스크립트 형식 → JSON 데이터 → MySQL INSERT 문 → Phoenix 데이터베이스
```

1. **시나리오 작성**: 웹 기반 블록 편집기에서 시나리오 구성
2. **데이터 검증**: 자동 유효성 검사로 데이터 품질 보장
3. **형식 변환**: JSON 형태로 내보내기 또는 SQL로 직접 변환
4. **데이터베이스 적용**: 생성된 SQL을 데이터베이스에 적용

### 🛠️ 기술적 특징

- **TypeScript 기반**: 타입 안전성 보장
- **React 통합**: 기존 Phoenix Frontend와 완전 통합
- **React Icons**: FontAwesome 기반 아이콘 시스템
- **실시간 검증**: 작성 중 실시간 데이터 유효성 검사
- **모듈화 설계**: 재사용 가능한 컴포넌트 구조
- **확장성**: 새로운 재난 유형 쉽게 추가 가능
- **아이콘 통합**: 웹 페이지와 동일한 아이콘 시스템 사용

## 🔧 배포

### 자동 배포 (권장)

```bash
# AWS EC2 원클릭 배포
chmod +x Frontend/scripts/deploy/deploy.sh
./Frontend/scripts/deploy/deploy.sh
```

### 수동 배포

```bash
# 프로덕션 빌드
npm run build

# 수동 배포 단계는 Docs/deployment/README.md 참조
```

## 🆕 최근 업데이트

### v2.4.0 (2025.01.17) - JWT 보안 강화

- **이중 토큰 시스템**: Access Token (15분) + Refresh Token (7일) 구현
- **자동 토큰 갱신**: 사용자 경험 유지하면서 보안 강화
- **JWT 보안 강화**: alg:none 공격 방어, 토큰 타입 검증
- **Redis 토큰 관리**: Refresh Token을 Redis에 안전하게 저장
- **토큰 갱신 API**: `/auth/refresh` 엔드포인트 추가
- **보안 취약점 해결**: JWT 탈취 시 15분 후 자동 만료

### v2.3.0 (2025.01.17) - Gmail 관리자 패널

- **Gmail API 통합**: 관리자가 Gmail에서 직접 문의 확인 및 답장
- **OAuth 2.0 인증**: Gmail 계정 연동을 위한 안전한 인증
- **이메일 템플릿**: 아름다운 HTML 형식으로 문의 및 답장 처리
- **관리자 이메일 관리**: 웹 기반 이메일 관리 인터페이스
- **문의 추적**: 문의 이력 및 답장 상태 관리

### v2.2.0 (2025.01.17)

- **AWS SES 이메일 시스템**: 고객지원 문의하기 기능에 AWS SES 통합
- **PM2 프로세스 관리**: 프로덕션 환경에서 안정적인 애플리케이션 실행
- **Nginx 리버스 프록시**: SSL/TLS 보안 및 성능 최적화
- **환경별 설정 관리**: 개발/테스트/운영 환경 분리
- **자동 관리자 계정 생성**: 초기 배포 시 관리자 계정 자동 생성
- **OAuth 문제 해결**: OAuth 인증 관련 데이터베이스 제약조건 수정
- **보안 헤더 강화**: XSS, CSRF 등 웹 보안 취약점 방지
- **Rate Limiting**: API 남용 방지를 위한 요청 제한 기능

### v2.1.0 (2025.01.16)

- **시나리오 관리 도구 통합**: [game-script-tool](https://github.com/1000ship/game-script-tool) 기반 시나리오 생성기 완전 통합
- **블록 기반 시나리오 편집기**: 드래그 앤 드롭으로 직관적인 시나리오 작성
- **데이터 관리 시스템**: JSON/SQL 형태로 시나리오 데이터 내보내기/가져오기
- **실시간 데이터 검증**: 시나리오 작성 중 자동 유효성 검사
- **관리자 인터페이스 개선**: 웹 기반 시나리오 편집 도구 추가
- **아이콘 시스템 통합**: React Icons 기반 통합 아이콘 관리 시스템
- **시나리오 유형 확장**: 4가지 재난 유형 (화재, 지진, 응급처치, 교통사고)

### v2.0.0 (2025.01.16)

- **Clean Architecture 적용**: Backend 구조를 Clean Architecture로 전면 개편
- **OAuth 로그인 지원**: Google OAuth 로그인 기능 추가
- **팀 코드 시스템**: 회원가입 후 팀 코드로 팀 가입하는 방식으로 변경
- **자동 사용자 코드 생성**: 시스템에서 사용자 코드 자동 생성 및 관리
- **타입 안정성 향상**: TypeScript 타입 정의 개선 및 에러 수정
- **UI/UX 개선**: 회원가입 폼 단순화 및 마이페이지 팀 가입 기능 추가

### 주요 변경사항

#### v2.4.0 - JWT 보안 강화

- **이중 토큰 시스템**: Access Token (15분) + Refresh Token (7일)
- **자동 토큰 갱신**: 사용자 경험 유지하면서 보안 강화
- **JWT 보안 강화**: alg:none 공격 방어, 토큰 타입 검증
- **Redis 토큰 관리**: Refresh Token을 Redis에 안전하게 저장
- **토큰 갱신 API**: `/auth/refresh` 엔드포인트 추가

#### v2.3.0 - Gmail 관리자 패널

- **Gmail API 통합**: 관리자가 Gmail에서 직접 문의 확인 및 답장
- **OAuth 2.0 인증**: Gmail 계정 연동을 위한 안전한 인증
- **이메일 템플릿**: 아름다운 HTML 형식으로 문의 및 답장 처리
- **관리자 이메일 관리**: 웹 기반 이메일 관리 인터페이스

#### v2.2.0 - AWS SES 이메일 시스템

- **AWS SES 이메일 통합**: 고객지원 문의 시 자동 이메일 전송
- **PM2 기반 프로세스 관리**: 무중단 서비스 및 자동 재시작
- **Nginx 보안 설정**: SSL/TLS 암호화 및 보안 헤더 적용
- **환경 변수 관리**: `.env` 파일을 통한 설정 중앙화
- **자동 초기화**: 첫 배포 시 관리자 계정 및 기본 데이터 자동 생성

#### v2.1.0 - 시나리오 관리 도구

- **시나리오 관리 도구**: 관리자 페이지에서 시나리오 생성/편집 가능
- **원본 출처 명시**: game-script-tool 기반으로 개발되었음을 명시
- **재난 유형 확장**: 4가지 재난 유형 (화재, 지진, 응급처치, 교통사고) 지원
- **아이콘 시스템 통합**: React Icons 기반 통합 아이콘 관리 시스템
- **데이터 변환 기능**: 게임 스크립트 → JSON → SQL 변환 프로세스

#### v2.0.0 - Clean Architecture

- **Clean Architecture 적용**: Backend 구조를 Clean Architecture로 전면 개편
- **OAuth 로그인 지원**: Google OAuth 로그인 기능 추가
- **팀 코드 시스템**: 회원가입 후 팀 코드로 팀 가입하는 방식으로 변경
- **자동 사용자 코드 생성**: 시스템에서 사용자 코드 자동 생성 및 관리
- **타입 안정성 향상**: TypeScript 타입 정의 개선 및 에러 수정
- **UI/UX 개선**: 회원가입 폼 단순화 및 마이페이지 팀 가입 기능 추가

## 📊 시나리오 데이터 소스 설정

Phoenix는 시나리오 데이터를 두 가지 방식으로 로드할 수 있습니다:

### 🔧 데이터 소스 옵션

1. **📁 정적 파일만** (`static`)

   - `public/data` 폴더의 JSON 파일 사용
   - 개발/테스트 환경에 적합
   - 서버 없이도 작동

2. **🌐 API만** (`api`)

   - AWS Aurora/RDS 데이터베이스에서 조회
   - 운영 환경에 적합
   - 관리자가 생성한 시나리오 사용

3. **🔄 자동 전환** (`auto`) - **기본값**
   - 정적 파일 우선 로드
   - 실패 시 API로 자동 전환
   - 개발과 운영 환경 모두 지원

### 🔧 설정 방법

#### 1. 관리자 페이지에서 설정

- 관리자 페이지 → 시나리오 관리 → 데이터 소스 설정
- 버튼 클릭으로 즉시 전환 가능

#### 2. 환경 변수로 설정

```bash
# Frontend/.env 파일
VITE_SCENARIO_DATA_SOURCE=auto  # static, api, auto 중 선택
```

#### 3. 개발자 도구에서 설정

```javascript
// 브라우저 콘솔에서 실행
ScenarioDataSource.setSource("api"); // API로 전환
ScenarioDataSource.getStatus(); // 현재 상태 확인
```

### 📁 정적 파일 구조

```
Frontend/public/data/
├── fire_training_scenario.json          # 🔥 화재 대응 시나리오
├── earthquake_training_scenario.json    # 🌍 지진 대응 시나리오
├── emergency_first_aid_scenario.json   # 🚑 응급처치 시나리오
└── traffic_accident_scenario.json      # 🚗 교통사고 시나리오
```

### 🎨 아이콘 시스템

Phoenix는 React Icons 기반의 통합 아이콘 시스템을 사용합니다:

#### 재난 유형별 아이콘

```typescript
// 재난 유형별 아이콘 매핑
export const disasterIcons = {
  fire: <FaFire className="text-red-500" />, // 🔥 화재
  earthquake: <FaGlobeAmericas className="text-yellow-500" />, // 🌍 지진
  emergency: <FaAmbulance className="text-green-500" />, // 🚑 응급처치
  traffic: <FaCar className="text-blue-500" />, // 🚗 교통사고
  complex: <FaExclamationTriangle className="text-orange-500" />, // ⚠️ 복합재난
};
```

#### 사용법

```tsx
// 아이콘 컴포넌트 사용
<Icon type="fire" category="disaster" />
<Icon type="earthquake" category="disaster" />
<Icon type="emergency" category="disaster" />
<Icon type="traffic" category="disaster" />
<Icon type="flood" category="disaster" />
```

### 🔄 데이터 동기화

- 관리자가 시나리오를 생성하고 내보내기하면 JSON 파일로 다운로드
- 이 파일을 `public/data` 폴더에 저장하면 정적 파일 방식으로 사용 가능
- 또는 "기존 JSON 동기화" 버튼으로 데이터베이스에 자동 동기화

## 🔐 JWT 보안 시스템

### 이중 토큰 시스템

Phoenix는 최신 보안 표준에 따라 이중 토큰 시스템을 구현했습니다:

#### Access Token (15분)

- **용도**: API 요청 인증
- **특징**: 짧은 유효기간으로 보안 강화
- **자동 갱신**: 만료 시 Refresh Token으로 자동 갱신

#### Refresh Token (7일)

- **용도**: Access Token 갱신
- **저장**: Redis에 안전하게 저장
- **보안**: 서버에서 관리되어 탈취 위험 최소화

### 보안 강화 기능

#### 1. alg:none 공격 방어

```typescript
// 허용된 알고리즘만 사용
algorithms: ["HS256", "HS384", "HS512"];
```

#### 2. 토큰 타입 검증

```typescript
// Access Token만 허용
if (payload.type !== "access") {
  return null;
}
```

#### 3. 자동 토큰 갱신

```typescript
// 토큰 갱신 API
POST /auth/refresh
{
  "refresh_token": "eyJ..."
}
```

### API 엔드포인트

#### 로그인

```bash
POST /auth/login
# 응답
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 900
}
```

#### 토큰 갱신

```bash
POST /auth/refresh
{
  "refresh_token": "eyJ..."
}
# 응답
{
  "access_token": "eyJ...",
  "expires_in": 900
}
```

## 📧 Gmail 관리자 패널

### Gmail API 통합

관리자가 Gmail에서 직접 문의를 확인하고 답장할 수 있는 시스템입니다:

#### 주요 기능

- **Gmail 연동**: OAuth 2.0을 통한 안전한 Gmail 계정 연동
- **문의 확인**: Gmail에서 문의 이메일 확인
- **답장 전송**: 아름다운 HTML 형식으로 답장 전송
- **문의 추적**: 문의 이력 및 답장 상태 관리

#### 설정 방법

1. **Gmail OAuth 설정**

```env
# Backend/.env 파일
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_PROJECT_ID=your_project_id
GMAIL_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GMAIL_TOKEN_URI=https://oauth2.googleapis.com/token
GMAIL_REDIRECT_URIS=https://www.phoenix-4.com
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.send
```

2. **관리자 페이지 접근**

- 관리자 계정으로 로그인
- "이메일 관리" 탭 선택
- Gmail 계정 연동

#### 이메일 템플릿

문의 및 답장은 아름다운 HTML 형식으로 처리됩니다:

```html
<!-- 문의 이메일 -->
<div class="inquiry-email">
  <h2>새로운 문의가 접수되었습니다</h2>
  <p><strong>이름:</strong> {name}</p>
  <p><strong>이메일:</strong> {email}</p>
  <p><strong>문의 내용:</strong> {message}</p>
</div>

<!-- 답장 이메일 -->
<div class="reply-email">
  <h2>문의에 대한 답변</h2>
  <p>안녕하세요 {name}님,</p>
  <p>{reply_content}</p>
  <p>감사합니다.</p>
</div>
```

## 📧 AWS SES 설정

### 1. AWS SES 서비스 설정

1. **AWS 콘솔에서 SES 서비스 접속**

   - AWS 콘솔 로그인 → 검색창에 "SES" 입력
   - "Simple Email Service" 선택
   - **중요**: 우측 상단에서 리전을 `ap-northeast-2` (서울)로 변경

2. **이메일 주소 검증 (Identities)**

   - 좌측 메뉴에서 "Identities" 클릭
   - "Create identity" 버튼 클릭
   - "Email address" 선택 후 `phoenix4team@gmail.com` 입력
   - "Create identity" 클릭
   - 해당 이메일로 전송된 확인 메일에서 링크 클릭하여 검증 완료

3. **샌드박스 모드 확인 및 해제**
   - 좌측 메뉴에서 "Account dashboard" 클릭
   - "Sending statistics" 섹션에서 "Request production access" 버튼 확인
   - 클릭 후 사용 사례 설명 작성하여 승인 요청

### 2. IAM 사용자 생성

1. **IAM 콘솔에서 새 사용자 생성**

   - AWS 콘솔 → IAM 서비스
   - 좌측 메뉴에서 "Users" 클릭
   - "Create user" 버튼 클릭
   - 사용자명: `phoenix-ses-user`
   - "Provide user access to the AWS Management Console" 체크 해제
   - "Next" 클릭

2. **권한 정책 연결**

   - "Attach policies directly" 선택
   - 검색창에 "SES" 입력
   - "AmazonSESFullAccess" 정책 선택 (또는 아래 커스텀 정책 사용)
   - "Next" → "Create user" 클릭

   **또는 커스텀 정책 사용:**

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["ses:SendEmail", "ses:SendRawEmail"],
         "Resource": "*"
       }
     ]
   }
   ```

3. **액세스 키 생성 및 저장**
   - 생성된 사용자 클릭 → "Security credentials" 탭
   - "Access keys" 섹션에서 "Create access key" 클릭
   - "Application running outside AWS" 선택
   - "Next" → "Create access key"
   - **Access Key ID** (AKIA... 형태)와 **Secret Access Key** 복사
   - ⚠️ **중요**: Secret Access Key는 한 번만 표시되므로 반드시 복사해서 저장하세요!

### 3. 환경변수 설정

**Backend/.env 파일에 다음 변수들을 추가하세요:**

```env
# AWS SES Configuration
AWS_ACCESS_KEY_ID=your_actual_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key_here
AWS_REGION=ap-northeast-2
AWS_SES_FROM_EMAIL=phoenix4team@gmail.com
AWS_SES_TO_EMAIL=phoenix4team@gmail.com
```

**중요사항:**

- `your_actual_access_key_id_here`를 실제 Access Key ID (AKIA... 형태)로 교체
- `your_actual_secret_access_key_here`를 실제 Secret Access Key로 교체
- `AWS_SES_FROM_EMAIL`: AWS SES에서 검증된 발신자 이메일 (고정)
- `AWS_SES_TO_EMAIL`: 문의를 받을 관리자 이메일 (고정)
- 사용자가 입력한 이메일 주소는 이메일 내용에 포함되어 답장용으로 사용

**예시:**

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### 4. 테스트

1. **환경변수 설정 확인**

   ```bash
   # Backend/.env 파일에 AWS SES 설정이 올바르게 되어 있는지 확인
   AWS_ACCESS_KEY_ID=your_actual_access_key_id
   AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key
   AWS_REGION=ap-northeast-2
   AWS_SES_FROM_EMAIL=phoenix4team@gmail.com
   AWS_SES_TO_EMAIL=phoenix4team@gmail.com
   ```

2. **백엔드 서버 시작**

   ```bash
   cd Backend
   npm run start:dev
   ```

3. **프론트엔드에서 문의하기 테스트**

   - 브라우저에서 `/support` 페이지 접속
   - 문의하기 탭 선택
   - 문의 양식 작성 후 전송

4. **이메일 확인**
   - `phoenix4team@gmail.com`으로 문의 내용이 전송되는지 확인
   - AWS SES 콘솔의 "Sending statistics"에서 전송 통계 확인

### 5. 문제 해결

**이메일이 전송되지 않는 경우:**

- AWS SES 콘솔에서 이메일 주소가 "Verified" 상태인지 확인
- IAM 사용자 권한이 올바른지 확인
- 환경변수가 정확한지 확인
- AWS 리전이 `ap-northeast-2`로 설정되어 있는지 확인

**샌드박스 모드인 경우:**

- 검증된 이메일 주소로만 전송 가능
- 프로덕션 액세스 요청이 승인될 때까지 대기

## 📚 문서

- **[API 문서](Docs/api/README.md)**: API 엔드포인트 및 사용법
- **[데이터베이스 설계](Docs/database/README.md)**: DB 구조 및 최적화
- **[배포 가이드](Docs/deployment/README.md)**: AWS 배포 및 운영

## 🛠️ 개발 도구

### 필수 요구사항

- **Node.js**: 18.x LTS 이상
- **MySQL**: 8.0 이상
- **Git**: 최신 버전

### 권장 도구

- **VS Code**: 코드 에디터
- **MySQL Workbench**: 데이터베이스 관리
- **Postman**: API 테스트

## 📊 모니터링

### 개발 환경

- **PM2 모니터링**: `pm2 monit`
- **로그 확인**: `pm2 logs phoenix-backend`
- **상태 확인**: `pm2 status`

### 운영 환경

- **Nginx 로그**: `/var/log/nginx/`
- **애플리케이션 로그**: PM2 로그 파일
- **시스템 리소스**: `htop`, `df -h`

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

- **이슈 리포트**: GitHub Issues
- **문서**: `Docs/` 폴더 참조
- **API 문서**: http://localhost:3000/api (개발 서버 실행 시)

---

**Phoenix** - 재난 대응 훈련의 새로운 표준 🚀
