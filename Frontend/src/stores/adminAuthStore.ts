import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin, AdminLoginCredentials } from '../types';
import { adminApi } from '../services/api';

interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AdminAuthStore extends AdminAuthState {
  login: (credentials: AdminLoginCredentials) => Promise<void>;
  logout: () => void;
  setAdmin: (admin: Admin) => void;
  setToken: (token: string) => void;
  setAuth: (authData: {
    token: string;
    admin: Admin;
    isAuthenticated: boolean;
  }) => void;
  clearAuth: () => void;
}

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    set => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: AdminLoginCredentials) => {
        set({ isLoading: true });
        try {
          console.log('🔍 관리자 로그인 시도:', credentials.loginId);
          const response = await adminApi.login(credentials);
          console.log('📡 API 응답:', response);

          if (response.success && response.data) {
            set({
              admin: response.data.admin,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
            });
            console.log('✅ 관리자 로그인 성공');
          } else {
            console.error('❌ 관리자 로그인 실패:', response.error);
            throw new Error(response.error || '관리자 로그인에 실패했습니다.');
          }
        } catch (error: any) {
          console.error('❌ 관리자 로그인 오류:', error);
          set({ isLoading: false });
          throw new Error(error.message || '관리자 로그인에 실패했습니다.');
        }
      },

      logout: () => {
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setAdmin: (admin: Admin) => {
        set({ admin });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      setAuth: (authData: {
        token: string;
        admin: Admin;
        isAuthenticated: boolean;
      }) => {
        set({
          token: authData.token,
          admin: authData.admin,
          isAuthenticated: authData.isAuthenticated,
          isLoading: false,
        });
      },

      clearAuth: () => {
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: state => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
