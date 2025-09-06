import React from 'react';
import ScenarioPage from './pages/training/ScenarioPage';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import { AnimatedText, AnimatedButton, VimeoVideo } from './components/ui';
import ScenarioSelectPage from '@/pages/training/ScenarioSelectPage';

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 기능 카드 컴포넌트
const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => (
  <AnimatedText
    delay={delay}
    animation="fadeIn"
    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-600"
  >
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-3xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
        {title}
      </h3>
      <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
        {description}
      </p>
    </div>
  </AnimatedText>
);

// 홈 페이지 컴포넌트
const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      {/* 히어로 섹션 */}
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* 왼쪽: 텍스트 콘텐츠 */}
            <div className="text-center lg:text-left">
              <AnimatedText
                delay={0}
                animation="fadeIn"
                className="mb-6 sm:mb-8"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-orange-600 dark:text-orange-400">
                  재난훈련ON🔥
                </h1>
              </AnimatedText>

              <AnimatedText
                delay={500}
                animation="slideUp"
                className="mb-4 sm:mb-6"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
                  재난 대응 훈련 시스템
                </h2>
              </AnimatedText>

              <AnimatedText delay={1000} animation="slideUp" className="mb-8">
                <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0 lg:text-left">
                  가상현실과 시뮬레이션을 통해 재난 상황에 대한 대응 능력을
                  향상시키는 혁신적인 훈련 플랫폼입니다.
                </p>
              </AnimatedText>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <AnimatedButton
                  href="/login"
                  variant="primary"
                  delay={1500}
                  className="w-full sm:w-auto"
                >
                  지금 바로 시작하기
                </AnimatedButton>
              </div>
            </div>

            {/* 오른쪽: 캐릭터 이미지 */}
            <div className="relative flex justify-center">
              <AnimatedText
                delay={800}
                animation="slideRight"
                className="relative"
              >
                <div className="relative">
                  <img
                    src="/character.png"
                    alt="재난훈련 캐릭터"
                    className="w-4/5 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl drop-shadow-2xl mx-auto"
                  />
                </div>
              </AnimatedText>
            </div>
          </div>
        </div>
      </div>

      {/* 기능 소개 섹션 */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <AnimatedText
            delay={0}
            animation="fadeIn"
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              혁신적인 훈련 시스템
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
              최신 기술을 활용한 재난 대응 훈련으로 안전한 미래를 만들어갑니다
            </p>
          </AnimatedText>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎯"
              title="실시간 시나리오"
              description="다양한 재난 상황을 실시간으로 시뮬레이션하여 현실감 있는 훈련을 제공합니다."
              delay={200}
            />
            <FeatureCard
              icon="📊"
              title="성과 분석"
              description="훈련 결과를 체계적으로 분석하고 개선점을 제시하여 능력 향상을 돕습니다."
              delay={400}
            />
            <FeatureCard
              icon="🔄"
              title="반복 훈련"
              description="필요한 만큼 반복하여 완벽한 대응 능력을 기를 수 있습니다."
              delay={600}
            />
            <FeatureCard
              icon="👥"
              title="팀워크 훈련"
              description="여러 명이 함께 참여하여 협력과 소통 능력을 향상시킵니다."
              delay={800}
            />
            <FeatureCard
              icon="📱"
              title="모바일 지원"
              description="언제 어디서나 접근 가능한 모바일 환경을 지원합니다."
              delay={1000}
            />
            <FeatureCard
              icon="🛡️"
              title="안전 보장"
              description="실제 위험 없이 안전하게 훈련할 수 있는 환경을 제공합니다."
              delay={1200}
            />
          </div>
        </div>
      </div>

      {/* Vimeo 영상 섹션 */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimatedText
            delay={0}
            animation="fadeIn"
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              프로그램 소개영상
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-200">
              재난훈련ON의 혁신적인 기능들을 직접 확인해보세요
            </p>
          </AnimatedText>

          <div className="w-full">
            <VimeoVideo
              videoId="1115067484"
              title="재난훈련ON"
              delay={200}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedText delay={0} animation="fadeIn" className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg text-gray-100 mb-8">
              안전한 미래를 위한 첫 걸음을 내딛어보세요. 재난훈련ON이 여러분의
              안전을 책임집니다.
            </p>
          </AnimatedText>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <AnimatedButton
              href="/login"
              variant="primary"
              delay={200}
              className="w-full sm:w-auto"
            >
              지금 바로 시작하기
            </AnimatedButton>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// 관리자 라우트 보호 컴포넌트 (개발용 - 임시 비활성화)
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 개발 중에는 인증 체크를 비활성화
  // const { isAuthenticated } = useAuthStore();
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* 홈 */}
          <Route path="/" element={<HomePage />} />

          {/* 로그인 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 훈련하기 */}
          <Route path="/manual" element={<ScenarioPage />} />
          <Route path="/training/select" element={<ScenarioSelectPage />} />
          <Route path="/training/:type" element={<ScenarioPage />} />

          {/* 마이페이지 */}
          <Route path="/mypage/records" element={<ScenarioPage />} />
          <Route path="/mypage/scores" element={<ScenarioPage />} />
          <Route path="/mypage/profile" element={<ScenarioPage />} />

          {/* 고객지원 */}
          <Route path="/faq" element={<ScenarioPage />} />
          <Route path="/contact" element={<ScenarioPage />} />

          {/* 관리자페이지 */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <DashboardPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/scenarios"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <DashboardPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <DashboardPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
