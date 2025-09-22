import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui';
import {
  trainingApi,
  scenarioApi,
  trainingResultApi,
  teamApi,
} from '../../services/api';
import { ScenarioDataSource } from '../../services/scenarioService';
import { useAuthStore } from '../../stores/authStore';
import CreateAdminModal from '../../components/admin/CreateAdminModal';
import AdminList from '../../components/admin/AdminList';

interface TeamStats {
  totalSessions: number;
  activeSessions: number;
  totalParticipants: number;
  completedParticipants: number;
}

interface TeamMemberStats {
  userId: number;
  userName: string;
  userCode: string;
  totalTrainings: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  currentLevel: number;
  currentTier: string;
  lastTrainingAt?: Date;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'scripts' | 'approval' | 'users' | 'training' | 'teams' | 'admins'
  >('training');
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [memberStats, setMemberStats] = useState<TeamMemberStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [dataSourceStatus, setDataSourceStatus] = useState(
    ScenarioDataSource.getStatus()
  );
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const { user } = useAuthStore();

  const tabs = [
    { id: 'training', label: '훈련 관리', icon: '🎯' },
    { id: 'teams', label: '팀 관리', icon: '👥' },
    { id: 'scripts', label: '시나리오 관리', icon: '📝' },
    { id: 'approval', label: '승인 관리', icon: '✅' },
    { id: 'users', label: '사용자 관리', icon: '👤' },
    { id: 'admins', label: '관리자', icon: '👨‍💼' },
  ];

  // 팀 통계 로드
  useEffect(() => {
    if (user?.teamId) {
      loadTeamStats();
      loadMemberStats();
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

  const loadMemberStats = async () => {
    if (!user?.teamId) return;

    try {
      const response = await trainingResultApi.getTeamMemberStats(user.teamId);
      if (response.success && response.data) {
        setMemberStats((response.data as any).memberStats || []);
      }
    } catch (error) {
      console.error('팀원 통계 로드 실패:', error);
    }
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const response = await scenarioApi.importFromFile(file);
      if (response.success) {
        alert('시나리오가 성공적으로 임포트되었습니다.');
        // 시나리오 목록 새로고침
        window.location.reload();
      } else {
        alert('시나리오 임포트에 실패했습니다.');
      }
    } catch (error) {
      console.error('시나리오 임포트 실패:', error);
      alert('시나리오 임포트 중 오류가 발생했습니다.');
    } finally {
      setImporting(false);
    }
  };

  const handleJsonImport = async () => {
    // 기존 JSON 파일들을 로드하여 임포트
    setImporting(true);
    try {
      const scenarioFiles = [
        { name: 'fire_training_scenario.json', type: 'fire' },
        { name: 'earthquake_training_scenario.json', type: 'earthquake' },
        { name: 'emergency_first_aid_scenario.json', type: 'emergency' },
        { name: 'traffic_accident_scenario.json', type: 'traffic' },
      ];

      let successCount = 0;
      let failCount = 0;

      for (const file of scenarioFiles) {
        try {
          const response = await fetch(`/data/${file.name}`);
          const data = await response.json();

          const syncResponse = await scenarioApi.syncFromJson(data);
          if (syncResponse.success) {
            successCount++;
            console.log(`${file.type} 시나리오 동기화 성공`);
          } else {
            failCount++;
            console.error(`${file.type} 시나리오 동기화 실패`);
          }
        } catch (error) {
          failCount++;
          console.error(`${file.type} 시나리오 로드 실패:`, error);
        }
      }

      if (successCount > 0) {
        alert(
          `${successCount}개 시나리오가 성공적으로 동기화되었습니다.${
            failCount > 0 ? ` (${failCount}개 실패)` : ''
          }`
        );
        // 시나리오 목록 새로고침
        window.location.reload();
      } else {
        alert('시나리오 동기화에 실패했습니다.');
      }
    } catch (error) {
      console.error('시나리오 동기화 실패:', error);
      alert('시나리오 동기화 중 오류가 발생했습니다.');
    } finally {
      setImporting(false);
    }
  };

  // 데이터 소스 전환 핸들러
  const handleDataSourceChange = (source: 'static' | 'api' | 'auto') => {
    ScenarioDataSource.setSource(source);
    setDataSourceStatus(ScenarioDataSource.getStatus());
    alert(`데이터 소스가 ${source}로 변경되었습니다.`);
  };

  // 팀 생성
  const createTeam = async () => {
    if (!newTeamName.trim()) {
      alert('팀 이름을 입력해주세요.');
      return;
    }

    setCreatingTeam(true);
    try {
      const response = await teamApi.create({
        teamName: newTeamName,
        description: newTeamDescription,
      });

      if (response.success && response.data) {
        alert(
          `팀이 성공적으로 생성되었습니다!\n팀 코드: ${
            (response.data as any).teamCode
          }`
        );
        setShowCreateTeamModal(false);
        setNewTeamName('');
        setNewTeamDescription('');
      } else {
        alert('팀 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('팀 생성 실패:', error);
      alert('팀 생성 중 오류가 발생했습니다.');
    } finally {
      setCreatingTeam(false);
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
                  setActiveTab(
                    tab.id as
                      | 'scripts'
                      | 'approval'
                      | 'users'
                      | 'training'
                      | 'teams'
                      | 'admins'
                  )
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
                  <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20">
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

                  <div className="p-6 rounded-lg bg-green-50 dark:bg-green-900/20">
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

                  <div className="p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20">
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

                  <div className="p-6 rounded-lg bg-orange-50 dark:bg-orange-900/20">
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

              {/* 팀원별 상세 통계 */}
              {memberStats.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    팀원별 상세 통계
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow dark:bg-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                            사용자
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                            훈련 횟수
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                            총 점수
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                            평균 점수
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                            최고 점수
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                            레벨/등급
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                            마지막 훈련
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {memberStats.map(member => (
                          <tr
                            key={member.userId}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {member.userName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {member.userCode}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                              {member.totalTrainings}회
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                              {member.totalScore.toLocaleString()}점
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                              {member.averageScore.toFixed(1)}점
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                              {member.bestScore}점
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  Lv.{member.currentLevel}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {member.currentTier}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                              {member.lastTrainingAt
                                ? new Date(
                                    member.lastTrainingAt
                                  ).toLocaleDateString()
                                : '없음'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 훈련 세션 관리 버튼들 */}
              <div className="flex flex-wrap gap-4 mt-8">
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
                  onClick={() => {
                    loadTeamStats();
                    loadMemberStats();
                  }}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  통계 새로고침
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'scripts' && (
            <div className="p-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                시나리오 관리
              </h2>

              {/* 데이터 소스 설정 섹션 */}
              <div className="p-6 mb-8 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                  📊 시나리오 데이터 소스 설정
                </h3>
                <div className="mb-4">
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    현재 데이터 소스:{' '}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {dataSourceStatus.currentSource}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleDataSourceChange('static')}
                      className={`px-3 py-1 text-sm rounded-full ${
                        dataSourceStatus.currentSource === 'static'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      📁 정적 파일만
                    </button>
                    <button
                      onClick={() => handleDataSourceChange('api')}
                      className={`px-3 py-1 text-sm rounded-full ${
                        dataSourceStatus.currentSource === 'api'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      🌐 API만
                    </button>
                    <button
                      onClick={() => handleDataSourceChange('auto')}
                      className={`px-3 py-1 text-sm rounded-full ${
                        dataSourceStatus.currentSource === 'auto'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      🔄 자동 전환
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>
                    • <strong>정적 파일만</strong>: public/data 폴더의 JSON 파일
                    사용 (개발/테스트용)
                  </p>
                  <p>
                    • <strong>API만</strong>: AWS Aurora/RDS 데이터베이스에서
                    조회 (운영용)
                  </p>
                  <p>
                    • <strong>자동 전환</strong>: 정적 파일 우선, 실패 시 API
                    사용 (기본값)
                  </p>
                </div>
              </div>

              {/* 시나리오 임포트 섹션 */}
              <div className="p-6 mb-8 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                  시나리오 임포트
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                      id="file-import"
                    />
                    <label
                      htmlFor="file-import"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {importing ? '임포트 중...' : 'JSON 파일 업로드'}
                    </label>
                  </div>
                  <Button
                    onClick={handleJsonImport}
                    disabled={importing}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {importing ? '동기화 중...' : '기존 JSON 동기화'}
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  game-script-tool에서 생성한 JSON 파일을 업로드하거나, 기존
                  JSON 파일을 DB와 동기화할 수 있습니다.
                </p>
              </div>

              {/* 시나리오 도구 링크 */}
              <div className="py-8 text-center">
                <div className="mb-4 text-6xl">🛠️</div>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  시나리오 작성 도구
                </h3>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  game-script-tool을 사용하여 새로운 시나리오를 작성하세요.
                </p>
                <Button
                  onClick={() => (window.location.href = '/admin/script-tool')}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  시나리오 도구 열기
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="p-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                팀 관리
              </h2>

              {/* 팀 생성 버튼 */}
              <div className="mb-6">
                <Button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  새 팀 생성
                </Button>
              </div>

              {/* 팀 목록 */}
              <div className="bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    팀 목록
                  </h3>
                </div>
                <div className="p-6">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    팀 목록 기능은 곧 추가될 예정입니다.
                  </div>
                </div>
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

          {activeTab === 'admins' && (
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                관리자 관리
              </h2>
              <AdminList
                teamId={user?.teamId}
                onCreateAdmin={() => setShowCreateAdminModal(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 팀 생성 모달 */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              새 팀 생성
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  팀 이름 *
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  placeholder="팀 이름을 입력하세요"
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  팀 설명
                </label>
                <textarea
                  value={newTeamDescription}
                  onChange={e => setNewTeamDescription(e.target.value)}
                  placeholder="팀에 대한 설명을 입력하세요 (선택사항)"
                  rows={3}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <Button
                onClick={() => {
                  setShowCreateTeamModal(false);
                  setNewTeamName('');
                  setNewTeamDescription('');
                }}
                className="bg-gray-600 hover:bg-gray-700"
                disabled={creatingTeam}
              >
                취소
              </Button>
              <Button
                onClick={createTeam}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={creatingTeam || !newTeamName.trim()}
                isLoading={creatingTeam}
              >
                생성
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 생성 모달 */}
      <CreateAdminModal
        isOpen={showCreateAdminModal}
        onClose={() => setShowCreateAdminModal(false)}
        onSuccess={() => {
          setShowCreateAdminModal(false);
          // 관리자 목록 새로고침은 AdminList 컴포넌트에서 자동으로 처리됨
        }}
      />
    </AdminLayout>
  );
};

export default AdminPage;
