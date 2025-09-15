import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Layout from '../../components/layout/Layout';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      // Google OAuth 에러 처리
      console.error('Google OAuth error:', error);
      navigate('/login?error=google_auth_failed');
      return;
    }

    if (token && userParam) {
      try {
        // URL 디코딩 및 JSON 파싱
        const user = JSON.parse(decodeURIComponent(userParam));

        // 인증 상태 설정
        setAuth({
          token,
          user,
          isAuthenticated: true,
        });

        // 마이페이지로 리다이렉트
        navigate('/mypage');
      } catch (error) {
        console.error('Failed to parse user data:', error);
        navigate('/login?error=invalid_callback');
      }
    } else {
      // 토큰이나 사용자 정보가 없는 경우
      navigate('/login?error=missing_callback_data');
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 dark:border-orange-800 mx-auto mb-6"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2 mb-6"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            로그인 처리 중...
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Google 계정 정보를 확인하고 있습니다.
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthCallbackPage;
