export interface User {
  id: number;
  teamId: number;
  userCode: string;
  loginId: string;
  name: string;
  email: string;
  useYn: string;
  userLevel: number;
  userExp: number;
  totalScore: number;
  completedScenarios: number;
  currentTier: string;
  levelProgress: number;
  nextLevelExp: number;
  role: string;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // 시나리오별 통계 (선택적)
  scenarioStats?: {
    fire: { completed: number; totalScore: number; bestScore: number };
    earthquake: { completed: number; totalScore: number; bestScore: number };
    flood: { completed: number; totalScore: number; bestScore: number };
    emergency: { completed: number; totalScore: number; bestScore: number };
    chemical: { completed: number; totalScore: number; bestScore: number };
    nuclear: { completed: number; totalScore: number; bestScore: number };
    terrorism: { completed: number; totalScore: number; bestScore: number };
    pandemic: { completed: number; totalScore: number; bestScore: number };
    naturalDisaster: {
      completed: number;
      totalScore: number;
      bestScore: number;
    };
    complex: { completed: number; totalScore: number; bestScore: number };
  };
}

export const UserRole = {
  ADMIN: 'ADMIN',
  TRAINER: 'TRAINER',
  VIEWER: 'VIEWER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Frontend와 통합된 시나리오 타입
export interface Scenario {
  id: number;
  teamId: number;
  scenarioCode: string;
  title: string;
  disasterType: string;
  description: string;
  riskLevel: string;
  occurrenceCondition?: string;
  status: string;
  approvalComment?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdBy: number;
  approvedAt?: string;
  approvedBy?: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // game-script-tool 전용 필드들
  sceneId?: string;
  content?: string;
  sceneScript?: string;
  options?: ScenarioOption[];
  events?: DecisionEvent[];
}

export interface DecisionEvent {
  id: number;
  scenarioCode: string;
  eventCode: string;
  eventOrder: number;
  eventDescription: string;
  eventType: string;
  createdBy: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  choices?: ChoiceOption[];
}

export interface ChoiceOption {
  id: number;
  eventId: number;
  scenarioCode: string;
  choiceCode: string;
  choiceText: string;
  isCorrect: boolean;
  scoreWeight: number;
  nextEventId?: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // game-script-tool 전용 필드들
  answerId?: string;
  answer?: string;
  reaction?: string;
  nextId?: string;
  points?: {
    speed: number;
    accuracy: number;
  };
  exp?: number;
}

// Frontend와 호환되는 ScenarioOption 타입
export interface ScenarioOption {
  id: number;
  answerId: string;
  answer: string;
  reaction: string;
  nextId: string;
  points?: {
    accuracy: number;
  };
}

export const ScenarioStatus = {
  DRAFT: '임시저장',
  PENDING: '승인대기',
  APPROVED: '승인완료',
  REJECTED: '승인거부',
  ACTIVE: '활성화',
  INACTIVE: '비활성화',
} as const;

export type ScenarioStatus =
  (typeof ScenarioStatus)[keyof typeof ScenarioStatus];

export const EventType = {
  CHOICE: '선택형',
  SEQUENTIAL: '순차형',
  TIMED: '시간제한형',
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

// 기존 ScriptBlock (하위 호환성을 위해 유지)
export interface ScriptBlock {
  sceneId: string;
  title?: string;
  content?: string;
  sceneScript?: string;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  order: number;
  disasterType?: string;
  difficulty?: string;
  rejectionReason?: string;
  options?: Array<{
    answerId: string;
    answer: string;
    reaction: string;
    nextId: string;
    points: {
      speed: number;
      accuracy: number;
    };
  }>;
  sceneType?: string;
  nextSceneId?: string;
}

export const ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DRAFT: 'DRAFT',
} as const;

export type ApprovalStatus =
  (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

export interface AppState {
  isSceneFormOpened: boolean;
  modifySceneId: string | null;
  isScenarioFormOpened: boolean;
  modifyScenarioId: string | null;
}

export interface TrainingResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
  // 레벨업 시스템 관련 필드 추가
  exp_gained: number; // 획득한 경험치
  level_before: number; // 훈련 전 레벨
  level_after: number; // 훈련 후 레벨
  level_up: boolean; // 레벨업 여부
  bonus_exp: number; // 보너스 경험치 (난이도, 빠른 완료 등)
}

// 레벨업 시스템을 위한 새로운 인터페이스
export interface UserProgress {
  user_id: string;
  user_level: number;
  user_exp: number;
  total_score: number;
  completed_scenarios: number;
  current_streak: number; // 연속 완료 횟수
  longest_streak: number; // 최장 연속 완료 횟수
  achievements: Achievement[];
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  achievement_id: string;
  achievement_name: string;
  achievement_description: string;
  achievement_type: AchievementType;
  unlocked_at: string;
  progress: number; // 달성도 (0-100)
  is_completed: boolean;
}

export const AchievementType = {
  LEVEL_UP: 'LEVEL_UP', // 레벨업 달성
  SCENARIO_COMPLETE: 'SCENARIO_COMPLETE', // 시나리오 완료
  PERFECT_SCORE: 'PERFECT_SCORE', // 만점 달성
  STREAK: 'STREAK', // 연속 완료
  SPEED_RUNNER: 'SPEED_RUNNER', // 빠른 완료
  ACCURACY_MASTER: 'ACCURACY_MASTER', // 정확성 마스터
} as const;

export type AchievementType =
  (typeof AchievementType)[keyof typeof AchievementType];

// 경험치 계산을 위한 상수
export const EXP_CONSTANTS = {
  BASE_EXP_PER_CORRECT: 10, // 정답당 기본 경험치
  SPEED_MULTIPLIER: 1.5, // 신속성 보너스 배율
  ACCURACY_MULTIPLIER: 1.3, // 정확성 보너스 배율
  DIFFICULTY_BONUS: {
    // 난이도별 보너스
    easy: 1.0,
    medium: 1.2,
    hard: 1.5,
  },
  SCENARIO_TYPE_BONUS: {
    // 시나리오 유형별 보너스
    fire: 1.0, // 화재 (기본)
    earthquake: 1.1, // 지진 (10% 보너스)
    flood: 1.1, // 홍수 (10% 보너스)
    emergency: 1.2, // 응급처치 (20% 보너스)
    chemical: 1.3, // 화학사고 (30% 보너스)
    nuclear: 1.4, // 원자력사고 (40% 보너스)
    terrorism: 1.5, // 테러 대응 (50% 보너스)
    pandemic: 1.6, // 전염병 (60% 보너스)
    natural_disaster: 1.7, // 자연재해 (70% 보너스)
    complex: 2.0, // 복합재난 (100% 보너스)
  },
  LEVEL_UP_THRESHOLDS: [
    // 1-20레벨 (초급)
    0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200,
    5950, 6750, 7600, 8500, 9450, 10450,
    // 21-40레벨 (중급)
    11500, 12600, 13800, 15100, 16500, 18000, 19600, 21300, 23100, 25000, 27000,
    29100, 31300, 33600, 36000, 38500, 41100, 43800, 46600, 49500,
    // 41-60레벨 (고급)
    52500, 55600, 58800, 62100, 65500, 69000, 72600, 76300, 80100, 84000, 88000,
    92100, 96300, 100600, 105000, 109500, 114100, 118800, 123600, 128500,
    // 61-80레벨 (전문가)
    133500, 138600, 143800, 149100, 154500, 160000, 165600, 171300, 177100,
    183000, 189000, 195100, 201300, 207600, 214000, 220500, 227100, 233800,
    240600, 247500,
    // 81-100레벨 (마스터)
    254500, 261600, 268800, 276100, 283500, 291000, 298600, 306300, 314100,
    322000, 330000, 338100, 346300, 354600, 363000, 371500, 380100, 388800,
    397600, 406500,
  ],
  MAX_LEVEL: 100,
  // 레벨별 등급 시스템
  LEVEL_TIERS: {
    BEGINNER: { min: 1, max: 20, name: '초급자', color: '#4CAF50' },
    INTERMEDIATE: { min: 21, max: 40, name: '중급자', color: '#2196F3' },
    ADVANCED: { min: 41, max: 60, name: '고급자', color: '#FF9800' },
    EXPERT: { min: 61, max: 80, name: '전문가', color: '#9C27B0' },
    MASTER: { min: 81, max: 100, name: '마스터', color: '#F44336' },
  },
} as const;

export interface SceneFormData {
  title: string;
  content: string;
  order: number;
}

export interface ApprovalUpdateData {
  sceneId: string;
  approvalStatus: ApprovalStatus;
  approvedBy: string;
  approvedAt: string;
}

// 새로운 폼 데이터 인터페이스
export interface ScenarioFormData {
  scenarioCode: string;
  title: string;
  disasterType: string;
  description: string;
  riskLevel: string;
  occurrenceCondition: string;
  events: EventFormData[];
}

export interface EventFormData {
  eventCode: string;
  eventOrder: number;
  eventDescription: string;
  eventType: EventType;
  choices: ChoiceFormData[];
}

export interface ChoiceFormData {
  choiceCode: string;
  choiceText: string;
  isCorrect: boolean;
  scoreWeight: number;
  nextEventId: string;
}
