# 재난훈련ON (Phoenix)

가상현실과 시뮬레이션을 통해 재난 상황에 대한 대응 능력을 향상시키는 혁신적인 훈련 플랫폼입니다.

## 🚀 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Server State**: React Query
- **Routing**: React Router v6
- **Build Tool**: Vite

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── layout/          # 레이아웃 컴포넌트
│   └── ui/             # 재사용 가능한 UI 컴포넌트
│       ├── AnimatedText.tsx    # 애니메이션 텍스트
│       ├── AnimatedButton.tsx  # 애니메이션 버튼
│       └── VimeoVideo.tsx      # Vimeo 비디오 플레이어
├── hooks/               # 커스텀 훅
│   └── useAnimation.ts  # 애니메이션 훅
├── stores/              # 상태 관리 (Zustand)
├── services/            # API 서비스
├── types/               # TypeScript 타입 정의
└── pages/               # 페이지 컴포넌트
```

## 🎯 주요 기능

- **실시간 시나리오**: 다양한 재난 상황 시뮬레이션
- **성과 분석**: 훈련 결과 분석 및 개선점 제시
- **반복 훈련**: 필요에 따른 반복 훈련 지원
- **팀워크 훈련**: 협력과 소통 능력 향상
- **모바일 지원**: 언제 어디서나 접근 가능
- **안전 보장**: 실제 위험 없이 안전한 훈련 환경

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트 검사
npm run lint
```

## 🎨 디자인 시스템

- **Primary Colors**: Orange (#f97316) - Red (#ea580c)
- **Typography**: System UI, Avenir, Helvetica
- **Animations**: Fade, Slide, Scale 효과
- **Responsive**: Mobile-first 접근법

## 📱 반응형 디자인

- 모바일 우선 설계
- Tailwind CSS 유틸리티 클래스 활용
- 부드러운 애니메이션과 전환 효과
- 다크모드 지원

## 🔧 최적화 완료

- 사용하지 않는 컴포넌트 제거
- 코드 중복 제거
- 불필요한 스타일 정리
- 컴포넌트 구조 단순화
- 성능 향상을 위한 코드 정리
