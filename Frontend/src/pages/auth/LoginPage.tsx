import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button, Input } from '../../components/ui';
import Layout from '../../components/layout/Layout';

const loginSchema = yup.object({
  email: yup
    .string()
    .email('올바른 이메일을 입력해주세요.')
    .required('이메일을 입력해주세요.'),
  password: yup
    .string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다.')
    .required('비밀번호를 입력해주세요.'),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [isAdminMode, setIsAdminMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || '로그인에 실패했습니다.',
      });
    }
  };

  const handleModeToggle = () => {
    setIsAdminMode(!isAdminMode);
    reset();
  };

  const handleGoogleLogin = () => {
    // Google OAuth 로그인 시작
    window.location.href = `${
      import.meta.env.VITE_API_URL || 'http://localhost:3000'
    }/auth/google`;
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-3 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              {isAdminMode ? '관리자 로그인' : '로그인'}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {isAdminMode
                ? '재난훈련ON 관리자 계정으로 로그인하세요'
                : '재난훈련ON 계정으로 로그인하세요'}
            </p>
          </div>

          {/* 모드 전환 버튼 */}
          <div className="text-center mb-4 sm:mb-6">
            <button
              type="button"
              onClick={handleModeToggle}
              className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {isAdminMode ? '👤 일반 사용자로 전환' : '⚙️ 관리자로 전환'}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm dark:shadow-lg p-4 sm:p-6 md:p-8">
            <form
              className="space-y-4 sm:space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-3 sm:space-y-4">
                <Input
                  label="이메일"
                  type="email"
                  placeholder={
                    isAdminMode ? 'admin@example.com' : 'your@email.com'
                  }
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="비밀번호"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              {errors.root && (
                <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm text-center">
                  {errors.root.message}
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {isAdminMode ? '관리자 로그인' : '로그인'}
              </Button>

              {/* Google OAuth 로그인 버튼 (일반 사용자 모드에서만 표시) */}
              {!isAdminMode && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        또는
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Google로 로그인</span>
                  </Button>
                </>
              )}

              {/* 개발용 임시 접속 버튼 (관리자 모드에서만 표시) */}
              {isAdminMode && (
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        개발용
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/admin"
                      className="w-full flex items-center justify-center px-4 py-3 border border-dashed border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      <span className="mr-2">🚀</span>
                      개발용 관리자 대시보드 임시접속
                    </Link>
                  </div>
                </div>
              )}

              {!isAdminMode && (
                <div className="text-center">
                  <Link
                    to="/register"
                    className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300"
                  >
                    계정이 없으신가요? 회원가입
                  </Link>
                </div>
              )}

              {isAdminMode && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    관리자 계정이 필요하시면 시스템 관리자에게 문의하세요
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
