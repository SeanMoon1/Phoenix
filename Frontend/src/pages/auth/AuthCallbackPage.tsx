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
    const handleOAuthCallback = async () => {
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

          // 필수 필드 검증 및 기본값 설정
          if (!userData.id) {
            console.error('❌ Missing user ID:', userData);
            navigate('/login?error=incomplete_user_data');
            return;
          }

          // 이메일이 없으면 기본값 설정
          if (!userData.email) {
            console.warn('⚠️ Missing email, using default');
            userData.email = `user_${userData.id}@oauth.local`;
          }

          // 이름이 없으면 기본값 설정
          if (!userData.name) {
            console.warn('⚠️ Missing name, using default');
            userData.name = 'OAuth 사용자';
          }

          console.log('✅ User data validation passed:', {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            provider: userData.provider,
          });

          // 백엔드에서 실제 사용자 정보를 가져오기 위해 API 호출
          try {
            console.log('🔍 백엔드에서 사용자 정보 조회 중...');

            // JWT 토큰을 사용하여 사용자 프로필 조회
            const response = await fetch(
              `${
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
              }/auth/profile`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const profileData = await response.json();
            console.log('👤 백엔드에서 받은 사용자 정보:', profileData);

            // 백엔드 응답이 빈 객체이거나 필수 필드가 없는 경우 OAuth 데이터 사용
            const hasValidProfileData =
              profileData &&
              (profileData.id || profileData.email || profileData.name) &&
              Object.keys(profileData).length > 0;

            console.log('🔍 프로필 데이터 유효성 검사:', {
              hasValidProfileData,
              profileDataKeys: Object.keys(profileData),
              profileDataLength: Object.keys(profileData).length,
            });

            // 백엔드에서 받은 실제 사용자 정보 사용 (경험치/레벨 정보 포함)
            const user = {
              id: hasValidProfileData
                ? profileData.id || userData.id
                : userData.id,
              teamId: hasValidProfileData ? profileData.teamId || 0 : 0,
              userCode: hasValidProfileData ? profileData.userCode || '' : '',
              loginId: hasValidProfileData ? profileData.loginId || '' : '',
              email: hasValidProfileData
                ? profileData.email || userData.email
                : userData.email,
              name: hasValidProfileData
                ? profileData.name || userData.name
                : userData.name,
              useYn: hasValidProfileData ? profileData.useYn || 'Y' : 'Y',
              userLevel: hasValidProfileData ? profileData.userLevel || 1 : 1,
              userExp: hasValidProfileData ? profileData.userExp || 0 : 0,
              totalScore: hasValidProfileData ? profileData.totalScore || 0 : 0,
              completedScenarios: hasValidProfileData
                ? profileData.completedScenarios || 0
                : 0,
              currentTier: hasValidProfileData
                ? profileData.currentTier || 'BRONZE'
                : 'BRONZE',
              levelProgress: hasValidProfileData
                ? profileData.levelProgress || 0
                : 0,
              nextLevelExp: hasValidProfileData
                ? profileData.nextLevelExp || 100
                : 100,
              isActive: hasValidProfileData
                ? profileData.isActive !== false
                : true,
              createdAt: hasValidProfileData
                ? profileData.createdAt || new Date().toISOString()
                : new Date().toISOString(),
              updatedAt: hasValidProfileData
                ? profileData.updatedAt || new Date().toISOString()
                : new Date().toISOString(),
              isAdmin: hasValidProfileData
                ? profileData.isAdmin || false
                : false,
              adminLevel: hasValidProfileData
                ? profileData.adminLevel || 'USER'
                : 'USER',
              // OAuth 관련 정보 추가
              oauthProvider: hasValidProfileData
                ? profileData.oauthProvider || userData.provider
                : userData.provider,
              oauthProviderId: hasValidProfileData
                ? profileData.oauthProviderId || userData.providerId
                : userData.providerId,
            };

            console.log('✅ Setting auth state with backend data:', {
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
            return;
          } catch (profileError) {
            console.error('❌ 백엔드에서 사용자 정보 조회 실패:', profileError);
            // 백엔드 조회 실패 시 재시도 또는 기본값 사용
            console.log('🔄 Fallback to callback user data...');

            // 잠시 후 재시도
            try {
              console.log('🔄 재시도 중...');
              await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기

              const retryResponse = await fetch(
                `${
                  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
                }/auth/profile`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (retryResponse.ok) {
                const retryProfileData = await retryResponse.json();
                console.log('✅ 재시도 성공:', retryProfileData);

                // 재시도에서도 동일한 유효성 검사
                const hasValidRetryData =
                  retryProfileData &&
                  (retryProfileData.id ||
                    retryProfileData.email ||
                    retryProfileData.name) &&
                  Object.keys(retryProfileData).length > 0;

                console.log('🔍 재시도 프로필 데이터 유효성 검사:', {
                  hasValidRetryData,
                  retryDataKeys: Object.keys(retryProfileData),
                  retryDataLength: Object.keys(retryProfileData).length,
                });

                const user = {
                  id: hasValidRetryData
                    ? retryProfileData.id || userData.id
                    : userData.id,
                  teamId: hasValidRetryData ? retryProfileData.teamId || 0 : 0,
                  userCode: hasValidRetryData
                    ? retryProfileData.userCode || ''
                    : '',
                  loginId: hasValidRetryData
                    ? retryProfileData.loginId || ''
                    : '',
                  email: hasValidRetryData
                    ? retryProfileData.email || userData.email
                    : userData.email,
                  name: hasValidRetryData
                    ? retryProfileData.name || userData.name
                    : userData.name,
                  useYn: hasValidRetryData
                    ? retryProfileData.useYn || 'Y'
                    : 'Y',
                  userLevel: hasValidRetryData
                    ? retryProfileData.userLevel || 1
                    : 1,
                  userExp: hasValidRetryData
                    ? retryProfileData.userExp || 0
                    : 0,
                  totalScore: hasValidRetryData
                    ? retryProfileData.totalScore || 0
                    : 0,
                  completedScenarios: hasValidRetryData
                    ? retryProfileData.completedScenarios || 0
                    : 0,
                  currentTier: hasValidRetryData
                    ? retryProfileData.currentTier || '초급자'
                    : '초급자',
                  levelProgress: hasValidRetryData
                    ? retryProfileData.levelProgress || 0
                    : 0,
                  nextLevelExp: hasValidRetryData
                    ? retryProfileData.nextLevelExp || 100
                    : 100,
                  isActive: hasValidRetryData
                    ? retryProfileData.isActive !== false
                    : true,
                  createdAt: hasValidRetryData
                    ? retryProfileData.createdAt || new Date().toISOString()
                    : new Date().toISOString(),
                  updatedAt: hasValidRetryData
                    ? retryProfileData.updatedAt || new Date().toISOString()
                    : new Date().toISOString(),
                  isAdmin: hasValidRetryData
                    ? retryProfileData.isAdmin || false
                    : false,
                  adminLevel: hasValidRetryData
                    ? retryProfileData.adminLevel || 'USER'
                    : 'USER',
                  oauthProvider: hasValidRetryData
                    ? retryProfileData.oauthProvider || userData.provider
                    : userData.provider,
                  oauthProviderId: hasValidRetryData
                    ? retryProfileData.oauthProviderId || userData.providerId
                    : userData.providerId,
                };

                setAuth({
                  token,
                  user,
                  isAuthenticated: true,
                });

                console.log('🚀 Redirecting to home page...');
                navigate('/');
                return;
              }
            } catch (retryError) {
              console.error('❌ 재시도도 실패:', retryError);
            }
          }

          // 최종 Fallback: 콜백 데이터를 사용하되 기본값 설정
          const user = {
            id: userData.id,
            teamId: 0, // OAuth 사용자는 기본값
            userCode: '', // OAuth 사용자는 기본값
            loginId: '', // OAuth 사용자는 기본값
            email: userData.email || `user_${userData.id}@oauth.local`,
            name: userData.name || 'OAuth 사용자',
            useYn: 'Y',
            userLevel: 1, // 기본 레벨
            userExp: 0,
            totalScore: 0,
            completedScenarios: 0,
            currentTier: '초급자', // 기본 티어
            levelProgress: 0,
            nextLevelExp: 100,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isAdmin: false, // OAuth 사용자는 기본적으로 일반 사용자
            adminLevel: 'USER',
            // OAuth 관련 정보 추가
            oauthProvider: userData.provider || 'unknown',
            oauthProviderId: userData.providerId || userData.id,
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
    };

    handleOAuthCallback();
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
