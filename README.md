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

### 🔐 인증 시스템

- **다중 인증 방식**: 이메일/비밀번호, Google OAuth
- **자동 사용자 코드 생성**: 시스템에서 자동 생성 및 관리
- **팀 코드 기반 가입**: 회원가입 후 팀 코드로 팀 가입
- **JWT 토큰 기반 인증**: 안전한 세션 관리

### 📚 시나리오 시스템

- **다양한 재난 유형**: 화재, 지진, 응급처치, 교통사고
- **의사결정 이벤트**: 선택형 및 순차형 이벤트
- **실시간 피드백**: 즉시 결과 확인 및 학습

### 📊 분석 및 리포팅

- **훈련 결과 분석**: 상세한 성과 리포트
- **진행도 추적**: 개인 및 팀별 진행 상황
- **통계 대시보드**: 시각화된 데이터 분석

## 🏗️ 기술 스택

### Frontend

- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **TailwindCSS** (스타일링)
- **Zustand** (상태 관리)
- **React Hook Form** (폼 관리)
- **React Router** (라우팅)

### Backend

- **NestJS** + **TypeScript** (Clean Architecture)
- **TypeORM** (ORM)
- **MySQL** (데이터베이스)
- **JWT** (인증)
- **Passport** (OAuth 인증)
- **Swagger** (API 문서)
- **Class Validator** (유효성 검사)

### DevOps

- **PM2** (프로세스 관리)
- **Nginx** (리버스 프록시)
- **AWS EC2** (클라우드 배포)
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
│   │   │   └── 📁 scenario-generator/  # 시나리오 생성기 유틸리티
│   │   │       ├── config.ts       # 설정 파일
│   │   │       ├── converter.ts    # 데이터 변환기
│   │   │       ├── logger.ts       # 로깅 유틸리티
│   │   │       └── validator.ts    # 데이터 검증기
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
│   ├── 📁 schema/                  # SQL 스키마 파일
│   │   └── phoenix_schema_mysql.sql
│   ├── 📁 migrations/              # 수동 SQL 마이그레이션
│   └── 📁 backups/                 # 데이터베이스 백업
│
│
├── 📁 Docs/                        # 📚 포괄적 문서
│   ├── 📁 api/                     # ✅ API 문서 및 가이드
│   ├── 📁 database/                # ✅ DB 설계 및 최적화
│   └── 📁 deployment/              # ✅ 배포 가이드 및 AWS 최적화
│
├── .gitignore
├── README.md
├── docker-compose.yml              # 로컬 개발용
└── package.json                    # 루트 패키지
```

## 🚀 빠른 시작

### 1. 환경 변수 설정

#### Backend 환경 변수 (.env 파일 생성)

```bash
# Backend/.env 파일 생성
cd Backend
cp .env.example .env  # 또는 직접 생성
```

**필수 환경 변수:**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=phoenix

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Google OAuth (Google Cloud Console에서 발급)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# OAuth 리다이렉션 설정
OAUTH_REDIRECT_BASE=https://phoenix-4.com
OAUTH_SUCCESS_REDIRECT=https://phoenix-4.com/auth/callback
OAUTH_FAILURE_REDIRECT=https://phoenix-4.com/auth/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server
PORT=3000
NODE_ENV=development
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
VITE_API_URL=http://localhost:3000

# Environment
VITE_NODE_ENV=development
```

### 2. 개발 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd Phoenix

# 개발 환경 자동 설정 (Linux/Mac)
chmod +x Frontend/scripts/setup/setup.sh
./Frontend/scripts/setup/setup.sh
```

### 3. 개발 서버 실행

```bash
# Backend 서버 시작
cd Backend
npm run start:dev

# Frontend 서버 시작 (새 터미널)
cd Frontend
npm run dev
```

### 4. 접속 확인

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API 문서**: http://localhost:3000/api

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
- **다양한 재난 유형 지원**: 화재, 지진, 응급처치, 홍수, 복합 재난

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
  id: number;
  teamId: number;
  scenarioCode: string;
  sceneId: string;
  title: string;
  content: string;
  sceneScript: string;
  disasterType: "fire" | "earthquake" | "emergency" | "flood" | "complex";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  difficulty: "easy" | "medium" | "hard" | "expert";
  options: ChoiceOption[];
  status: "ACTIVE" | "INACTIVE";
  approvalStatus: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  createdBy: number;
  order: number;
}
```

### 🎮 생성되는 시나리오 유형

- 🔥 **화재 재난 시나리오**: 건물 화재, 산불, 화학물질 화재 등
- 🌋 **지진 재난 시나리오**: 지진 발생, 건물 붕괴, 대피 상황 등
- 🚑 **응급처치 상황**: 심폐소생술, 출혈 응급처치, 골절 응급처치 등
- 🌊 **침수/홍수 시나리오**: 홍수 대피, 침수 지역 대응 등
- ⚡ **복합 재난 시나리오**: 여러 재난이 동시에 발생하는 복합 상황

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
- **실시간 검증**: 작성 중 실시간 데이터 유효성 검사
- **모듈화 설계**: 재사용 가능한 컴포넌트 구조
- **확장성**: 새로운 재난 유형 쉽게 추가 가능

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

### v2.1.0 (2025.01.16)

- **시나리오 관리 도구 통합**: [game-script-tool](https://github.com/1000ship/game-script-tool) 기반 시나리오 생성기 완전 통합
- **블록 기반 시나리오 편집기**: 드래그 앤 드롭으로 직관적인 시나리오 작성
- **데이터 관리 시스템**: JSON/SQL 형태로 시나리오 데이터 내보내기/가져오기
- **실시간 데이터 검증**: 시나리오 작성 중 자동 유효성 검사
- **관리자 인터페이스 개선**: 웹 기반 시나리오 편집 도구 추가

### v2.0.0 (2025.01.16)

- **Clean Architecture 적용**: Backend 구조를 Clean Architecture로 전면 개편
- **OAuth 로그인 지원**: Google OAuth 로그인 기능 추가
- **팀 코드 시스템**: 회원가입 후 팀 코드로 팀 가입하는 방식으로 변경
- **자동 사용자 코드 생성**: 시스템에서 사용자 코드 자동 생성 및 관리
- **타입 안정성 향상**: TypeScript 타입 정의 개선 및 에러 수정
- **UI/UX 개선**: 회원가입 폼 단순화 및 마이페이지 팀 가입 기능 추가

### 주요 변경사항

- **시나리오 관리 도구**: 관리자 페이지에서 시나리오 생성/편집 가능
- **원본 출처 명시**: game-script-tool 기반으로 개발되었음을 명시
- **재난 유형 확장**: 화재, 지진, 응급처치, 홍수, 복합 재난 시나리오 지원
- **데이터 변환 기능**: 게임 스크립트 → JSON → SQL 변환 프로세스
- 회원가입 시 팀 코드와 사용자 코드 입력 필드 제거
- 로그인 후 마이페이지에서 팀 코드로 팀 가입 가능
- Google OAuth 로그인 후 메인 페이지로 리다이렉션
- Clean Architecture 기반의 유지보수성 향상

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
