import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import Layout from '../../components/layout/Layout';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  // 임시 데이터 (실제로는 API에서 가져올 예정)
  const stats = {
    totalScenarios: 12,
    completedSessions: 8,
    averageScore: 85,
    currentStreak: 3,
  };

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* 환영 메시지 */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            안녕하세요, {user?.name}님! 👋
          </h1>
          <p className="text-base sm:text-lg text-gray-700">
            오늘도 재난 대응 훈련을 통해 안전한 세상을 만들어봅시다.
          </p>
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-xl">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">총 시나리오</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalScenarios}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">완료된 세션</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-amber-100 rounded-xl">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">평균 점수</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.averageScore}점</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-xl">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">연속 훈련</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.currentStreak}일</p>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 활동과 퀵 액션을 나란히 배치 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* 최근 활동 */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">최근 활동</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">화재 대응 훈련 완료</p>
                    <p className="text-xs text-gray-500">2시간 전 • 점수: 92점</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">지진 대응 훈련 시작</p>
                    <p className="text-xs text-gray-500">어제 • 진행 중</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">태풍 대응 훈련 완료</p>
                    <p className="text-xs text-gray-500">3일 전 • 점수: 78점</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 퀵 액션 */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">퀵 액션</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                <button className="w-full text-left p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">새 훈련 시작</p>
                      <p className="text-sm text-gray-500">새로운 시나리오로 훈련을 시작하세요</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">성과 분석</p>
                      <p className="text-sm text-gray-500">훈련 결과를 분석하고 개선점을 확인하세요</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
