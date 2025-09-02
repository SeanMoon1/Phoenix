// 기본 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 사용자 타입
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'trainer';
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

// 훈련 시나리오 타입
export interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // minutes
  createdAt: string;
  updatedAt: string;
}

// 훈련 세션 타입
export interface TrainingSession {
  id: string;
  scenarioId: string;
  userId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  score?: number;
  startedAt: string;
  completedAt?: string;
}

// 대시보드 통계 타입
export interface DashboardStats {
  totalUsers: number;
  totalScenarios: number;
  completedSessions: number;
  averageScore: number;
}
