import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { AnimatedText } from '../ui';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: '대시보드', icon: '📊' },
    { path: '/admin/users', label: '사용자 관리', icon: '👥' },
    { path: '/admin/training', label: '훈련 관리', icon: '🎯' },
    { path: '/admin/scenarios', label: '시나리오 관리', icon: '📝' },
    { path: '/admin/analytics', label: '분석 리포트', icon: '📈' },
    { path: '/admin/settings', label: '시스템 설정', icon: '⚙️' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <AnimatedText delay={0} animation="fadeIn">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              관리자 패널
            </h1>
          </AnimatedText>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <AnimatedText delay={index * 100} animation="slideRight">
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.label}
                  </AnimatedText>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 로그아웃 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
          >
            <span className="mr-3">🚪</span>
            로그아웃
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="lg:ml-64">
        {/* 상단 헤더 */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center px-3 py-1 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors duration-200"
                title="메인페이지로 이동"
              >
                <span className="mr-1">🏠</span>
                홈으로
              </Link>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                관리자님, 안녕하세요! 👋
              </div>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
