import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAdminAuthStore } from '../../stores/adminAuthStore';
import { Button, Input } from '../../components/ui';
import Layout from '../../components/layout/Layout';
import { FaUser, FaCog } from 'react-icons/fa';

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
  const { login, isLoading, setAuth } = useAuthStore();
  const { login: adminLogin, isLoading: isAdminLoading } = useAdminAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  // OAuth 에러 메시지 처리
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      const errorMessage = getOAuthErrorMessage(error);
      setOauthError(errorMessage);
      // URL에서 에러 파라미터 제거
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('error');
      const newUrl = `${window.location.pathname}${
        newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''
      }`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // OAuth 에러 메시지 매핑 함수
  const getOAuthErrorMessage = (error: string): string => {
    switch (error) {
      case 'oauth_user_not_found':
        return 'OAuth 사용자 정보를 찾을 수 없습니다.';
      case 'oauth_incomplete_info':
        return 'OAuth 사용자 정보가 불완전합니다.';
      case 'oauth_auth_failed':
        return 'OAuth 인증에 실패했습니다.';
      case 'oauth_server_error':
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 'oauth_unknown_error':
        return '알 수 없는 오류가 발생했습니다.';
      default:
        return 'OAuth 로그인 중 오류가 발생했습니다.';
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      if (isAdminMode) {
        const adminToken = await adminLogin(data);

        // 관리자 로그인 후 일반 사용자 정보도 설정
        // 관리자도 일반 사용자로서 MyPage에 접근할 수 있도록 함
        const adminUser = {
          id: 0, // 관리자는 일반 사용자 ID가 없으므로 0으로 설정
          teamId: 0,
          userCode: 'ADMIN',
          loginId: data.loginId,
          email: 'admin@phoenix.com',
          name: '관리자',
          useYn: 'Y',
          userLevel: 1,
          userExp: 0,
          totalScore: 0,
          completedScenarios: 0,
          currentTier: 'ADMIN',
          levelProgress: 0,
          nextLevelExp: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isAdmin: true,
          adminLevel: 'SUPER_ADMIN',
        };

        // 관리자 토큰을 authStore에도 저장하여 API 호출 시 사용
        setAuth({
          user: adminUser,
          token: adminToken,
          isAuthenticated: true,
        });

        navigate('/mypage');
      } else {
        await login(data);
        navigate('/');
      }
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

  // OAuth 로그인 핸들러 - 실제 OAuth 엔드포인트로 리다이렉트
  const handleOAuthLogin = async (provider: string) => {
    try {
      // API 기본 URL 가져오기
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

      // 각 OAuth 제공자별 엔드포인트로 리다이렉트
      switch (provider) {
        case 'google':
          window.location.href = `${apiBaseUrl}/auth/google`;
          break;
        case 'kakao':
          window.location.href = `${apiBaseUrl}/auth/kakao`;
          break;
        case 'naver':
          window.location.href = `${apiBaseUrl}/auth/naver`;
          break;
        default:
          console.error(`지원하지 않는 OAuth 제공자: ${provider}`);
          alert(`${provider} 로그인은 아직 지원되지 않습니다.`);
      }
    } catch (error: unknown) {
      console.error(`${provider} 로그인 실패:`, error);
      alert(`${provider} 로그인에 실패했습니다.`);
    }
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
              {isAdminMode ? (
                <>
                  <FaUser className="w-4 h-4 mr-2" />
                  일반 사용자로 전환
                </>
              ) : (
                <>
                  <FaCog className="w-4 h-4 mr-2" />
                  관리자로 전환
                </>
              )}
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

              {oauthError && (
                <div className="p-3 text-xs text-center text-red-600 border border-red-200 rounded-lg bg-red-50 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 sm:text-sm">
                  {oauthError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isAdminMode ? isAdminLoading : isLoading}
              >
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
                      <span className="px-2 text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400">
                        또는
                      </span>
                    </div>
                  </div>

                  {/* OAuth 로그인 버튼들 */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center w-full space-x-2"
                      onClick={() => handleOAuthLogin('google')}
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

                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center w-full space-x-2"
                      onClick={() => handleOAuthLogin('kakao')}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 3C6.48 3 2 6.48 2 10.5c0 2.5 1.5 4.7 3.8 6.1L4.5 20.5c-.1.3.1.6.4.6h.1c.2 0 .4-.1.5-.3L8.5 16.5c.8.1 1.6.2 2.5.2 5.52 0 10-3.48 10-7.5S17.52 3 12 3z"
                        />
                      </svg>
                      <span>카카오로 로그인</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center w-full space-x-2"
                      onClick={() => handleOAuthLogin('naver')}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"
                        />
                      </svg>
                      <span>네이버로 로그인</span>
                    </Button>
                  </div>
                </>
              )}

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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    관리자 계정이 필요하시면 시스템 관리자에게 문의하세요
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    또는 기존 관리자로 로그인하여 새 관리자를 생성할 수 있습니다
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
