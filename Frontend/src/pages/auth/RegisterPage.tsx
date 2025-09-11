import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button, Input } from '../../components/ui';
import Layout from '../../components/layout/Layout';
import { authApi } from '../../services/api';
// 회원가입 스키마
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
  const [isValidatingLoginId, setIsValidatingLoginId] = useState(false);
  const [loginIdValidationError, setLoginIdValidationError] =
    useState<string>('');
  const [isLoginIdAvailable, setIsLoginIdAvailable] = useState<boolean | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const loginId = watch('loginId');
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // 로그인 ID 중복 확인
  const validateLoginId = async (id: string) => {
    if (!id || id.length < 3) {
      setIsLoginIdAvailable(null);
      setLoginIdValidationError('');
      return;
    }

    setIsValidatingLoginId(true);
    setLoginIdValidationError('');

    try {
      const response = await authApi.checkLoginIdAvailability(id);

      if (response.success && response.data) {
        if (response.data.available) {
          setIsLoginIdAvailable(true);
          setLoginIdValidationError('');
        } else {
          setIsLoginIdAvailable(false);
          setLoginIdValidationError('이미 사용 중인 로그인 ID입니다.');
        }
      } else {
        setIsLoginIdAvailable(null);
        setLoginIdValidationError('로그인 ID 확인 중 오류가 발생했습니다.');
      }
    } catch (error: unknown) {
      setIsLoginIdAvailable(null);
      setLoginIdValidationError('로그인 ID 확인 중 오류가 발생했습니다.');
    } finally {
      setIsValidatingLoginId(false);
    }
  };

  // 로그인 ID 변경 시 검증
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loginId) {
        validateLoginId(loginId);
      }
    }, 500); // 500ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [loginId]);

  const onSubmit = async (data: RegisterFormData) => {
    // 로그인 ID 중복 확인이 완료되었고 사용 불가능한 경우에만 에러 처리
    if (isLoginIdAvailable === false) {
      setError('loginId', {
        type: 'manual',
        message: '이미 사용 중인 로그인 ID입니다.',
      });
      return;
    }

    // 로그인 ID 중복 확인이 아직 진행 중인 경우
    if (isValidatingLoginId) {
      setError('loginId', {
        type: 'manual',
        message: '로그인 ID 확인 중입니다. 잠시 후 다시 시도해주세요.',
      });
      return;
    }

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
    } catch (error: unknown) {
      setError('root', {
        type: 'manual',
        message: (error as Error).message || '회원가입에 실패했습니다.',
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
              재난훈련ON에 가입하세요
            </p>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-600 rounded-xl dark:shadow-lg sm:p-6 md:p-8">
            <form
              className="space-y-4 sm:space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* 사용자 정보 입력 */}
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Input
                    label="로그인 ID"
                    placeholder="user001"
                    error={errors.loginId?.message || loginIdValidationError}
                    {...register('loginId')}
                  />

                  {/* 로그인 ID 중복 확인 상태 표시 */}
                  {isValidatingLoginId && (
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <div className="w-4 h-4 mr-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                      로그인 ID를 확인하는 중...
                    </div>
                  )}

                  {isLoginIdAvailable === true && !isValidatingLoginId && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <span className="mr-2">✅</span>
                      사용 가능한 로그인 ID입니다.
                    </div>
                  )}

                  {isLoginIdAvailable === false && !isValidatingLoginId && (
                    <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                      <span className="mr-2">❌</span>
                      이미 사용 중인 로그인 ID입니다.
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

                <Input
                  label="비밀번호"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="space-y-2">
                  <Input
                    label="비밀번호 확인"
                    type="password"
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />

                  {/* 비밀번호 확인 실시간 검증 */}
                  {confirmPassword && password && (
                    <div className="flex items-center text-sm">
                      {password === confirmPassword ? (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <span className="mr-2">✅</span>
                          비밀번호가 일치합니다.
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 dark:text-red-400">
                          <span className="mr-2">❌</span>
                          비밀번호가 일치하지 않습니다.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {errors.root && (
                <div className="text-xs text-center text-red-600 dark:text-red-400 sm:text-sm">
                  {errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isValidatingLoginId || isLoginIdAvailable === false}
              >
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
                  로그인 후 마이페이지에서 팀 코드를 입력하실 수 있습니다
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
