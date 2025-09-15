import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button, Input } from '../../components/ui';
import Layout from '../../components/layout/Layout';

const loginSchema = yup.object({
  loginId: yup
    .string()
    .min(3, '아이디는 최소 3자 이상이어야 합니다.')
    .required('아이디를 입력해주세요.'),
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
      navigate('/');
    } catch (error: unknown) {
      setError('root', {
        type: 'manual',
        message: (error as Error).message || '로그인에 실패했습니다.',
      });
    }
  };

  const handleModeToggle = () => {
    setIsAdminMode(!isAdminMode);
    reset();
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-3 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl md:text-3xl dark:text-white">
              {isAdminMode ? '관리자 로그인' : '로그인'}
            </h2>
            <p className="mt-2 text-xs text-gray-600 sm:text-sm dark:text-gray-300">
              {isAdminMode
                ? '재난훈련ON 관리자 계정으로 로그인하세요'
                : '재난훈련ON 계정으로 로그인하세요'}
            </p>
          </div>

          {/* 모드 전환 버튼 */}
          <div className="mb-4 text-center sm:mb-6">
            <button
              type="button"
              onClick={handleModeToggle}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-600 transition-colors bg-gray-100 rounded-lg sm:text-sm dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {isAdminMode ? '👤 일반 사용자로 전환' : '⚙️ 관리자로 전환'}
            </button>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-600 rounded-xl dark:shadow-lg sm:p-6 md:p-8">
            <form
              className="space-y-4 sm:space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-3 sm:space-y-4">
                <Input
                  label="아이디"
                  type="text"
                  placeholder={isAdminMode ? 'admin' : 'your_id'}
                  error={errors.loginId?.message}
                  {...register('loginId')}
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
                <div className="text-xs text-center text-red-600 dark:text-red-400 sm:text-sm">
                  {errors.root.message}
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {isAdminMode ? '관리자 로그인' : '로그인'}
              </Button>


              {!isAdminMode && (
                <div className="text-center">
                  <Link
                    to="/register"
                    className="text-xs text-orange-600 sm:text-sm dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300"
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
