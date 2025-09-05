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
- **권한 관리**: 팀관리자, 팀운영자, 일반사용자 권한
- **데이터 격리**: 팀별 완전한 데이터 분리

### 📚 시나리오 시스템

- **다양한 재난 유형**: 화재, 지진, 응급처치, 침수/홍수
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

### Backend

- **NestJS** + **TypeScript**
- **TypeORM** (ORM)
- **MySQL** (데이터베이스)
- **JWT** (인증)
- **Swagger** (API 문서)

### DevOps

- **PM2** (프로세스 관리)
- **Nginx** (리버스 프록시)
- **AWS EC2** (클라우드 배포)
- **GitHub Actions** (CI/CD)

## 📁 프로젝트 구조

```
Phoenix/
├── 📁 Frontend/                    # React 애플리케이션
│   ├── 📁 src/
│   │   ├── 📁 components/          # 재사용 가능한 컴포넌트
│   │   │   ├── 📁 layout/          # 레이아웃 컴포넌트
│   │   │   └── 📁 ui/              # UI 컴포넌트
│   │   ├── 📁 pages/               # 페이지 컴포넌트
│   │   │   ├── 📁 auth/            # 인증 관련
│   │   │   ├── 📁 admin/           # 관리자 기능
│   │   │   ├── 📁 scenario/        # 시나리오 관리
│   │   │   ├── 📁 training/        # 훈련 관련
│   │   │   └── 📁 user/            # 사용자 기능
│   │   ├── 📁 services/            # API 통신 서비스
│   │   ├── 📁 stores/              # 상태 관리
│   │   ├── 📁 types/               # TypeScript 타입
│   │   └── 📁 hooks/               # 커스텀 훅
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── 📁 Backend/                     # NestJS 애플리케이션
│   ├── 📁 src/
│   │   ├── 📁 modules/             # 기능별 모듈
│   │   │   ├── 📁 auth/            # 인증 모듈
│   │   │   ├── 📁 users/           # 사용자 관리
│   │   │   ├── 📁 teams/           # 팀 관리
│   │   │   ├── 📁 scenarios/       # 시나리오 관리
│   │   │   ├── 📁 training/        # 훈련 관리
│   │   │   ├── 📁 training-results/ # 훈련 결과
│   │   │   ├── 📁 user-progress/   # 사용자 진행상황
│   │   │   ├── 📁 support/         # 지원 시스템
│   │   │   ├── 📁 codes/           # 코드 관리
│   │   │   ├── 📁 admin/           # 관리자 기능
│   │   │   └── 📁 common/          # 공통 모듈
│   │   ├── 📁 database/            # 데이터베이스 관련
│   │   │   ├── 📁 entities/        # TypeORM 엔티티
│   │   │   ├── 📁 migrations/      # 마이그레이션
│   │   │   └── 📁 seeds/           # 시드 데이터
│   │   ├── 📁 config/              # 환경 설정
│   │   ├── 📁 shared/              # 공유 모듈
│   │   └── 📁 utils/               # 유틸리티
│   ├── package.json
│   ├── ormconfig.ts                # TypeORM 설정
│   └── ecosystem.config.js         # PM2 설정
│
├── 📁 Database/                    # SQL 스키마 및 백업 (운영용)
│   ├── 📁 schema/                  # SQL 스키마 파일
│   │   └── phoenix_schema_mysql.sql
│   ├── 📁 migrations/              # 수동 SQL 마이그레이션
│   └── 📁 backups/                 # 데이터베이스 백업
│
├── 📁 Scripts/                     # 배포 및 유틸리티 스크립트
│   ├── 📁 setup/                   # ✅ 개발 환경 설정
│   │   ├── setup.sh                # Linux/Mac 설정 스크립트
│   │   └── start-dev.sh            # 개발 서버 시작
│   ├── 📁 build/                   # ✅ 빌드 스크립트
│   │   ├── build.sh                # Linux/Mac 빌드
│   │   └── build.bat               # Windows 빌드
│   ├── 📁 deploy/                  # ✅ AWS 배포 스크립트
│   │   └── deploy.sh               # 원클릭 배포
│   ├── 📁 game-script-tool/        # 시나리오 생성 도구
│   ├── 📁 scenario-generator/      # 시나리오 변환 스크립트
│   └── 📁 data/                    # 샘플 시나리오 데이터
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

### 1. 개발 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd Phoenix

# 개발 환경 자동 설정 (Linux/Mac)
chmod +x Scripts/setup/setup.sh
./Scripts/setup/setup.sh

# Windows의 경우
Scripts\setup\setup.bat
```

### 2. 개발 서버 실행

```bash
# Linux/Mac
./Scripts/setup/start-dev.sh

# Windows
Scripts\setup\start-dev.bat
```

### 3. 접속 확인

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API 문서**: http://localhost:3000/api

## 🎯 시나리오 생성 도구

### 게임 스크립트 도구

- **출처**: [1000ship/game-script-tool](https://github.com/1000ship/game-script-tool)
- **라이선스**: 자유 사용 허가 (제작자: 1000ship)
- **용도**: 재난 대응 훈련 시나리오 데이터 생성
- **설명**: 게임 스크립트 형식의 시나리오를 Phoenix 시스템용 데이터로 변환하는 도구

### 생성되는 시나리오 유형

- 🔥 **화재 재난 시나리오**
- 🌋 **지진 재난 시나리오**
- 🚑 **응급처치 상황 시나리오**
- 🌊 **침수/홍수 시나리오**
- ⚡ **복합 재난 시나리오**

### 데이터 변환 프로세스

```
게임 스크립트 → JSON 형식 → MySQL INSERT 문 → Phoenix 데이터베이스
```

## 💰 AWS 배포 비용

### 최소 구성 (월 $25.50)

- EC2: t3.micro (1 vCPU, 1GB RAM)
- RDS: db.t3.micro (1 vCPU, 1GB RAM)
- 스토리지: 20GB GP2 SSD

### 소규모 운영 (월 $49.30)

- EC2: t3.small (2 vCPU, 2GB RAM)
- RDS: db.t3.small (2 vCPU, 2GB RAM)
- 스토리지: 20GB GP2 SSD

### 중규모 운영 (월 $96.30)

- EC2: t3.medium (2 vCPU, 4GB RAM)
- RDS: db.t3.medium (2 vCPU, 4GB RAM)
- 스토리지: 20GB GP2 SSD

## 🔧 배포

### 자동 배포 (권장)

```bash
# AWS EC2 원클릭 배포
chmod +x Scripts/deploy/deploy.sh
./Scripts/deploy/deploy.sh
```

### 수동 배포

```bash
# 프로덕션 빌드
chmod +x Scripts/build/build.sh
./Scripts/build/build.sh

# 수동 배포 단계는 Docs/deployment/README.md 참조
```

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
