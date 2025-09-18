import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import type {
  ApiResponse,
  User,
  Team,
  Scenario,
  TrainingSession,
  TrainingResult,
  UserChoiceLog,
  UserProgress,
  Achievement,
  UserScenarioStats,
  UserLevelHistory,
  Inquiry,
  Faq,
  Code,
} from '../types';

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
    console.log('📤 Frontend: API 요청', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
    });

    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage')!).state.token
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('❌ Frontend: 요청 인터셉터 에러', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('📥 Frontend: API 응답 성공', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  error => {
    console.error('❌ Frontend: API 응답 에러', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

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

// 팀 관련 API 함수들 (Database 스키마 기준)
export const teamApi = {
  /**
   * 모든 팀 조회
   * @returns 팀 목록
   */
  getAll: async () => {
    return api.get<Team[]>('/teams');
  },

  /**
   * 특정 팀 조회
   * @param id 팀 ID
   * @returns 팀 정보
   */
  getById: async (id: number) => {
    return api.get<Team>(`/teams/${id}`);
  },

  /**
   * 팀 코드 유효성 검증
   * @param teamCode 검증할 팀 코드
   * @returns 팀 코드 검증 결과
   */
  validateTeamCode: async (teamCode: string) => {
    return api.get<{
      valid: boolean;
      team?: Team;
      message?: string;
    }>(`/teams/validate-code/${teamCode}`);
  },

  /**
   * 새 팀 생성
   * @param teamData 팀 생성 데이터
   * @returns 팀 생성 결과
   */
  create: async (teamData: { teamName: string; description?: string }) => {
    return api.post<Team>('/teams', teamData);
  },

  /**
   * 팀 정보 수정
   * @param id 팀 ID
   * @param teamData 수정할 팀 데이터
   * @returns 수정 결과
   */
  update: async (id: number, teamData: Partial<Team>) => {
    return api.put<Team>(`/teams/${id}`, teamData);
  },

  /**
   * 팀 삭제
   * @param id 팀 ID
   * @returns 삭제 결과
   */
  delete: async (id: number) => {
    return api.delete(`/teams/${id}`);
  },
};

// 시나리오 관련 API 함수들 (Database 스키마 기준)
export const scenarioApi = {
  /**
   * 모든 시나리오 조회
   * @returns 시나리오 목록
   */
  getAll: async () => {
    return api.get<Scenario[]>('/scenarios');
  },

  /**
   * 특정 시나리오 조회
   * @param id 시나리오 ID
   * @returns 시나리오 정보
   */
  getById: async (id: number) => {
    return api.get<Scenario>(`/scenarios/${id}`);
  },

  /**
   * 재난 유형별 시나리오 조회
   * @param disasterType 재난 유형
   * @returns 시나리오 목록
   */
  getByType: async (disasterType: string) => {
    return api.get<Scenario[]>(`/scenarios/type/${disasterType}`);
  },

  /**
   * 새 시나리오 생성
   * @param scenarioData 시나리오 생성 데이터
   * @returns 시나리오 생성 결과
   */
  create: async (scenarioData: Partial<Scenario>) => {
    return api.post<Scenario>('/scenarios', scenarioData);
  },

  /**
   * 시나리오 정보 수정
   * @param id 시나리오 ID
   * @param scenarioData 수정할 시나리오 데이터
   * @returns 수정 결과
   */
  update: async (id: number, scenarioData: Partial<Scenario>) => {
    return api.put<Scenario>(`/scenarios/${id}`, scenarioData);
  },

  /**
   * 시나리오 삭제
   * @param id 시나리오 ID
   * @returns 삭제 결과
   */
  delete: async (id: number) => {
    return api.delete(`/scenarios/${id}`);
  },

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

// 훈련 관련 API 함수들 (Database 스키마 기준)
export const trainingApi = {
  /**
   * 모든 훈련 세션 조회
   * @returns 훈련 세션 목록
   */
  getAllSessions: async () => {
    return api.get<TrainingSession[]>('/training');
  },

  /**
   * 특정 훈련 세션 조회
   * @param id 세션 ID
   * @returns 훈련 세션 정보
   */
  getSessionById: async (id: number) => {
    return api.get<TrainingSession>(`/training/${id}`);
  },

  /**
   * 새 훈련 세션 생성
   * @param sessionData 훈련 세션 생성 데이터
   * @returns 훈련 세션 생성 결과
   */
  createSession: async (sessionData: Partial<TrainingSession>) => {
    return api.post<TrainingSession>('/training', sessionData);
  },

  /**
   * 훈련 세션 정보 수정
   * @param id 세션 ID
   * @param sessionData 수정할 세션 데이터
   * @returns 수정 결과
   */
  updateSession: async (id: number, sessionData: Partial<TrainingSession>) => {
    return api.put<TrainingSession>(`/training/${id}`, sessionData);
  },

  /**
   * 훈련 세션 삭제
   * @param id 세션 ID
   * @returns 삭제 결과
   */
  deleteSession: async (id: number) => {
    return api.delete(`/training/${id}`);
  },

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

// 훈련 결과 관련 API 함수들 (Database 스키마 기준)
export const trainingResultApi = {
  /**
   * 모든 훈련 결과 조회
   * @returns 훈련 결과 목록
   */
  getAll: async () => {
    return api.get<TrainingResult[]>('/training-results');
  },

  /**
   * 특정 훈련 결과 조회
   * @param id 결과 ID
   * @returns 훈련 결과 정보
   */
  getById: async (id: number) => {
    return api.get<TrainingResult>(`/training-results/${id}`);
  },

  /**
   * 사용자별 훈련 결과 조회
   * @param userId 사용자 ID
   * @returns 사용자 훈련 결과 목록
   */
  getByUser: async (userId: number) => {
    return api.get<TrainingResult[]>(`/training-results/user/${userId}`);
  },

  /**
   * 세션별 훈련 결과 조회
   * @param sessionId 세션 ID
   * @returns 세션 훈련 결과 목록
   */
  getBySession: async (sessionId: number) => {
    return api.get<TrainingResult[]>(`/training-results/session/${sessionId}`);
  },

  /**
   * 사용자 훈련 통계 조회
   * @param userId 사용자 ID
   * @returns 사용자 통계 데이터
   */
  getUserStatistics: async (userId: number) => {
    return api.get<{
      totalTrainings: number;
      totalScore: number;
      averageScore: number;
      bestScore: number;
    }>(`/training-results/statistics/${userId}`);
  },

  /**
   * 훈련 결과 저장
   * @param resultData 훈련 결과 데이터
   * @returns 저장 결과
   */
  save: async (resultData: Partial<TrainingResult>) => {
    return api.post<TrainingResult>('/training-results', resultData);
  },

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
        lastTrainingAt?: string;
      }>;
    }>(`/training-results/team-member-stats/${teamId}`);
  },

  /**
   * 사용자 선택 로그 조회
   * @param resultId 결과 ID
   * @returns 선택 로그 목록
   */
  getChoiceLogs: async (resultId: number) => {
    return api.get<UserChoiceLog[]>(
      `/training-results/choice-logs/${resultId}`
    );
  },

  /**
   * 사용자 선택 로그 저장
   * @param logData 선택 로그 데이터
   * @returns 저장 결과
   */
  saveChoiceLog: async (logData: Partial<UserChoiceLog>) => {
    return api.post<UserChoiceLog>('/training-results/choice-logs', logData);
  },
};

// 사용자 관련 API 함수들 (Database 스키마 기준)
export const userApi = {
  /**
   * 모든 사용자 조회
   * @returns 사용자 목록
   */
  getAll: async () => {
    return api.get<User[]>('/users');
  },

  /**
   * 특정 사용자 조회
   * @param id 사용자 ID
   * @returns 사용자 정보
   */
  getById: async (id: number) => {
    return api.get<User>(`/users/${id}`);
  },

  /**
   * 새 사용자 생성
   * @param userData 사용자 생성 데이터
   * @returns 사용자 생성 결과
   */
  create: async (userData: Partial<User>) => {
    return api.post<User>('/users', userData);
  },

  /**
   * 사용자 정보 수정
   * @param id 사용자 ID
   * @param userData 수정할 사용자 데이터
   * @returns 수정 결과
   */
  update: async (id: number, userData: Partial<User>) => {
    return api.put<User>(`/users/${id}`, userData);
  },

  /**
   * 사용자 삭제
   * @param id 사용자 ID
   * @returns 삭제 결과
   */
  delete: async (id: number) => {
    return api.delete(`/users/${id}`);
  },

  /**
   * 사용자 진행상황 조회
   * @param userId 사용자 ID
   * @returns 사용자 진행상황
   */
  getProgress: async (userId: number) => {
    return api.get<UserProgress>(`/user-progress/${userId}`);
  },

  /**
   * 경험치 추가
   * @param userId 사용자 ID
   * @param expData 경험치 데이터
   * @returns 추가 결과
   */
  addExperience: async (
    userId: number,
    expData: {
      expGained: number;
      reason: string;
      scenarioId?: number;
    }
  ) => {
    return api.post(`/user-progress/${userId}/experience`, expData);
  },

  /**
   * 사용자 성취 목록 조회
   * @param userId 사용자 ID
   * @returns 성취 목록
   */
  getAchievements: async (userId: number) => {
    return api.get<Achievement[]>(`/user-progress/${userId}/achievements`);
  },

  /**
   * 사용자 시나리오별 통계 조회
   * @param userId 사용자 ID
   * @returns 시나리오별 통계
   */
  getScenarioStats: async (userId: number) => {
    return api.get<UserScenarioStats[]>(
      `/user-progress/${userId}/scenario-stats`
    );
  },

  /**
   * 레벨업 히스토리 조회
   * @param userId 사용자 ID
   * @returns 레벨업 히스토리
   */
  getLevelHistory: async (userId: number) => {
    return api.get<UserLevelHistory[]>(
      `/user-progress/${userId}/level-history`
    );
  },
};

// 인증 관련 API 함수들 (Database 스키마 기준)
export const authApi = {
  /**
   * 로그인
   * @param credentials 로그인 정보
   * @returns 로그인 결과
   */
  login: async (credentials: { loginId: string; password: string }) => {
    return api.post<{
      access_token: string;
      user: User;
    }>('/auth/login', credentials);
  },

  /**
   * 회원가입
   * @param userData 회원가입 데이터
   * @returns 회원가입 결과
   */
  register: async (userData: {
    teamId: number;
    userCode: string;
    loginId: string;
    name: string;
    email: string;
    password: string;
  }) => {
    return api.post<{
      access_token: string;
      user: User;
    }>('/auth/register', userData);
  },

  /**
   * OAuth 회원가입 및 로그인
   * @param oauthData OAuth 데이터
   * @returns OAuth 결과
   */
  oauthRegister: async (oauthData: {
    provider: string;
    providerId: string;
    email: string;
    name: string;
    profileImageUrl?: string;
  }) => {
    return api.post<{
      access_token: string;
      user: User;
    }>('/auth/oauth/register', oauthData);
  },

  /**
   * 프로필 조회
   * @returns 사용자 프로필
   */
  getProfile: async () => {
    return api.get<User>('/auth/profile');
  },

  /**
   * 로그인 ID 중복 확인
   * @param loginId 로그인 ID
   * @returns 중복 확인 결과
   */
  checkLoginId: async (loginId: string) => {
    return api.get<{
      available: boolean;
      message?: string;
    }>(`/auth/check-login-id/${loginId}`);
  },
};

// 지원 관련 API 함수들 (Database 스키마 기준)
export const supportApi = {
  /**
   * 문의사항 생성
   * @param inquiryData 문의사항 데이터
   * @returns 생성 결과
   */
  createInquiry: async (inquiryData: {
    teamId: number;
    userId: number;
    category: string;
    title: string;
    content: string;
  }) => {
    return api.post<Inquiry>('/support/inquiries', inquiryData);
  },

  /**
   * 사용자별 문의사항 조회
   * @param userId 사용자 ID
   * @returns 문의사항 목록
   */
  getInquiriesByUser: async (userId: number) => {
    return api.get<Inquiry[]>(`/support/inquiries/user/${userId}`);
  },

  /**
   * 팀별 문의사항 조회
   * @param teamId 팀 ID
   * @returns 문의사항 목록
   */
  getInquiriesByTeam: async (teamId: number) => {
    return api.get<Inquiry[]>(`/support/inquiries/team/${teamId}`);
  },

  /**
   * 문의사항 상태 업데이트
   * @param inquiryId 문의사항 ID
   * @param statusData 상태 데이터
   * @returns 업데이트 결과
   */
  updateInquiryStatus: async (
    inquiryId: number,
    statusData: {
      status: string;
      adminResponse?: string;
    }
  ) => {
    return api.put(`/support/inquiries/${inquiryId}/status`, statusData);
  },

  /**
   * 팀별 FAQ 조회
   * @param teamId 팀 ID
   * @returns FAQ 목록
   */
  getFaqsByTeam: async (teamId: number) => {
    return api.get<Faq[]>(`/support/faqs/team/${teamId}`);
  },

  /**
   * FAQ 생성
   * @param faqData FAQ 데이터
   * @returns 생성 결과
   */
  createFaq: async (faqData: {
    teamId: number;
    category: string;
    question: string;
    answer: string;
    orderNum: number;
  }) => {
    return api.post<Faq>('/support/faqs', faqData);
  },
};

// 코드 관련 API 함수들 (Database 스키마 기준)
export const codeApi = {
  /**
   * 시스템 공통 코드 조회
   * @returns 공통 코드 목록
   */
  getSystemCodes: async () => {
    return api.get<Code[]>('/codes/system');
  },

  /**
   * 팀별 코드 조회
   * @param teamId 팀 ID
   * @returns 팀별 코드 목록
   */
  getTeamCodes: async (teamId: number) => {
    return api.get<Code[]>(`/codes/team/${teamId}`);
  },

  /**
   * 재난 유형 코드 조회
   * @returns 재난 유형 코드 목록
   */
  getDisasterTypes: async () => {
    return api.get<Code[]>('/codes/disaster-types');
  },

  /**
   * 위험도 코드 조회
   * @returns 위험도 코드 목록
   */
  getRiskLevels: async () => {
    return api.get<Code[]>('/codes/risk-levels');
  },

  /**
   * 이벤트 유형 코드 조회
   * @returns 이벤트 유형 코드 목록
   */
  getEventTypes: async () => {
    return api.get<Code[]>('/codes/event-types');
  },

  /**
   * 문의 카테고리 코드 조회
   * @returns 문의 카테고리 코드 목록
   */
  getInquiryCategories: async () => {
    return api.get<Code[]>('/codes/inquiry-categories');
  },

  /**
   * FAQ 카테고리 코드 조회
   * @returns FAQ 카테고리 코드 목록
   */
  getFaqCategories: async () => {
    return api.get<Code[]>('/codes/faq-categories');
  },
};
