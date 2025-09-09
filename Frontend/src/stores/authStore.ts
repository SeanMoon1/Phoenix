import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, LoginCredentials } from '../types';
import { api } from '../services/api';

interface RegisterCredentials {
  teamCode: string;
  userCode: string;
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
        set({ isLoading: true });
        try {
          // 실제 API 호출
          const response = await api.post<{
            access_token: string;
            user: {
              id: number;
              teamId?: number;
              userCode?: string;
              loginId?: string;
              email: string;
              name: string;
              useYn?: string;
              userLevel: number;
              userExp?: number;
              totalScore?: number;
              completedScenarios?: number;
              currentTier: string;
              levelProgress?: number;
              nextLevelExp?: number;
              isActive?: boolean;
            };
          }>('/auth/login', credentials);

          if (response.success && response.data) {
            const user: User = {
              id: parseInt(response.data.user.id.toString()),
              teamId: response.data.user.teamId || 0,
              userCode: response.data.user.userCode || '',
              loginId: response.data.user.loginId || response.data.user.email,
              email: response.data.user.email,
              name: response.data.user.name,
              useYn: response.data.user.useYn || 'Y',
              userLevel: response.data.user.userLevel,
              userExp: response.data.user.userExp || 0,
              totalScore: response.data.user.totalScore || 0,
              completedScenarios: response.data.user.completedScenarios || 0,
              currentTier: response.data.user.currentTier,
              levelProgress: response.data.user.levelProgress || 0,
              nextLevelExp: response.data.user.nextLevelExp || 0,
              isActive: response.data.user.isActive ?? true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
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
        } catch (error: unknown) {
          set({ isLoading: false });
          throw new Error((error as Error).message || '로그인에 실패했습니다.');
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
        } catch (error: unknown) {
          set({ isLoading: false });
          throw new Error(
            (error as Error).message || '회원가입에 실패했습니다.'
          );
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
