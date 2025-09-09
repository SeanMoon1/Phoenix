import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button, Input } from '../../components/ui';
import Layout from '../../components/layout/Layout';
import { teamApi } from '../../services/api';

// 팀 코드 검증 스키마
const teamCodeSchema = yup.object({
  teamCode: yup
    .string()
    .required('팀 코드를 입력해주세요.')
    .min(3, '팀 코드는 최소 3자 이상이어야 합니다.')
    .max(20, '팀 코드는 최대 20자까지 입력 가능합니다.'),
});

// 회원가입 스키마
const registerSchema = yup.object({
  teamCode: yup
    .string()
    .required('팀 코드를 입력해주세요.')
    .min(3, '팀 코드는 최소 3자 이상이어야 합니다.')
    .max(20, '팀 코드는 최대 20자까지 입력 가능합니다.'),
  userCode: yup
    .string()
    .required('사용자 코드를 입력해주세요.')
    .min(2, '사용자 코드는 최소 2자 이상이어야 합니다.')
    .max(20, '사용자 코드는 최대 20자까지 입력 가능합니다.'),
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

interface TeamInfo {
  id: number;
  name: string;
  description?: string;
  teamCode: string;
}

const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [isValidatingTeam, setIsValidatingTeam] = useState(false);
  const [teamValidationError, setTeamValidationError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const teamCode = watch('teamCode');

  // 팀 코드 실시간 검증
  const validateTeamCode = async (code: string) => {
    if (!code || code.length < 3) {
      setTeamInfo(null);
      setTeamValidationError('');
      return;
    }

    setIsValidatingTeam(true);
    setTeamValidationError('');

    try {
      const response = await teamApi.validateTeamCode(code);

      if (response.success && response.data?.valid) {
        setTeamInfo(response.data.team || null);
        setTeamValidationError('');
      } else {
        setTeamInfo(null);
        setTeamValidationError(
          response.data?.message || '유효하지 않은 팀 코드입니다.'
        );
      }
    } catch (error) {
      setTeamInfo(null);
      setTeamValidationError('팀 코드 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidatingTeam(false);
    }
  };

  // 팀 코드 변경 시 검증
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (teamCode) {
        validateTeamCode(teamCode);
      }
    }, 500); // 500ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [teamCode]);

  const onSubmit = async (data: RegisterFormData) => {
    if (!teamInfo) {
      setError('teamCode', {
        type: 'manual',
        message: '유효한 팀 코드를 입력해주세요.',
      });
      return;
    }

    try {
      await registerUser({
        teamCode: data.teamCode,
        userCode: data.userCode,
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
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              회원가입
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              팀 코드를 입력하여 재난훈련ON에 가입하세요
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm dark:shadow-lg p-4 sm:p-6 md:p-8">
            <form
              className="space-y-4 sm:space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* 팀 코드 입력 및 검증 */}
              <div className="space-y-2">
                <Input
                  label="팀 코드"
                  placeholder="TEAM001"
                  error={errors.teamCode?.message || teamValidationError}
                  {...register('teamCode')}
                />

                {/* 팀 코드 검증 상태 표시 */}
                {isValidatingTeam && (
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    팀 코드를 확인하는 중...
                  </div>
                )}

                {teamInfo && !isValidatingTeam && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center text-sm text-green-800 dark:text-green-200">
                      <span className="mr-2">✅</span>
                      <div>
                        <div className="font-medium">{teamInfo.name}</div>
                        {teamInfo.description && (
                          <div className="text-xs text-green-600 dark:text-green-300 mt-1">
                            {teamInfo.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 사용자 정보 입력 */}
              <div className="space-y-3 sm:space-y-4">
                <Input
                  label="사용자 코드"
                  placeholder="USER001"
                  error={errors.userCode?.message}
                  {...register('userCode')}
                />

                <Input
                  label="로그인 ID"
                  placeholder="user001"
                  error={errors.loginId?.message}
                  {...register('loginId')}
                />

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

                <Input
                  label="비밀번호 확인"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              {errors.root && (
                <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm text-center">
                  {errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!teamInfo || isValidatingTeam}
              >
                회원가입
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300"
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
