# 📝 Phoenix Scripts 도구

이 폴더는 Phoenix 프로젝트의 시나리오 생성 및 관리 도구들을 포함합니다.

## 🛠️ 사용 가능한 도구

### 1. Game Script Tool

- **위치**: `game-script-tool/`
- **용도**: 재난 대응 훈련 시나리오 생성
- **접근**: 관리자 페이지에서 웹 인터페이스로 접근

### 2. Scenario Generator

- **위치**: `scenario-generator/`
- **용도**: 기존 시나리오 데이터를 Phoenix 형식으로 변환
- **CLI 명령어**: `npm run scenario:convert`, `npm run scenario:convert-all`

## 🚀 실행 방법

### 메인 Phoenix 앱 실행

```bash
cd Frontend
npm install
npm run dev
```

### Scripts 도구 실행

```bash
cd Frontend
npm run dev:scripts
```

### 시나리오 변환 도구 사용

```bash
cd Frontend
npm run scenario:convert
npm run scenario:convert-all
npm run scenario:validate
```

## 📁 폴더 구조

```
scripts/
├── game-script-tool/          # 게임 스크립트 생성 도구
│   ├── src/                   # 소스 코드
│   ├── public/                # 정적 파일
│   └── index.html             # 진입점
├── scenario-generator/        # 시나리오 변환 도구
│   └── src/                   # 변환 스크립트
├── data/                      # 샘플 시나리오 데이터
├── deploy/                    # 배포 스크립트
└── setup/                     # 개발 환경 설정
```

## ⚠️ 주의사항

- 모든 도구는 Frontend 폴더의 통합된 `package.json`을 사용합니다
- `scripts/game-script-tool/node_modules` 폴더는 더 이상 필요하지 않습니다 (삭제 가능)
- TypeScript 설정은 Frontend 루트의 `tsconfig.app.json`에 통합되었습니다
