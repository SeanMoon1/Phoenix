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

        // 메인페이지로 리다이렉트
        navigate('/');
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
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
