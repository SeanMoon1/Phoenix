import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import type { ApiResponse } from '../types';

// API 기본 설정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Axios 인스턴스 생성
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage')!).state.token
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      // 인증 실패 시 로그아웃 처리
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API 응답 래퍼 함수
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error: unknown) {
    return {
      success: false,
      error:
        (error as any).response?.data?.message ||
        (error as Error).message ||
        '알 수 없는 오류가 발생했습니다.',
    };
  }
};

// HTTP 메서드별 헬퍼 함수들
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
};

// 팀 관련 API 함수들
export const teamApi = {
  /**
   * 팀 코드 유효성 검증 (AWS 호스팅 환경 최적화)
   * @param teamCode 검증할 팀 코드
   * @returns 팀 코드 검증 결과
   */
  validateTeamCode: async (teamCode: string) => {
    return api.get<{
      valid: boolean;
      team?: {
        id: number;
        name: string;
        description?: string;
        teamCode: string;
      };
      message?: string;
    }>(`/teams/validate-code/${teamCode}`);
  },
};

// 훈련 관련 API
export const trainingApi = {
  // 훈련 세션 생성
  createSession: (data: {
    title: string;
    scenarioId: number;
    teamId: number;
    startTime: string;
    endTime?: string;
    createdBy: number;
  }) => api.post('/training', data),

  // 팀별 훈련 세션 조회
  getSessionsByTeam: (teamId: number) => api.get(`/training?teamId=${teamId}`),

  // 세션 참가
  joinSession: (sessionCode: string, userId: number) =>
    api.post(`/training/join/${sessionCode}`, { userId }),

  // 세션 참가자 목록 조회
  getSessionParticipants: (sessionId: number) =>
    api.get(`/training/${sessionId}/participants`),

  // 팀별 통계 조회 (관리자용)
  getTeamStats: (teamId: number) => api.get(`/training/stats/team/${teamId}`),
};
