import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, LoginCredentials } from '../types';
import { api } from '../services/api';

interface RegisterCredentials {
  loginId: string;
  name: string;
  email: string;
  password: string;
}

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setAuth: (authData: {
    token: string;
    user: User;
    isAuthenticated: boolean;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        console.log('🚀 Frontend: 로그인 시작', {
          loginId: credentials.loginId,
          hasPassword: !!credentials.password,
        });
        set({ isLoading: true });
        try {
          // 실제 API 호출
          console.log('📡 Frontend: API 요청 전송', '/auth/login');
          const response = await api.post<{
            access_token: string;
            user: {
              id: number;
              email: string;
              name: string;
              userLevel: number;
              currentTier: string;
              isAdmin?: boolean;
              adminLevel?: string;
            };
          }>('/auth/login', credentials);

          console.log('📡 Frontend: API 응답 받음', response);

          if (response.success && response.data) {
            const user: User = {
              id: response.data.user.id,
              teamId: 0,
              userCode: '',
              loginId: '',
              email: response.data.user.email,
              //role: response.data.user.role || 'user', // ✅ Backend에서 제공하는 role 사용
              name: response.data.user.name,
              useYn: 'Y',
              userLevel: response.data.user.userLevel,
              userExp: 0,
              totalScore: 0,
              completedScenarios: 0,
              currentTier: response.data.user.currentTier,
              levelProgress: 0,
              nextLevelExp: 0,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              // 관리자 정보 추가
              isAdmin: response.data.user.isAdmin || false,
              adminLevel: response.data.user.adminLevel || 'USER',
            };

            set({
              user,
              token: response.data.access_token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || '로그인에 실패했습니다.');
          }
        } catch (error: any) {
          console.error('❌ Frontend: 로그인 에러', error);
          console.error('❌ Frontend: 에러 상세', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            stack: error.stack,
          });
          set({ isLoading: false });
          throw new Error(error.message || '로그인에 실패했습니다.');
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true });
        try {
          // 실제 API 호출
          const response = await api.post<{
            id: number;
            email: string;
            name: string;
            userCode: string;
            loginId: string;
            team: {
              id: number;
              name: string;
              teamCode: string;
            };
          }>('/auth/register', credentials);

          if (response.success && response.data) {
            // 회원가입 성공 - 로그인 페이지로 리다이렉트
            set({ isLoading: false });
          } else {
            throw new Error(response.error || '회원가입에 실패했습니다.');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message || '회원가입에 실패했습니다.');
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      setAuth: (authData: {
        token: string;
        user: User;
        isAuthenticated: boolean;
      }) => {
        set({
          token: authData.token,
          user: authData.user,
          isAuthenticated: authData.isAuthenticated,
          isLoading: false,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
