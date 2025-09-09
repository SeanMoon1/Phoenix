// 기본 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 사용자 타입
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
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 인증 관련 타입
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 팀 타입
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

// 시나리오 타입
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
}

// 훈련 세션 타입
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
}

// 대시보드 통계 타입
export interface DashboardStats {
  totalUsers: number;
  totalScenarios: number;
  completedSessions: number;
  averageScore: number;
}
