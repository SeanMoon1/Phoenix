import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button, Input } from '../../components/ui';
import Layout from '../../components/layout/Layout';

const loginSchema = yup.object({
  email: yup.string().email('올바른 이메일을 입력해주세요.').required('이메일을 입력해주세요.'),
  password: yup.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.').required('비밀번호를 입력해주세요.'),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
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

  return (
    <Layout>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              로그인
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Phoenix 계정으로 로그인하세요
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <Input
                  label="이메일"
                  type="email"
                  placeholder="your@email.com"
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
                <div className="text-red-600 text-sm text-center">
                  {errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                로그인
              </Button>

              <div className="text-center">
                <Link
                  to="/register"
                  className="text-sm text-orange-600 hover:text-orange-500"
                >
                  계정이 없으신가요? 회원가입
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
