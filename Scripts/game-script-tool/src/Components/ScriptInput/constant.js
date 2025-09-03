export const DEFAULT_SCENE = {
  sceneId: "",
  // ❌ characterName: "", // 제거 - 사용자 실제 이름 사용
  // ❌ characterImage: "", // 제거 - 불필요
  sceneScript: "",
  // 주석 처리로 보존 (나중에 사용 가능)
  // backgroundImage: "",
  // sceneSound: "",
  // backgroundSound: "",
  nextSceneId: "",
  // ✅ 재난 대응 요소 추가
  disasterType: "fire", // 재난 유형
  difficulty: "medium", // 난이도
  timeLimit: 60, // 타이머 (초)
  // ✅ 승인 프로세스 요소 추가
  approvalStatus: "draft", // 승인 상태 (초안)
  createdBy: "", // 작성자 ID
  createdAt: new Date().toISOString(), // 작성 시간
  approvedBy: "", // 승인자 ID
  approvedAt: "", // 승인 시간
  rejectionReason: "", // 거부 사유
  options: [
    {
      answer: "", // 선택지 (예: "대피", "신고", "진화 시도")
      reaction: "", // 반응/결과
      nextId: "", // 다음 시나리오 ID
      points: {
        // 점수 시스템 (싱글 플레이에 최적화)
        speed: 0, // 신속성 점수
        accuracy: 0, // 정확성 점수
        // ❌ cooperation: 0 // 협업 점수 제거 - 싱글 플레이 불필요
      },
    },
  ],
  sceneType: "disaster", // 재난 상황으로 변경
};

// ✅ 재난 유형 상수
export const DISASTER_TYPES = {
  FIRE: "fire", // 화재
  EARTHQUAKE: "earthquake", // 지진
  EMERGENCY: "emergency", // 응급처치
  FLOOD: "flood", // 침수/홍수
  COMPLEX: "complex", // 복합 재난
};

// ✅ 난이도 상수
export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

// ✅ 시나리오 타입 (기존 미연시 → 재난 대응)
export const SCENE_TYPE_DISASTER = "disaster"; // 재난 상황
export const SCENE_TYPE_ENDING = "ending"; // 훈련 결과/엔딩
export const SCENE_TYPE_TRAINING = "training"; // 훈련 진행
export const SCENE_TYPE_ANALYSIS = "analysis"; // 결과 분석

// ✅ 점수 계산 가중치
export const SCORE_WEIGHTS = {
  SPEED: 0.4, // 신속성 가중치 40%
  ACCURACY: 0.6, // 정확성 가중치 60%
};

// ✅ 점수 등급 기준
export const SCORE_GRADES = {
  EXCELLENT: { min: 90, name: "우수", emoji: "🏆" },
  GOOD: { min: 80, name: "양호", emoji: "🥈" },
  AVERAGE: { min: 70, name: "보통", emoji: "🥉" },
  BELOW_AVERAGE: { min: 60, name: "미흡", emoji: "⚠️" },
  POOR: { min: 0, name: "불량", emoji: "❌" },
};

// ❌ 기존 미연시 타입 제거
// export const SCENE_TYPE_MEET = "meet"
// export const SCENE_TYPE_TEXT = "text"

// ✅ 승인 상태 상수
export const APPROVAL_STATUS = {
  PENDING: "pending", // 승인 대기
  APPROVED: "approved", // 승인됨
  REJECTED: "rejected", // 거부됨
  DRAFT: "draft", // 초안
};

// ✅ 승인 상태별 이모지 및 한글명
export const APPROVAL_STATUS_INFO = {
  pending: { emoji: "⏳", name: "승인 대기", color: "#FFA500" },
  approved: { emoji: "✅", name: "승인됨", color: "#4CAF50" },
  rejected: { emoji: "❌", name: "거부됨", color: "#F44336" },
  draft: { emoji: "📝", name: "초안", color: "#9E9E9E" },
};

// ✅ 사용자 역할 상수
export const USER_ROLES = {
  ADMIN: "admin", // 관리자
  TRAINER: "trainer", // 훈련자
  VIEWER: "viewer", // 조회자
};
