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
    const error = searchParams.get('error');

    if (error) {
      // Google OAuth 에러 처리
      console.error('Google OAuth error:', error);
      navigate('/login?error=google_auth_failed');
      return;
    }

    if (token) {
      try {
        // 토큰만으로 사용자 정보 조회
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

        fetch(`${apiBaseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
          .then(response => response.json())
          .then(data => {
            if (data.success && data.data) {
              // 인증 상태 설정
              setAuth({
                token,
                user: data.data,
                isAuthenticated: true,
              });

              // 메인페이지로 리다이렉트
              navigate('/');
            } else {
              throw new Error(
                data.error || '사용자 정보를 가져올 수 없습니다.'
              );
            }
          })
          .catch(error => {
            console.error('Failed to fetch user data:', error);
            navigate('/login?error=invalid_token');
          });
      } catch (error) {
        console.error('Failed to process token:', error);
        navigate('/login?error=invalid_callback');
      }
    } else {
      // 토큰이 없는 경우
      navigate('/login?error=missing_token');
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
