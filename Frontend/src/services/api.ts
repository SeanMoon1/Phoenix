import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import type { ApiResponse } from '../types';

// API 기본 설정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        '알 수 없는 오류가 발생했습니다.',
    };
  }
};

// HTTP 메서드별 헬퍼 함수들
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
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

  /**
   * 새 팀 생성
   * @param teamData 팀 생성 데이터
   * @returns 팀 생성 결과
   */
  createTeam: async (teamData: { teamName: string; description?: string }) => {
    return api.post<{
      id: number;
      name: string;
      description?: string;
      teamCode: string;
    }>('/teams', teamData);
  },
};

// 시나리오 관련 API 함수들
export const scenarioApi = {
  /**
   * 파일에서 시나리오 임포트
   * @param file 업로드할 JSON 파일
   * @returns 임포트 결과
   */
  importFromFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<{
      success: boolean;
      message: string;
    }>('/scenarios/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * JSON 데이터에서 시나리오 동기화
   * @param jsonData 시나리오 JSON 데이터
   * @returns 동기화 결과
   */
  syncFromJson: async (jsonData: any) => {
    return api.post<{
      success: boolean;
      message: string;
    }>('/scenarios/sync', jsonData);
  },
};

// 훈련 관련 API 함수들
export const trainingApi = {
  /**
   * 팀 통계 조회
   * @param teamId 팀 ID
   * @returns 팀 통계 데이터
   */
  getTeamStats: async (teamId: number) => {
    return api.get<{
      totalSessions: number;
      activeSessions: number;
      totalParticipants: number;
      completedParticipants: number;
    }>(`/training/team-stats/${teamId}`);
  },
};

// 훈련 결과 관련 API 함수들
export const trainingResultApi = {
  /**
   * 팀원별 통계 조회
   * @param teamId 팀 ID
   * @returns 팀원별 통계 데이터
   */
  getTeamMemberStats: async (teamId: number) => {
    return api.get<{
      memberStats: Array<{
        userId: number;
        userName: string;
        userCode: string;
        totalTrainings: number;
        totalScore: number;
        averageScore: number;
        bestScore: number;
        currentLevel: number;
        currentTier: string;
        lastTrainingAt?: Date;
      }>;
    }>(`/training-results/team-member-stats/${teamId}`);
  },

  /**
   * 훈련 결과 저장
   * @param resultData 훈련 결과 데이터
   * @returns 저장 결과
   */
  saveResult: async (resultData: any) => {
    return api.post<{
      success: boolean;
      message: string;
    }>('/training-results', resultData);
  },
};
