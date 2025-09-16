// 기본 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 사용자 타입 (Database 스키마 기준)
export interface User {
  id: string;
  teamId?: number;
  userCode?: string;
  loginId: string;
  password?: string; // API 응답에서는 제외되지만 내부적으로 사용
  name: string;
  email: string;
  // OAuth 관련 필드들
  oauthProvider?: string;
  oauthProviderId?: string;
  profileImageUrl?: string;
  useYn: string;
  // 레벨업 시스템 관련 필드
  userLevel: number;
  userExp: number;
  totalScore: number;
  completedScenarios: number;
  currentTier: string;
  levelProgress: number;
  nextLevelExp: number;
  // 시스템 필드들
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // 관리자 관련 정보 (관계 테이블에서 조인)
  isAdmin?: boolean;
  adminLevel?: string;
  adminPermissions?: string[];
  role?: string;
}

// 인증 관련 타입
export interface LoginCredentials {
  loginId: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 팀 타입 (Database 스키마 기준)
export interface Team {
  id: number;
  teamCode: string;
  name: string;
  description?: string;
  status: string;
  createdBy?: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 시나리오 타입 (Database 스키마 기준)
export interface Scenario {
  id: number;
  teamId: number;
  scenarioCode: string;
  title: string;
  disasterType: string;
  description: string;
  riskLevel: string;
  difficulty: string;
  approvalStatus: string;
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
  // 게임에서 사용되는 추가 속성들
  sceneId?: string;
  content?: string;
  sceneScript?: string;
  options?: ChoiceOption[];
  // 관계 데이터 (선택적)
  scenes?: ScenarioScene[];
  events?: ScenarioEvent[];
}

// 훈련 세션 타입 (Database 스키마 기준)
export interface TrainingSession {
  id: number;
  teamId: number;
  scenarioId: number;
  sessionCode: string;
  sessionName: string;
  startTime: string;
  endTime?: string;
  maxParticipants?: number;
  status: string;
  createdBy: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // 관계 데이터 (선택적)
  participants?: TrainingParticipant[];
}

// 시나리오 씬 타입 (Database 스키마 기준)
export interface ScenarioScene {
  id: number;
  scenarioId: number;
  sceneCode: string;
  sceneOrder: number;
  title: string;
  content: string;
  sceneScript: string;
  imageUrl?: string;
  videoUrl?: string;
  estimatedTime?: number;
  createdBy: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 시나리오 이벤트 타입 (Database 스키마 기준)
export interface ScenarioEvent {
  id: number;
  scenarioId: number;
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
  // 관계 데이터 (선택적)
  choices?: ChoiceOption[];
}

// 선택 옵션 타입 (Database 스키마 기준)
export interface ChoiceOption {
  id: number;
  eventId: number;
  scenarioId: number;
  sceneId?: number;
  choiceCode: string;
  choiceText: string;
  isCorrect: boolean;
  speedPoints: number;
  accuracyPoints: number;
  expPoints: number;
  reactionText?: string;
  nextSceneCode?: string;
  scoreWeight: number;
  nextEventId?: number;
  createdBy?: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // 게임에서 사용되는 추가 속성들
  answerId?: string;
  answer?: string;
  reaction?: string;
  nextId?: string;
  points?: {
    speed: number;
    accuracy: number;
  };
}

// 훈련 참가자 타입 (Database 스키마 기준)
export interface TrainingParticipant {
  id: number;
  sessionId: number;
  teamId: number;
  scenarioId: number;
  userId: number;
  participantCode: string;
  joinedAt: string;
  completedAt?: string;
  status: string;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 훈련 결과 타입 (Database 스키마 기준)
export interface TrainingResult {
  id: number;
  participantId: number;
  sessionId: number;
  scenarioId: number;
  userId: number;
  resultCode: string;
  accuracyScore: number;
  speedScore: number;
  totalScore: number;
  completionTime?: number;
  feedback?: string;
  completedAt: string;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 사용자 선택 로그 타입 (Database 스키마 기준)
export interface UserChoiceLog {
  id: number;
  resultId: number;
  eventId: number;
  choiceId: number;
  logCode: string;
  responseTime: number;
  isCorrect: boolean;
  selectedAt: string;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 사용자 진행상황 타입 (Database 스키마 기준)
export interface UserProgress {
  id: number;
  userId: number;
  teamId: number;
  userLevel: number;
  userExp: number;
  totalScore: number;
  completedScenarios: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt?: string;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 성취 타입 (Database 스키마 기준)
export interface Achievement {
  id: number;
  userId: number;
  teamId: number;
  achievementName: string;
  achievementDescription?: string;
  achievementType: string;
  progress: number;
  isCompleted: boolean;
  unlockedAt?: string;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 사용자 시나리오 통계 타입 (Database 스키마 기준)
export interface UserScenarioStats {
  id: number;
  userId: number;
  teamId: number;
  scenarioType: string;
  completedCount: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
  totalTimeSpent: number;
  lastCompletedAt?: string;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 사용자 레벨 히스토리 타입 (Database 스키마 기준)
export interface UserLevelHistory {
  id: number;
  userId: number;
  teamId: number;
  oldLevel: number;
  newLevel: number;
  expGained: number;
  levelUpReason?: string;
  scenarioId?: number;
  completedAt: string;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 문의사항 타입 (Database 스키마 기준)
export interface Inquiry {
  id: number;
  teamId: number;
  userId: number;
  inquiryCode: string;
  category: string;
  title: string;
  content: string;
  status: string;
  adminResponse?: string;
  respondedAt?: string;
  respondedBy?: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// FAQ 타입 (Database 스키마 기준)
export interface Faq {
  id: number;
  teamId: number;
  faqCode: string;
  category: string;
  question: string;
  answer: string;
  orderNum: number;
  useYn: string;
  createdBy: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 코드 타입 (Database 스키마 기준)
export interface Code {
  id: number;
  teamId?: number;
  codeClass: string;
  codeName: string;
  codeValue: string;
  codeDesc?: string;
  codeOrder: number;
  useYn: string;
  createdBy?: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 대시보드 통계 타입
export interface DashboardStats {
  totalUsers: number;
  totalScenarios: number;
  completedSessions: number;
  averageScore: number;
}
