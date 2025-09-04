# Phoenix

Final Project

### 폴더 구조

```
Phoenix/
├── 📁 Frontend/ # React + TypeScript + TailwindCSS
│ ├── 📁 public/ # 정적 파일들
│ ├── 📁 src/
│ │ ├── 📁 components/ # 재사용 가능한 컴포넌트
│ │ │ ├── 📁 common/ # 공통 컴포넌트 (Button, Input, Modal 등)
│ │ │ ├── 📁 layout/ # 레이아웃 관련 (Header, Sidebar, Footer 등)
│ │ │ ├── 📁 forms/ # 폼 관련 컴포넌트
│ │ │ └── 📁 ui/ # UI 컴포넌트 (Card, Table, Chart 등)
│ │ ├── 📁 pages/ # 페이지 컴포넌트
│ │ │ ├── 📁 auth/ # 인증 관련 (Login, Register 등)
│ │ │ ├── 📁 dashboard/ # 대시보드
│ │ │ ├── 📁 scenario/ # 시나리오 관리
│ │ │ ├── 📁 training/ # 훈련 관련
│ │ │ ├── 📁 admin/ # 관리자 기능
│ │ │ └── 📁 user/ # 사용자 기능
│ │ ├── 📁 hooks/ # 커스텀 훅
│ │ ├── 📁 services/ # API 통신 서비스
│ │ ├── 📁 stores/ # 상태 관리 (Zustand/Redux)
│ │ ├── 📁 types/ # TypeScript 타입 정의
│ │ ├── 📁 utils/ # 유틸리티 함수
│ │ ├── 📁 constants/ # 상수 정의
│ │ └── 📁 styles/ # 글로벌 스타일
│ ├── package.json
│ ├── tailwind.config.js
│ ├── tsconfig.json
│ └── vite.config.ts # Vite 설정
│
├── 📁 Backend/ # NestJS + TypeScript
│ ├── 📁 src/
│ │ ├── 📁 main.ts # 애플리케이션 진입점
│ │ ├── 📁 app.module.ts # 루트 모듈
│ │ ├── 📁 config/ # 환경 설정
│ │ ├── 📁 database/ # 데이터베이스 관련
│ │ │ ├── 📁 migrations/ # 마이그레이션 파일
│ │ │ ├── 📁 seeds/ # 시드 데이터
│ │ │ └── 📁 entities/ # TypeORM 엔티티
│ │ ├── 📁 modules/ # 기능별 모듈
│ │ │ ├── 📁 auth/ # 인증 모듈
│ │ │ ├── 📁 users/ # 사용자 관리
│ │ │ ├── 📁 teams/ # 팀 관리
│ │ │ ├── 📁 scenarios/ # 시나리오 관리
│ │ │ ├── 📁 training/ # 훈련 관리
│ │ │ ├── 📁 admin/ # 관리자 기능
│ │ │ └── 📁 common/ # 공통 모듈
│ │ ├── 📁 shared/ # 공유 모듈
│ │ │ ├── 📁 decorators/ # 커스텀 데코레이터
│ │ │ ├── 📁 guards/ # 가드
│ │ │ ├── 📁 interceptors/ # 인터셉터
│ │ │ ├── 📁 pipes/ # 파이프
│ │ │ └── 📁 filters/ # 예외 필터
│ │ └── 📁 utils/ # 유틸리티 함수
│ ├── 📁 test/ # 테스트 파일
│ ├── 📁 package.json
│ ├── 📁 nest-cli.json
│ ├── 📁 tsconfig.json
│ └── 📁 .env # 환경 변수
│
├── 📁 Database/ # MySQL 관련
│ ├── 📁 migrations/ # 데이터베이스 마이그레이션
│ ├── 📁 seeds/ # 초기 데이터
│ ├── 📁 backups/ # 백업 파일
│ └──  phoenix_schema_mysql.sql # 현재 스키마
│
├── 📁 Docs/ # 문서
│ ├── 📁 api/ # API 문서
│ ├── 📁 database/ # 데이터베이스 문서
│ └── 📁 deployment/ # 배포 가이드
│
├── 📁 Scripts/ # 유틸리티 스크립트
│ ├── 📁 setup/ # 개발 환경 설정
│ ├── 📁 build/ # 빌드 스크립트
│ ├── 📁 deploy/ # 배포 스크립트
│ ├── 📁 game-script-tool/ # 시나리오 생성 도구 (출처: 1000ship/game-script-tool)
│ ├── 📁 scenario-generator/ # 시나리오 변환 스크립트
│ └── 📁 data/ # 생성된 시나리오 데이터
│
├── .gitignore
├── README.md
├── docker-compose.yml # 개발 환경 Docker
└── package.json # 루트 패키지 (모노레포)
```

## 🎯 시나리오 생성 도구

### 게임 스크립트 도구

- **출처**: [1000ship/game-script-tool](https://github.com/1000ship/game-script-tool)
- **라이선스**: 자유 사용 허가 (제작자: 1000ship)
- **용도**: 재난 대응 훈련 시나리오 데이터 생성
- **설명**: 게임 스크립트 형식의 시나리오를 Phoenix 시스템용 데이터로 변환하는 도구

### 폴더 구조

```
Scripts/
├── game-script-tool/          # 클론된 원본 도구
├── scenario-generator/        # 시나리오 변환 스크립트
└── data/                      # 생성된 시나리오 데이터
```

### 생성되는 시나리오 유형

- 🔥 화재 재난 시나리오
- 🌋 지진 재난 시나리오
- 🚑 응급처치 상황 시나리오
- 🌊 침수/홍수 시나리오
- ⚡ 복합 재난 시나리오

### 데이터 변환 프로세스

```
게임 스크립트 → JSON 형식 → MySQL INSERT 문 → Phoenix 데이터베이스
```

## 📦 패키지 정보

### Frontend Dependencies (프로덕션)

| 패키지                  | 버전    | 역할                                                              |
| ----------------------- | ------- | ----------------------------------------------------------------- |
| `@hookform/resolvers`   | ^3.3.4  | React Hook Form과 Yup 스키마 검증 라이브러리 연결                 |
| `@tanstack/react-query` | ^5.17.9 | 서버 상태 관리 및 데이터 페칭 (캐싱, 동기화, 백그라운드 업데이트) |
| `axios`                 | ^1.6.2  | HTTP 클라이언트 (API 통신)                                        |
| `clsx`                  | ^2.0.0  | 조건부 CSS 클래스 조합 유틸리티                                   |
| `date-fns`              | ^2.30.0 | 날짜/시간 조작 및 포맷팅 라이브러리                               |
| `react`                 | ^19.1.1 | React 라이브러리 (UI 컴포넌트 프레임워크)                         |
| `react-confetti`        | ^6.4.0  | 축하 효과용 컨페티 애니메이션                                     |
| `react-dom`             | ^19.1.1 | React DOM 렌더링 라이브러리                                       |
| `react-hook-form`       | ^7.48.2 | 폼 상태 관리 및 검증 라이브러리                                   |
| `react-router-dom`      | ^6.20.1 | React 라우팅 라이브러리 (SPA 네비게이션)                          |
| `tailwind-merge`        | ^2.2.0  | Tailwind CSS 클래스 충돌 해결 및 병합                             |
| `yup`                   | ^1.3.3  | 스키마 기반 데이터 검증 라이브러리                                |
| `zustand`               | ^4.4.7  | 경량 전역 상태 관리 라이브러리                                    |

### Frontend DevDependencies (개발용)

| 패키지                        | 버전     | 역할                                      |
| ----------------------------- | -------- | ----------------------------------------- |
| `@eslint/js`                  | ^9.33.0  | ESLint JavaScript 규칙 세트               |
| `@types/react`                | ^19.1.10 | React TypeScript 타입 정의                |
| `@types/react-dom`            | ^19.1.7  | React DOM TypeScript 타입 정의            |
| `@types/yup`                  | ^0.32.0  | Yup TypeScript 타입 정의                  |
| `@vitejs/plugin-react`        | ^5.0.0   | Vite React 플러그인 (HMR, JSX 변환)       |
| `autoprefixer`                | ^10.4.21 | CSS 벤더 프리픽스 자동 추가               |
| `eslint`                      | ^9.33.0  | JavaScript/TypeScript 코드 품질 검사 도구 |
| `eslint-plugin-react-hooks`   | ^5.2.0   | React Hooks 규칙 검사 플러그인            |
| `eslint-plugin-react-refresh` | ^0.4.20  | React Fast Refresh 지원 플러그인          |
| `globals`                     | ^16.3.0  | ESLint 글로벌 변수 정의                   |
| `postcss`                     | ^8.5.6   | CSS 후처리 도구                           |
| `tailwindcss`                 | ^3.4.0   | 유틸리티 우선 CSS 프레임워크              |
| `typescript`                  | ~5.8.3   | TypeScript 컴파일러 및 타입 시스템        |
| `typescript-eslint`           | ^8.39.1  | TypeScript ESLint 규칙 및 파서            |
| `vite`                        | ^7.1.2   | 빠른 빌드 도구 및 개발 서버               |

### Root Package

| 패키지    | 버전  | 역할                                |
| --------- | ----- | ----------------------------------- |
| `phoenix` | 1.0.0 | Phoenix 재난훈련 시스템 루트 패키지 |

### 기술 스택 요약

- **프론트엔드**: React 19 + TypeScript + TailwindCSS + Vite
- **상태관리**: Zustand (전역) + React Query (서버 상태)
- **라우팅**: React Router DOM v6
- **폼관리**: React Hook Form + Yup 검증
- **스타일링**: TailwindCSS + PostCSS
- **개발도구**: ESLint + TypeScript + Vite
- **빌드도구**: Vite (ESBuild 기반)

```

```
