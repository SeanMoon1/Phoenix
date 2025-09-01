## 📦 Repository Structure

Phoenix/
├── Frontend/ # React + TypeScript + TailwindCSS (Vite)
│ ├── public/ # 정적 파일
│ ├── src/
│ │ ├── components/ # 재사용 컴포넌트
│ │ │ ├── common/ # 공통 (Button, Input, Modal 등)
│ │ │ ├── layout/ # Header, Sidebar, Footer 등
│ │ │ ├── forms/ # 폼 컴포넌트
│ │ │ └── ui/ # Card, Table, Chart 등
│ │ ├── pages/
│ │ │ ├── auth/ # 로그인/회원가입
│ │ │ ├── dashboard/ # 대시보드
│ │ │ ├── scenario/ # 시나리오 관리
│ │ │ ├── training/ # 훈련 관련
│ │ │ ├── admin/ # 관리자 기능
│ │ │ └── user/ # 사용자 기능
│ │ ├── hooks/ # 커스텀 훅
│ │ ├── services/ # API 통신
│ │ ├── stores/ # Zustand/Redux 상태관리
│ │ ├── types/ # TS 타입 정의
│ │ ├── utils/ # 유틸 함수
│ │ ├── constants/ # 상수
│ │ └── styles/ # 글로벌 스타일
│ ├── package.json
│ ├── tailwind.config.js
│ ├── tsconfig.json
│ └── vite.config.ts
├── Backend/ # NestJS + TypeScript
│ ├── src/
│ │ ├── main.ts # 애플리케이션 진입점
│ │ ├── app.module.ts # 루트 모듈
│ │ ├── config/ # 환경 설정
│ │ ├── database/
│ │ │ ├── migrations/ # 마이그레이션
│ │ │ ├── seeds/ # 시드 데이터
│ │ │ └── entities/ # TypeORM 엔티티
│ │ ├── modules/ # 기능별 모듈
│ │ │ ├── auth/
│ │ │ ├── users/
│ │ │ ├── teams/
│ │ │ ├── scenarios/
│ │ │ ├── training/
│ │ │ ├── admin/
│ │ │ └── common/
│ │ ├── shared/
│ │ │ ├── decorators/
│ │ │ ├── guards/
│ │ │ ├── interceptors/
│ │ │ ├── pipes/
│ │ │ └── filters/
│ │ └── utils/
│ ├── test/
│ ├── package.json
│ ├── nest-cli.json
│ ├── tsconfig.json
│ └── .env # 환경 변수
├── Database/ # MySQL 관련
│ ├── migrations/ # DB 마이그레이션
│ ├── seeds/ # 초기 데이터
│ ├── backups/ # 백업 파일
│ └── phoenix_schema_mysql.sql
├── Docs/ # 문서
│ ├── api/ # API 문서
│ ├── database/ # DB 문서
│ └── deployment/ # 배포 가이드
├── Scripts/ # 유틸 스크립트
│ ├── setup/ # 개발 환경 설정
│ ├── build/ # 빌드 스크립트
│ └── deploy/ # 배포 스크립트
├── .github/
│ └── workflows/ # GitHub Actions (CI/CD)
├── .vscode/ # VS Code 설정
├── .gitignore
├── README.md
├── docker-compose.yml # 개발용 Docker
└── package.json # 모노레포 루트 패키지
