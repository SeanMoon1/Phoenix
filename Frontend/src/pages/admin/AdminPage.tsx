import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui';
import { trainingApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

// game-script-tool 컴포넌트들을 import (향후 통합 예정)
// import ScriptView from '../../scripts/game-script-tool/src/Components/ScriptView';
// import ApprovalManager from '../../scripts/game-script-tool/src/Components/ApprovalManager/ApprovalManager';

interface TeamStats {
  totalSessions: number;
  activeSessions: number;
  totalParticipants: number;
  completedParticipants: number;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'scripts' | 'approval' | 'users' | 'training'
  >('training');
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const tabs = [
    { id: 'training', label: '훈련 관리', icon: '🎯' },
    { id: 'scripts', label: '시나리오 관리', icon: '📝' },
    { id: 'approval', label: '승인 관리', icon: '✅' },
    { id: 'users', label: '사용자 관리', icon: '👥' },
  ];

  // 팀 통계 로드
  useEffect(() => {
    if (user?.teamId) {
      loadTeamStats();
    }
  }, [user?.teamId]);

  const loadTeamStats = async () => {
    if (!user?.teamId) return;

    setLoading(true);
    try {
      const response = await trainingApi.getTeamStats(user.teamId);
      if (response.success && response.data) {
        setTeamStats(response.data as TeamStats);
      }
    } catch (error) {
      console.error('팀 통계 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            관리자 대시보드
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            시나리오, 승인, 사용자를 관리할 수 있습니다.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as 'scripts' | 'approval' | 'users')
                }
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-white rounded-lg shadow dark:bg-gray-800">
          {activeTab === 'training' && (
            <div className="p-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                훈련 관리
              </h2>

              {/* 팀 통계 카드 */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 dark:text-gray-400">
                    로딩 중...
                  </div>
                </div>
              ) : teamStats ? (
                <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="p-6 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-800">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          총 세션 수
                        </p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {teamStats.totalSessions}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-full dark:bg-green-800">
                        <span className="text-2xl">▶️</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          진행 중인 세션
                        </p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {teamStats.activeSessions}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-800">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          총 참가자 수
                        </p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {teamStats.totalParticipants}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-orange-50 rounded-lg dark:bg-orange-900/20">
                    <div className="flex items-center">
                      <div className="p-3 bg-orange-100 rounded-full dark:bg-orange-800">
                        <span className="text-2xl">✅</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          완료한 참가자
                        </p>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                          {teamStats.completedParticipants}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-gray-600 dark:text-gray-400">
                    팀 통계를 불러올 수 없습니다.
                  </div>
                </div>
              )}

              {/* 훈련 세션 관리 버튼들 */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => {
                    // 훈련 세션 생성 모달 열기 (향후 구현)
                    alert('훈련 세션 생성 기능은 곧 추가될 예정입니다.');
                  }}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  새 훈련 세션 생성
                </Button>
                <Button
                  onClick={loadTeamStats}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  통계 새로고침
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'scripts' && (
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                시나리오 관리
              </h2>
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">🚧</div>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  시나리오 관리 도구
                </h3>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  game-script-tool이 여기에 통합될 예정입니다.
                </p>
                <Button
                  onClick={() =>
                    window.open('/scripts/game-script-tool', '_blank')
                  }
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  별도 창에서 열기
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'approval' && (
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                승인 관리
              </h2>
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">⏳</div>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  승인 관리 시스템
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  승인 관리 기능이 개발 중입니다.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                사용자 관리
              </h2>
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">👥</div>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  사용자 관리 시스템
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  사용자 관리 기능이 개발 중입니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;
