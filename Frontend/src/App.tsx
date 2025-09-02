import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import Layout from './components/layout/Layout';
import './App.css';

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 보호된 라우트 컴포넌트
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 홈 페이지 컴포넌트
const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-orange-500 mb-6 sm:mb-8">
              🔥재난훈련ON
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              재난 대응 훈련 시스템
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto px-4">
              가상현실과 시뮬레이션을 통해 재난 상황에 대한 대응 능력을
              향상시키는
              <br className="hidden sm:block" />
              혁신적인 훈련 플랫폼입니다.
            </p>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="/login"
                className="w-full sm:w-auto inline-block bg-orange-500 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
              >
                시작하기
              </a>
              <a
                href="/register"
                className="w-full sm:w-auto inline-block bg-gray-100 text-gray-800 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-200 transition-colors border border-gray-200"
              >
                자세히 보기
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/* 추가 라우트들은 여기에 추가 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
export default App;
