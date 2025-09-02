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
│ └── 📁 phoenix_schema_mysql.sql # 현재 스키마
│
├── 📁 Docs/ # 문서
│ ├── 📁 api/ # API 문서
│ ├── 📁 database/ # 데이터베이스 문서
│ └── 📁 deployment/ # 배포 가이드
│
├── 📁 Scripts/ # 유틸리티 스크립트
│ ├── 📁 setup/ # 개발 환경 설정
│ ├── 📁 build/ # 빌드 스크립트
│ └── 📁 deploy/ # 배포 스크립트
│
├── 📁 .github/ # GitHub Actions
│ └── 📁 workflows/ # CI/CD 워크플로우
│
├── 📁 .vscode/ # VS Code 설정
├── .gitignore
├── README.md
├── docker-compose.yml # 개발 환경 Docker
└── package.json # 루트 패키지 (모노레포)
```
