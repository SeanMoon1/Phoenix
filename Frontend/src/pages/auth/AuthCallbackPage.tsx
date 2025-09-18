import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Layout from '../../components/layout/Layout';

// OAuth 에러 메시지 매핑 함수
const getErrorMessage = (error: string): string => {
  switch (error) {
    case 'user_not_found':
      return 'oauth_user_not_found';
    case 'incomplete_user_info':
      return 'oauth_incomplete_info';
    case 'authentication_failed':
      return 'oauth_auth_failed';
    case 'server_error':
      return 'oauth_server_error';
    default:
      return 'oauth_unknown_error';
  }
};

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    console.log('🔍 OAuth Callback Debug Info:', {
      token: token ? `${token.substring(0, 20)}...` : 'No token',
      userParam: userParam ? 'Present' : 'Missing',
      error: error || 'No error',
      allParams: Object.fromEntries(searchParams.entries()),
    });

    if (error) {
      // OAuth 에러 처리
      console.error('❌ OAuth error:', error);
      const errorMessage = getErrorMessage(error);
      navigate(`/login?error=${errorMessage}`);
      return;
    }

    if (token && userParam) {
      try {
        // URL 디코딩 및 JSON 파싱
        const userData = JSON.parse(decodeURIComponent(userParam));
        console.log('👤 Parsed user data:', userData);

        // 필수 필드 검증
        if (!userData.id || !userData.email || !userData.name) {
          console.error('❌ Missing required user data:', {
            hasId: !!userData.id,
            hasEmail: !!userData.email,
            hasName: !!userData.name,
            userData,
          });
          navigate('/login?error=incomplete_user_data');
          return;
        }

        // Backend에서 받은 사용자 정보를 Frontend User 타입에 맞게 변환
        const user = {
          id: userData.id,
          teamId: 0, // OAuth 사용자는 기본값
          userCode: '', // OAuth 사용자는 기본값
          loginId: '', // OAuth 사용자는 기본값
          email: userData.email,
          name: userData.name,
          useYn: 'Y',
          userLevel: 1, // 기본 레벨
          userExp: 0,
          totalScore: 0,
          completedScenarios: 0,
          currentTier: 'BRONZE', // 기본 티어
          levelProgress: 0,
          nextLevelExp: 100,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isAdmin: false, // OAuth 사용자는 기본적으로 일반 사용자
          adminLevel: 'USER',
          // OAuth 관련 정보 추가
          oauthProvider: userData.provider,
          oauthProviderId: userData.providerId,
        };

        console.log('✅ Setting auth state:', {
          hasToken: !!token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            oauthProvider: user.oauthProvider,
          },
        });

        // 인증 상태 설정
        setAuth({
          token,
          user,
          isAuthenticated: true,
        });

        console.log('🚀 Redirecting to home page...');
        // 메인페이지로 리다이렉트
        navigate('/');
      } catch (error) {
        console.error('❌ Failed to parse user data:', error);
        navigate('/login?error=invalid_callback');
      }
    } else {
      // 토큰이나 사용자 정보가 없는 경우
      console.error('❌ Missing callback data:', {
        hasToken: !!token,
        hasUserParam: !!userParam,
      });
      navigate('/login?error=missing_callback_data');
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-orange-600 rounded-full animate-spin"></div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            로그인 처리 중...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            잠시만 기다려주세요.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AuthCallbackPage;
