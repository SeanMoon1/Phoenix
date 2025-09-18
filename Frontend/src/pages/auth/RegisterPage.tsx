import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button, Input } from '../../components/ui';
import Layout from '../../components/layout/Layout';
import { authApi } from '../../services/api';

// 회원가입 스키마 (팀 코드와 사용자 코드 제거)
const registerSchema = yup.object({
  loginId: yup
    .string()
    .required('로그인 ID를 입력해주세요.')
    .min(3, '로그인 ID는 최소 3자 이상이어야 합니다.')
    .max(20, '로그인 ID는 최대 20자까지 입력 가능합니다.'),
  name: yup
    .string()
    .required('이름을 입력해주세요.')
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(50, '이름은 최대 50자까지 입력 가능합니다.'),
  email: yup
    .string()
    .email('올바른 이메일을 입력해주세요.')
    .required('이메일을 입력해주세요.'),
  password: yup
    .string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다.')
    .required('비밀번호를 입력해주세요.'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다.')
    .required('비밀번호 확인을 입력해주세요.'),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [loginIdStatus, setLoginIdStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const watchedLoginId = watch('loginId');

  // 실시간 ID 중복검증
  useEffect(() => {
    const checkLoginId = async () => {
      if (!watchedLoginId || watchedLoginId.length < 3) {
        setLoginIdStatus({
          checking: false,
          available: null,
          message: '',
        });
        return;
      }

      setLoginIdStatus(prev => ({ ...prev, checking: true }));

      try {
        const response = await authApi.checkLoginId(watchedLoginId);
        if (response.success && response.data) {
          setLoginIdStatus({
            checking: false,
            available: response.data.available,
            message: response.data.message || '',
          });
        } else {
          setLoginIdStatus({
            checking: false,
            available: false,
            message: 'ID 확인 중 오류가 발생했습니다.',
          });
        }
      } catch (error) {
        setLoginIdStatus({
          checking: false,
          available: false,
          message: 'ID 확인 중 오류가 발생했습니다.',
        });
      }
    };

    const timeoutId = setTimeout(checkLoginId, 500); // 500ms 디바운스
    return () => clearTimeout(timeoutId);
  }, [watchedLoginId]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        loginId: data.loginId,
        name: data.name,
        email: data.email,
        password: data.password,
      });
      navigate('/login', {
        state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' },
      });
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || '회원가입에 실패했습니다.',
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-3 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl md:text-3xl dark:text-white">
              회원가입
            </h2>
            <p className="mt-2 text-xs text-gray-600 sm:text-sm dark:text-gray-300">
              재난훈련ON에 가입하여 안전한 미래를 만들어가세요
            </p>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-600 rounded-xl dark:shadow-lg sm:p-6 md:p-8">
            <form
              className="space-y-4 sm:space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* 사용자 정보 입력 */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Input
                    label="로그인 ID"
                    placeholder="user123"
                    error={errors.loginId?.message}
                    {...register('loginId')}
                  />
                  {watchedLoginId && watchedLoginId.length >= 3 && (
                    <div className="mt-2 text-xs">
                      {loginIdStatus.checking ? (
                        <span className="text-blue-500 dark:text-blue-400">
                          🔍 ID 확인 중...
                        </span>
                      ) : loginIdStatus.available === true ? (
                        <span className="text-green-500 dark:text-green-400">
                          ✅ {loginIdStatus.message}
                        </span>
                      ) : loginIdStatus.available === false ? (
                        <span className="text-red-500 dark:text-red-400">
                          ❌ {loginIdStatus.message}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                <Input
                  label="이름"
                  placeholder="홍길동"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label="이메일"
                  type="email"
                  placeholder="user@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <div>
                  <Input
                    label="비밀번호"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <p className="mb-1">비밀번호 요구사항:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>최소 6자 이상</li>
                      <li>소문자 포함 (필수)</li>
                      <li>숫자 포함 (필수)</li>
                    </ul>
                  </div>
                </div>

                <Input
                  label="비밀번호 확인"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              {errors.root && (
                <div className="text-xs text-center text-red-600 dark:text-red-400 sm:text-sm">
                  {errors.root.message}
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={isLoading}>
                회원가입
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-xs text-orange-600 sm:text-sm dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300"
                >
                  이미 계정이 있으신가요? 로그인
                </Link>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  팀 코드가 없으시면 팀 관리자에게 문의하세요
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
