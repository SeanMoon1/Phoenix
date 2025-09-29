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
  ScenarioTypeStatistics,
  UserLevelHistory,
  Inquiry,
  Faq,
  Code,
  Admin,
  AdminLevel,
  CreateAdminData,
  AdminLoginCredentials,
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
    try {
      // 일반 사용자 토큰 확인
      const authStorage = localStorage.getItem('auth-storage');
      let token = null;

      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed?.state?.token;
      }

      // 관리자 토큰 확인 (관리자 토큰이 우선)
      const adminAuthStorage = localStorage.getItem('admin-auth-storage');
      if (adminAuthStorage) {
        const parsed = JSON.parse(adminAuthStorage);
        const adminToken = parsed?.state?.token;
        if (adminToken) {
          token = adminToken;
          console.log(
            '🔑 관리자 토큰 사용:',
            adminToken.substring(0, 20) + '...'
          );
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(
          '🔑 API 요청에 토큰 추가됨:',
          token.substring(0, 20) + '...'
        );
      } else {
        console.warn(
          '⚠️ 토큰이 없습니다. 인증이 필요한 요청이 실패할 수 있습니다.'
        );
      }
    } catch (error) {
      console.error('❌ 토큰 파싱 오류:', error);
    }
    return config;
  },
  error => {
    console.error('❌ 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('✅ API 응답 성공:', {
      url: response.config.url,
      status: response.status,
      method: response.config.method?.toUpperCase(),
    });
    return response;
  },
  error => {
    console.error('❌ API 응답 오류:', {
      url: error.config?.url,
      status: error.response?.status,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      console.warn('🔐 인증 실패');

      // 관리자 권한이 필요한 API인지 확인
      const isAdminApi = error.config?.url?.includes('/admin/');
      const isAuthApi = error.config?.url?.includes('/auth/');

      if (isAdminApi || isAuthApi) {
        console.warn('🔐 관리자/인증 API 인증 실패 - 로그아웃 처리');

        // 관리자 토큰이 있는지 확인
        const adminAuthStorage = localStorage.getItem('admin-auth-storage');
        if (adminAuthStorage) {
          console.warn('🔐 관리자 로그아웃 처리');
          localStorage.removeItem('admin-auth-storage');
        } else {
          console.warn('🔐 일반 사용자 로그아웃 처리');
          localStorage.removeItem('auth-storage');
        }

        window.location.href = '/login';
      } else {
        console.warn('🔐 일반 API 인증 실패 - 로그아웃하지 않음');
        // 일반 API의 경우 로그아웃하지 않고 에러만 반환
      }
    }
    return Promise.reject(error);
  }
);

// API 응답 래퍼 함수
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    console.log('📤 API 요청 시작:', {
      url: config.url,
      method: config.method?.toUpperCase(),
    });

    const response = await apiClient(config);

    console.log('📥 API 응답 수신:', {
      url: config.url,
      success: response.data?.success,
      dataLength: Array.isArray(response.data?.data)
        ? response.data.data.length
        : 'not array',
      error: response.data?.error,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ API 요청 실패:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    return {
      success: false,
      error:
        error.response?.data?.error ||
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
  create: async (teamData: { name: string; description?: string }) => {
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
    console.log('📤 trainingApi.createSession 호출됨:', {
      url: '/training',
      method: 'POST',
      data: sessionData,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await api.post<ApiResponse<TrainingSession>>(
        '/training',
        sessionData
      );
      console.log('✅ trainingApi.createSession 성공:', result);
      return result;
    } catch (error) {
      console.error('❌ trainingApi.createSession 실패:', error);
      throw error;
    }
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
    console.log('📤 trainingResultApi.save 호출됨:', {
      url: '/training-results',
      method: 'POST',
      data: resultData,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await api.post<TrainingResult>(
        '/training-results',
        resultData
      );
      console.log('✅ trainingResultApi.save 성공:', result);
      return result;
    } catch (error) {
      console.error('❌ trainingResultApi.save 실패:', error);
      throw error;
    }
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

  /**
   * 팀별 훈련 결과 조회 (팀 관리자용)
   * @param teamId 팀 ID
   * @returns 팀 훈련 결과 목록
   */
  getByTeam: async (teamId: number) => {
    return api.get<TrainingResult[]>(`/training-results/team/${teamId}`);
  },
};

// 팀 통계 관련 API
export const teamStatsApi = {
  /**
   * 모든 팀 통계 조회 (슈퍼 관리자용)
   * @returns 전체 팀 통계
   */
  getAllTeamStats: async () => {
    return api.get<any[]>('/team-stats/all');
  },

  /**
   * 특정 팀 통계 조회
   * @param teamId 팀 ID
   * @returns 팀 통계
   */
  getTeamStats: async (teamId: number) => {
    return api.get<any>(`/team-stats/${teamId}`);
  },
};

// Gmail 관련 API
export const gmailApi = {
  /**
   * Gmail OAuth 인증 URL 생성
   * @returns 인증 URL
   */
  getAuthUrl: async () => {
    console.log('🔍 gmailApi.getAuthUrl 호출됨');
    const result = await api.get<{ authUrl: string }>('/gmail/auth-url');
    console.log('📥 gmailApi.getAuthUrl 응답:', result);
    return result;
  },

  /**
   * Gmail OAuth 인증
   * @param code 인증 코드
   * @returns 인증 결과
   */
  authenticate: async (code: string) => {
    return api.post<{ success: boolean; message: string }>('/gmail/auth', {
      code,
    });
  },

  /**
   * 이메일 목록 조회
   * @param maxResults 최대 결과 수
   * @param pageToken 페이지 토큰
   * @returns 이메일 목록
   */
  getEmails: async (maxResults?: number, pageToken?: string) => {
    return api.get<{
      messages: Array<{ id: string; threadId: string }>;
      nextPageToken?: string;
      resultSizeEstimate: number;
    }>('/gmail/emails', { params: { maxResults, pageToken } });
  },

  /**
   * 특정 이메일 상세 조회
   * @param messageId 메시지 ID
   * @returns 이메일 상세 정보
   */
  getEmailById: async (messageId: string) => {
    return api.get<any>(`/gmail/emails/${messageId}`);
  },

  /**
   * 스레드 조회
   * @param threadId 스레드 ID
   * @returns 스레드 정보
   */
  getThreadById: async (threadId: string) => {
    return api.get<any>(`/gmail/threads/${threadId}`);
  },

  /**
   * 이메일 답장 전송
   * @param messageId 원본 메시지 ID
   * @param replyContent 답장 내용
   * @param adminName 관리자 이름
   * @returns 전송 결과
   */
  sendReply: async (
    messageId: string,
    replyContent: string,
    adminName?: string
  ) => {
    return api.post<{ success: boolean; message: string }>('/gmail/reply', {
      messageId,
      replyContent,
      adminName,
    });
  },

  /**
   * 이메일 HTML 본문 조회
   * @param messageId 메시지 ID
   * @returns HTML 본문
   */
  getEmailHtml: async (messageId: string) => {
    return api.get<{ html: string }>(`/gmail/emails/${messageId}/html`);
  },

  /**
   * 이메일 텍스트 본문 조회
   * @param messageId 메시지 ID
   * @returns 텍스트 본문
   */
  getEmailText: async (messageId: string) => {
    return api.get<{ text: string }>(`/gmail/emails/${messageId}/text`);
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

// 관리자 관련 API 함수들
export const adminApi = {
  /**
   * 관리자 로그인
   * @param credentials 관리자 로그인 정보
   * @returns 로그인 결과
   */
  login: async (credentials: AdminLoginCredentials) => {
    return api.post<{
      token: string;
      admin: Admin;
    }>('/admin/auth/login', credentials);
  },

  /**
   * 관리자 대시보드 데이터 조회
   * @returns 대시보드 데이터
   */
  getDashboard: async () => {
    return api.get('/admin/dashboard');
  },

  /**
   * 시스템 통계 조회
   * @returns 통계 데이터
   */
  getStats: async () => {
    return api.get('/admin/stats');
  },

  /**
   * 관리자 목록 조회
   * @param teamId 팀 ID (선택사항)
   * @returns 관리자 목록
   */
  getAdmins: async (teamId?: number) => {
    const params = teamId ? `?teamId=${teamId}` : '';
    return api.get<Admin[]>(`/admin/admins${params}`);
  },

  /**
   * 권한 레벨 목록 조회
   * @returns 권한 레벨 목록
   */
  getAdminLevels: async () => {
    console.log('adminApi.getAdminLevels 호출됨');
    try {
      const result = await api.get<AdminLevel[]>('/admin/levels');
      console.log('adminApi.getAdminLevels 응답:', result);
      return result;
    } catch (error) {
      console.error('adminApi.getAdminLevels 에러:', error);
      throw error;
    }
  },

  /**
   * 새 관리자 계정 생성
   * @param adminData 관리자 생성 데이터
   * @returns 생성된 관리자 정보
   */
  createAdmin: async (adminData: CreateAdminData) => {
    return api.post<Admin>('/admin/create', adminData);
  },

  /**
   * 새 팀 생성 (관리자용)
   * @param teamData 팀 생성 데이터
   * @returns 생성된 팀 정보
   */
  createTeam: async (teamData: { name: string; description?: string }) => {
    return api.post<Team>('/admin/teams', teamData);
  },

  /**
   * 모든 팀 조회 (관리자용)
   * @returns 팀 목록
   */
  getTeams: async () => {
    console.log('adminApi.getTeams 호출됨');
    try {
      const result = await api.get<Team[]>('/admin/teams');
      console.log('adminApi.getTeams 응답:', result);
      return result;
    } catch (error) {
      console.error('adminApi.getTeams 에러:', error);
      throw error;
    }
  },

  /**
   * 모든 사용자 조회 (관리자용)
   * @returns 사용자 목록
   */
  getUsers: async () => {
    return api.get<User[]>('/admin/users');
  },

  /**
   * 특정 팀의 사용자 조회 (관리자용)
   * @param teamId 팀 ID
   * @returns 팀 사용자 목록
   */
  getUsersByTeam: async (teamId: number) => {
    return api.get<User[]>(`/admin/users/team/${teamId}`);
  },

  /**
   * 관리자 권한 수정 (개발용)
   * @returns 권한 수정 결과
   */
  fixAdminPermissions: async () => {
    return api.post('/admin/fix-permissions');
  },

  /**
   * 새 훈련 세션 생성
   * @param sessionData 훈련 세션 생성 데이터
   * @returns 생성된 훈련 세션 정보
   */
  createTrainingSession: async (sessionData: {
    name: string;
    description?: string;
    scenarioType: string;
    teamId: number;
  }) => {
    // 시나리오 타입을 시나리오 ID로 변환 (임시로 1 사용)
    const scenarioIdMap: { [key: string]: number } = {
      fire: 1,
      earthquake: 2,
      'first-aid': 3,
      'traffic-accident': 4,
    };

    const trainingSessionData = {
      sessionName: sessionData.name,
      scenarioId: scenarioIdMap[sessionData.scenarioType] || 1,
      teamId: sessionData.teamId,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2시간 후
      status: 'scheduled',
      createdBy: 1, // 관리자 ID (임시)
    };

    return api.post<any>('/training', trainingSessionData);
  },
};

// 마이페이지 관련 API 함수들
export const myPageApi = {
  /**
   * 사용자 훈련 기록 조회
   * @param userId 사용자 ID
   * @returns 훈련 기록 목록
   */
  getTrainingRecords: async (userId: number) => {
    return api.get<TrainingResult[]>(`/training-results/user/${userId}`);
  },

  /**
   * 사용자 훈련 통계 조회
   * @param userId 사용자 ID
   * @returns 훈련 통계
   */
  getTrainingStatistics: async (userId: number) => {
    return api.get<{
      totalTrainings: number;
      totalScore: number;
      averageScore: number;
      bestScore: number;
    }>(`/training-results/statistics/${userId}`);
  },

  /**
   * 사용자 시나리오별 통계 조회
   * @param userId 사용자 ID
   * @returns 시나리오별 통계
   */
  getScenarioStatistics: async (userId: number) => {
    return api.get<UserScenarioStats[]>(
      `/user-progress/${userId}/scenario-stats`
    );
  },

  /**
   * 사용자 시나리오 타입별 통계 조회 (새로운 5가지 항목)
   * @param userId 사용자 ID
   * @returns 시나리오 타입별 통계
   */
  getScenarioTypeStatistics: async (userId: number) => {
    return api.get<ScenarioTypeStatistics[]>(
      `/training-results/scenario-type-statistics/${userId}`
    );
  },

  /**
   * 사용자 정보 조회
   * @param userId 사용자 ID
   * @returns 사용자 정보
   */
  getUserInfo: async (userId: number) => {
    return api.get<User>(`/users/${userId}`);
  },

  /**
   * 사용자 정보 수정
   * @param userId 사용자 ID
   * @param userData 수정할 사용자 데이터
   * @returns 수정 결과
   */
  updateUserInfo: async (userId: number, userData: Partial<User>) => {
    return api.put<User>(`/users/${userId}`, userData);
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

// 문의하기 관련 API
export const contactApi = {
  /**
   * 문의하기 이메일 전송
   * @param contactData 문의 데이터
   * @returns 전송 결과
   */
  sendContact: async (contactData: {
    name: string;
    email: string;
    type: string;
    subject: string;
    message: string;
  }) => {
    return api.post<{
      success: boolean;
      message: string;
    }>('/contact', contactData);
  },
};

// 사용자 경험치 관련 API
export const userExpApi = {
  /**
   * 사용자 경험치 업데이트
   * @param data 경험치 업데이트 데이터
   * @returns 업데이트 결과
   */
  updateUserExp: async (data: {
    userId: number;
    expToAdd: number;
    totalScore?: number;
    completedScenarios?: number;
    currentTier?: string;
  }) => {
    return api.post<{
      success: boolean;
      data?: {
        id: number;
        userLevel: number;
        userExp: number;
        currentTier: string;
        levelProgress: number;
        nextLevelExp: number;
        totalScore: number;
        completedScenarios: number;
      };
      message?: string;
      error?: string;
    }>('/user-exp/update', data);
  },

  /**
   * 사용자 경험치 정보 조회
   * @param userId 사용자 ID
   * @returns 사용자 경험치 정보
   */
  getUserExpInfo: async (userId: number) => {
    return api.get<{
      success: boolean;
      data?: {
        userLevel: number;
        userExp: number;
        currentTier: string;
        levelProgress: number;
        nextLevelExp: number;
        totalScore: number;
        completedScenarios: number;
      };
      message?: string;
      error?: string;
    }>(`/user-exp/${userId}/info`);
  },

  /**
   * 팀 훈련 결과 파일 다운로드 (엑셀/PDF)
   * @param teamId 팀 ID
   * @param format 파일 형식 ('excel' | 'pdf')
   * @returns 파일 Blob
   */
  downloadTeamTrainingResults: async (
    teamId: number,
    format: 'excel' | 'pdf' = 'excel'
  ) => {
    const response = await apiClient.get(
      `/excel-export/team/${teamId}/training-results`,
      {
        responseType: 'blob',
        params: { format },
      }
    );
    return response.data;
  },

  /**
   * 사용자 팀 가입
   * @param userId 사용자 ID
   * @param teamCode 팀 코드
   * @returns 팀 가입 결과
   */
  joinTeam: async (userId: number, teamCode: string) => {
    const response = await api.post(`/users/${userId}/join-team`, { teamCode });
    console.log('🔍 팀 가입 API 원본 응답:', response);
    console.log('🔍 팀 가입 API 응답 데이터:', response.data);
    console.log('🔍 팀 가입 API 응답 전체 구조:', {
      success: response.success,
      data: response.data,
      message: response.message,
      error: response.error,
    });
    return response; // 전체 응답 객체 반환
  },
};
