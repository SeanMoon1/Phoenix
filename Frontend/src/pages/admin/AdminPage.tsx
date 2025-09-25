import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui';
import {
  trainingApi,
  scenarioApi,
  trainingResultApi,
  adminApi,
  apiClient,
} from '../../services/api';
import { Icon } from '../../utils/icons';
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

// interface TeamMemberStats {
//   userId: number;
//   userName: string;
//   userCode: string;
//   totalTrainings: number;
//   totalScore: number;
//   averageScore: number;
//   bestScore: number;
//   currentLevel: number;
//   currentTier: string;
//   lastTrainingAt?: Date;
// }

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'scripts' | 'approval' | 'users' | 'training' | 'teams' | 'admins'
  >('training');
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  // const [memberStats, setMemberStats] = useState<TeamMemberStats[]>([]);
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
  const [adminRefreshTrigger, setAdminRefreshTrigger] = useState(0);
  const [downloadingExcel, setDownloadingExcel] = useState<number | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState<number | null>(
    null
  );

  // 시나리오 생성 관련 상태
  const [showCreateScenarioModal, setShowCreateScenarioModal] = useState(false);
  const [newScenarioTitle, setNewScenarioTitle] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');
  const [newScenarioDisasterType, setNewScenarioDisasterType] = useState('');
  const [newScenarioRiskLevel, setNewScenarioRiskLevel] = useState('');
  const [newScenarioOccurrenceCondition, setNewScenarioOccurrenceCondition] =
    useState('');
  const [creatingScenario, setCreatingScenario] = useState(false);

  // 사용자 관리 관련 상태
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 승인관리 관련 상태
  const [pendingScenarios, setPendingScenarios] = useState<any[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const { user } = useAuthStore();

  // 파일 다운로드 함수
  const handleDownloadTeamFile = async (
    teamId: number,
    format: 'excel' | 'pdf'
  ) => {
    try {
      setDownloadingExcel(teamId);
      const response = await apiClient.get(
        `/excel-export/team/${teamId}/training-results`,
        {
          responseType: 'blob',
          params: { format },
        }
      );
      const blob = response.data;

      // 파일명 생성
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const fileName = `팀훈련결과_${teamId}_${dateStr}.${extension}`;

      // Blob을 다운로드 링크로 변환
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(
        `${format === 'excel' ? '엑셀' : 'PDF'} 파일이 다운로드되었습니다.`
      );
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    } finally {
      setDownloadingExcel(null);
      setShowDownloadModal(null);
    }
  };

  // 관리자 권한 체크
  if (
    !user?.isAdmin &&
    user?.adminLevel !== 'SUPER_ADMIN' &&
    user?.adminLevel !== 'TEAM_ADMIN'
  ) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="mb-4 text-6xl">🚫</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              접근 권한이 없습니다
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              관리자 권한이 필요한 페이지입니다.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // 권한에 따른 탭 필터링
  const getAvailableTabs = () => {
    const allTabs = [
      {
        id: 'training',
        label: '훈련 관리',
        icon: <Icon type="trophy" category="ui" className="text-lg" />,
      },
      {
        id: 'teams',
        label: '팀 관리',
        icon: <Icon type="user" category="ui" className="text-lg" />,
      },
      {
        id: 'scripts',
        label: '시나리오 관리',
        icon: <Icon type="user" category="ui" className="text-lg" />,
      },
      {
        id: 'approval',
        label: '승인 관리',
        icon: <Icon type="success" category="status" className="text-lg" />,
      },
      {
        id: 'users',
        label: '사용자 관리',
        icon: <Icon type="user" category="ui" className="text-lg" />,
      },
      {
        id: 'admins',
        label: '관리자',
        icon: <Icon type="user" category="ui" className="text-lg" />,
      },
    ];

    // 슈퍼 관리자만 관리자 탭 접근 가능
    if (user?.adminLevel !== 'SUPER_ADMIN') {
      return allTabs.filter(tab => tab.id !== 'admins');
    }

    return allTabs;
  };

  const tabs = getAvailableTabs();

  // 팀 통계 로드 (관리자는 teamId가 없을 수 있음)
  useEffect(() => {
    if (user?.teamId && user.teamId > 0) {
      loadTeamStats();
      loadMemberStats();
    }
  }, [user?.teamId]);

  // 사용자 관리 데이터 로드
  useEffect(() => {
    loadTeams();
    loadUsers();
  }, []);

  // 승인관리 데이터 로드
  useEffect(() => {
    if (activeTab === 'approval') {
      loadPendingScenarios();
    }
  }, [activeTab]);

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
        // setMemberStats((response.data as any).memberStats || []);
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
      const response = await adminApi.createTeam({
        name: newTeamName,
        description: newTeamDescription,
      });

      if (response.success && response.data) {
        const teamData = response.data as any;
        alert(
          `팀이 성공적으로 생성되었습니다!\n\n팀 이름: ${teamData.name}\n팀 코드: ${teamData.teamCode}\n\n팀 코드를 복사하여 팀원들과 공유하세요.`
        );
        setShowCreateTeamModal(false);
        setNewTeamName('');
        setNewTeamDescription('');
        // 팀 목록 새로고침
        loadTeams();
      } else {
        alert(
          `팀 생성에 실패했습니다.\n${
            response.error || '알 수 없는 오류가 발생했습니다.'
          }`
        );
      }
    } catch (error) {
      console.error('팀 생성 실패:', error);
      alert('팀 생성 중 오류가 발생했습니다.');
    } finally {
      setCreatingTeam(false);
    }
  };

  // 시나리오 생성
  const createScenario = async () => {
    if (!newScenarioTitle.trim()) {
      alert('시나리오 제목을 입력해주세요.');
      return;
    }

    if (!newScenarioDisasterType) {
      alert('재난 유형을 선택해주세요.');
      return;
    }

    if (!newScenarioRiskLevel) {
      alert('위험도를 선택해주세요.');
      return;
    }

    setCreatingScenario(true);
    try {
      // 시나리오 코드 자동 생성 (예: SCEN_20241223_001)
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const scenarioCode = `SCEN_${dateStr}_001`;

      const response = await scenarioApi.create({
        teamId: user?.teamId || 1,
        scenarioCode,
        title: newScenarioTitle,
        disasterType: newScenarioDisasterType,
        description: newScenarioDescription,
        riskLevel: newScenarioRiskLevel,
        occurrenceCondition: newScenarioOccurrenceCondition,
        status: '임시저장',
        createdBy: user?.id || 1,
      });

      if (response.success && response.data) {
        alert('시나리오가 성공적으로 생성되었습니다!');
        setShowCreateScenarioModal(false);
        setNewScenarioTitle('');
        setNewScenarioDescription('');
        setNewScenarioDisasterType('');
        setNewScenarioRiskLevel('');
        setNewScenarioOccurrenceCondition('');
        // 통계 새로고침
        loadTeamStats();
        loadMemberStats();
      } else {
        const errorMessage =
          response.error || '알 수 없는 오류가 발생했습니다.';
        console.error('시나리오 생성 실패:', response);
        alert(
          `시나리오 생성에 실패했습니다.\n\n오류 내용: ${errorMessage}\n\n문제가 지속되면 관리자에게 문의하세요.`
        );
      }
    } catch (error) {
      console.error('시나리오 생성 실패:', error);
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';
      alert(
        `시나리오 생성 중 오류가 발생했습니다.\n\n오류 내용: ${errorMessage}\n\n문제가 지속되면 관리자에게 문의하세요.`
      );
    } finally {
      setCreatingScenario(false);
    }
  };

  // 사용자 관리 함수들
  const loadTeams = async () => {
    try {
      let response;

      if (user?.adminLevel === 'SUPER_ADMIN') {
        // 슈퍼 관리자: 모든 팀 조회 가능
        response = await adminApi.getTeams();
      } else if (user?.adminLevel === 'TEAM_ADMIN' && user?.teamId) {
        // 팀 관리자: 본인 팀만 조회 가능
        const allTeams = await adminApi.getTeams();
        if (allTeams.success && allTeams.data) {
          const userTeam = allTeams.data.filter(
            team => team.id === user.teamId
          );
          setTeams(userTeam);
          return;
        }
      } else {
        // 일반 사용자: 접근 불가
        setTeams([]);
        return;
      }

      if (response?.success && response.data) {
        setTeams(response.data);
      }
    } catch (error) {
      console.error('팀 목록 로드 실패:', error);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      let response;

      // 사용자 권한에 따라 다른 API 호출
      if (user?.adminLevel === 'SUPER_ADMIN') {
        // 총괄 관리자: 모든 사용자 조회 가능
        response = selectedTeamId
          ? await adminApi.getUsersByTeam(selectedTeamId)
          : await adminApi.getUsers();
      } else if (user?.adminLevel === 'TEAM_ADMIN' && user?.teamId) {
        // 팀 관리자: 본인 팀의 사용자만 조회 가능
        response = await adminApi.getUsersByTeam(user.teamId);
      } else {
        // 일반 사용자: 접근 불가
        setUsers([]);
        setLoadingUsers(false);
        return;
      }

      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleTeamChange = (teamId: number | null) => {
    setSelectedTeamId(teamId);
    loadUsers();
  };

  // 관리자 권한 수정 핸들러
  const handleFixPermissions = async () => {
    if (
      !confirm('초기 관리자 계정의 권한을 SUPER_ADMIN으로 수정하시겠습니까?')
    ) {
      return;
    }

    try {
      const response = await adminApi.fixAdminPermissions();
      if (response.success) {
        alert(
          '관리자 권한이 성공적으로 수정되었습니다!\n\n페이지를 새로고침하여 변경사항을 확인하세요.'
        );
        window.location.reload();
      } else {
        alert(`권한 수정에 실패했습니다: ${response.error}`);
      }
    } catch (error) {
      console.error('권한 수정 실패:', error);
      alert('권한 수정 중 오류가 발생했습니다.');
    }
  };

  // 승인관리 함수들
  const loadPendingScenarios = async () => {
    setLoadingScenarios(true);
    try {
      const response = await scenarioApi.getAll();
      if (response.success && response.data) {
        // 승인 대기 중인 시나리오만 필터링
        const pending = response.data.filter(
          (scenario: any) =>
            scenario.status === '승인대기' || scenario.status === '임시저장'
        );
        setPendingScenarios(pending);
      }
    } catch (error) {
      console.error('승인 대기 시나리오 로드 실패:', error);
    } finally {
      setLoadingScenarios(false);
    }
  };

  const approveScenario = async (scenarioId: number) => {
    try {
      const response = await scenarioApi.update(scenarioId, {
        status: '활성화',
        approvalComment: '관리자 승인 완료',
      });

      if (response.success) {
        alert('시나리오가 승인되었습니다.');
        loadPendingScenarios();
      } else {
        alert('시나리오 승인에 실패했습니다.');
      }
    } catch (error) {
      console.error('시나리오 승인 실패:', error);
      alert('시나리오 승인 중 오류가 발생했습니다.');
    }
  };

  const rejectScenario = async (scenarioId: number) => {
    const reason = prompt('거부 사유를 입력하세요:');
    if (!reason) return;

    try {
      const response = await scenarioApi.update(scenarioId, {
        status: '비활성화',
        approvalComment: `거부 사유: ${reason}`,
      });

      if (response.success) {
        alert('시나리오가 거부되었습니다.');
        loadPendingScenarios();
      } else {
        alert('시나리오 거부에 실패했습니다.');
      }
    } catch (error) {
      console.error('시나리오 거부 실패:', error);
      alert('시나리오 거부 중 오류가 발생했습니다.');
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

              {/* 시나리오 타입 생성 안내 */}
              <div className="mb-8">
                <div className="p-6 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Icon
                        type="info"
                        category="status"
                        className="text-2xl text-blue-500"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                        시나리오 타입 관리
                      </h3>
                      <p className="mt-2 text-blue-700 dark:text-blue-300">
                        새로운 훈련 타입을 생성할 수 있습니다. 타입을 생성하고
                        시나리오를 작성해주세요.
                      </p>
                      <div className="mt-4">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          💡 <strong>시나리오 생성 도구</strong>에서 구체적인
                          시나리오를 작성할 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 시나리오 타입 목록 */}
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  현재 시나리오 타입
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                    <div className="flex items-center">
                      <Icon
                        type="fire"
                        category="disaster"
                        className="text-2xl text-red-500 mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          화재
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Fire Training
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                    <div className="flex items-center">
                      <Icon
                        type="earthquake"
                        category="disaster"
                        className="text-2xl text-yellow-500 mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          지진
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Earthquake Training
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                    <div className="flex items-center">
                      <Icon
                        type="traffic"
                        category="disaster"
                        className="text-2xl text-blue-500 mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          교통사고
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Traffic Accident
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                    <div className="flex items-center">
                      <Icon
                        type="emergency"
                        category="disaster"
                        className="text-2xl text-green-500 mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          응급처치
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Emergency First Aid
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={() => setShowCreateScenarioModal(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Icon type="chart" category="ui" className="inline mr-2" />새
                  시나리오 타입 생성
                </Button>
                <Button
                  onClick={() => window.open('/admin/scripts', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Icon type="chart" category="ui" className="inline mr-2" />
                  시나리오 생성 도구
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
                  <Icon type="chart" category="ui" className="inline mr-2" />
                  시나리오 데이터 소스 설정
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
                  시나리오 작성 도구를 통해서 생성한 JSON 파일을 업로드하거나,
                  기존 JSON 파일을 DB와 동기화할 수 있습니다.
                </p>
              </div>

              {/* 시나리오 도구 링크 */}
              <div className="py-8 text-center">
                <div className="mb-4 text-6xl">🛠️</div>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  시나리오 작성 도구
                </h3>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  시나리오 작성 도구를 사용하여 새로운 시나리오를 작성하세요.
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

              {/* 팀 생성 버튼 - 슈퍼 관리자만 접근 가능 */}
              {user?.adminLevel === 'SUPER_ADMIN' && (
                <div className="flex mb-6 space-x-4">
                  <Button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    새 팀 생성
                  </Button>
                  <Button
                    onClick={handleFixPermissions}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    관리자 권한 수정
                  </Button>
                </div>
              )}

              {/* 팀 통계 섹션 */}
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  팀 통계
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-600 dark:text-gray-400">
                      로딩 중...
                    </div>
                  </div>
                ) : teamStats ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-800">
                          <Icon
                            type="chart"
                            category="ui"
                            className="text-2xl text-blue-500"
                          />
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
                          <Icon
                            type="success"
                            category="status"
                            className="text-2xl text-green-500"
                          />
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
                          <Icon
                            type="user"
                            category="ui"
                            className="text-2xl text-purple-500"
                          />
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
                          <Icon
                            type="trophy"
                            category="ui"
                            className="text-2xl text-orange-500"
                          />
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
                    <Button
                      onClick={() => {
                        loadTeamStats();
                      }}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      통계 새로고침
                    </Button>
                  </div>
                )}
              </div>

              {/* 팀 목록 */}
              <div className="bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    팀 목록
                  </h3>
                </div>
                <div className="p-6">
                  {teams.length > 0 ? (
                    <div className="space-y-4">
                      {teams.map(team => (
                        <div
                          key={team.id}
                          className="p-4 border border-gray-200 rounded-lg dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                {team.name}
                              </h4>
                              {team.description && (
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  {team.description}
                                </p>
                              )}
                              <div className="flex items-center mt-3 space-x-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    팀 코드:
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <code className="px-2 py-1 font-mono text-sm text-gray-800 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-200">
                                      {team.teamCode}
                                    </code>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          team.teamCode
                                        );
                                        alert(
                                          '팀 코드가 클립보드에 복사되었습니다!'
                                        );
                                      }}
                                      className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                                    >
                                      복사
                                    </button>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  생성일:{' '}
                                  {new Date(
                                    team.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => setShowDownloadModal(team.id)}
                                disabled={downloadingExcel === team.id}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                                size="sm"
                              >
                                {downloadingExcel === team.id ? (
                                  <>
                                    <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                    다운로드 중...
                                  </>
                                ) : (
                                  <>
                                    <Icon
                                      type="chart"
                                      category="ui"
                                      className="inline mr-2"
                                    />
                                    통계 다운로드
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="mb-4 text-4xl">👥</div>
                      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        생성된 팀이 없습니다
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        새 팀을 생성하여 시작하세요.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'approval' && (
            <div className="p-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                승인 관리
              </h2>

              {/* 승인 대기 시나리오 목록 */}
              <div className="bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    승인 대기 시나리오
                  </h3>
                </div>
                <div className="p-6">
                  {loadingScenarios ? (
                    <div className="py-8 text-center">
                      <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        승인 대기 시나리오를 불러오는 중...
                      </p>
                    </div>
                  ) : pendingScenarios.length > 0 ? (
                    <div className="space-y-4">
                      {pendingScenarios.map(scenario => (
                        <div
                          key={scenario.id}
                          className="p-4 border border-gray-200 rounded-lg dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                {scenario.title}
                              </h4>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {scenario.description}
                              </p>
                              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>재난 유형: {scenario.disasterType}</span>
                                <span>위험도: {scenario.riskLevel}</span>
                                <span>
                                  상태:
                                  <span
                                    className={`ml-1 px-2 py-1 text-xs rounded-full ${
                                      scenario.status === '승인대기'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    }`}
                                  >
                                    {scenario.status}
                                  </span>
                                </span>
                              </div>
                              {scenario.occurrenceCondition && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                  <strong>발생 조건:</strong>{' '}
                                  {scenario.occurrenceCondition}
                                </p>
                              )}
                            </div>
                            <div className="flex ml-4 space-x-2">
                              <Button
                                onClick={() => approveScenario(scenario.id)}
                                className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700"
                              >
                                승인
                              </Button>
                              <Button
                                onClick={() => rejectScenario(scenario.id)}
                                className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700"
                              >
                                거부
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="mb-4 text-4xl">✅</div>
                      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        승인 대기 시나리오가 없습니다
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        현재 승인을 기다리는 시나리오가 없습니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                사용자 관리
              </h2>

              {/* 팀 필터 - 총괄 관리자만 모든 팀 선택 가능 */}
              {user?.adminLevel === 'SUPER_ADMIN' && (
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    팀 필터
                  </label>
                  <select
                    value={selectedTeamId || ''}
                    onChange={e =>
                      handleTeamChange(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full max-w-xs px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">모든 사용자</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.teamCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 팀 관리자에게는 현재 팀 정보 표시 */}
              {user?.adminLevel === 'TEAM_ADMIN' && user?.teamId && (
                <div className="mb-6">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>현재 팀:</strong>{' '}
                      {teams.find(t => t.id === user.teamId)?.name ||
                        '알 수 없음'}
                      {teams.find(t => t.id === user.teamId)?.teamCode && (
                        <span className="ml-2 text-xs">
                          (코드:{' '}
                          {teams.find(t => t.id === user.teamId)?.teamCode})
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                      팀 관리자 권한으로 본인 팀의 사용자만 조회할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

              {/* 사용자 목록 */}
              <div className="bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    사용자 목록{' '}
                    {user?.adminLevel === 'SUPER_ADMIN' &&
                      selectedTeamId &&
                      `(${teams.find(t => t.id === selectedTeamId)?.name})`}
                    {user?.adminLevel === 'TEAM_ADMIN' &&
                      `(${teams.find(t => t.id === user.teamId)?.name})`}
                  </h3>
                </div>
                <div className="p-6">
                  {loadingUsers ? (
                    <div className="py-8 text-center">
                      <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        사용자 목록을 불러오는 중...
                      </p>
                    </div>
                  ) : users.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                              사용자
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                              팀
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                              이메일
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                              가입일
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                              상태
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                          {users.map(user => (
                            <tr
                              key={user.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 w-10 h-10">
                                    <div className="flex items-center justify-center w-10 h-10 font-medium text-white bg-blue-500 rounded-full">
                                      {user.name?.charAt(0) || 'U'}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {user.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {user.loginId}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {user.team?.name || '팀 없음'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.team?.teamCode || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                                {user.createdAt
                                  ? new Date(
                                      user.createdAt
                                    ).toLocaleDateString()
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                                  활성
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="mb-4 text-4xl">👥</div>
                      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        사용자가 없습니다
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedTeamId
                          ? '선택한 팀에 사용자가 없습니다.'
                          : '등록된 사용자가 없습니다.'}
                      </p>
                    </div>
                  )}
                </div>
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
                refreshTrigger={adminRefreshTrigger}
              />
            </div>
          )}
        </div>

        {/* 팀 생성 모달 */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                새 팀 생성
              </h3>

              <div className="p-3 mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 팀 코드는 자동으로 생성됩니다. 생성된 팀 코드를 팀원들과
                  공유하여 팀에 가입할 수 있습니다.
                </p>
              </div>

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

        {/* 시나리오 생성 모달 */}
        {showCreateScenarioModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                새 시나리오 생성
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    시나리오 제목 *
                  </label>
                  <input
                    type="text"
                    value={newScenarioTitle}
                    onChange={e => setNewScenarioTitle(e.target.value)}
                    placeholder="시나리오 제목을 입력하세요"
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    시나리오 설명
                  </label>
                  <textarea
                    value={newScenarioDescription}
                    onChange={e => setNewScenarioDescription(e.target.value)}
                    placeholder="시나리오 설명을 입력하세요"
                    rows={3}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    재난 유형 *
                  </label>
                  <input
                    type="text"
                    value={newScenarioDisasterType}
                    onChange={e => setNewScenarioDisasterType(e.target.value)}
                    placeholder="재난 유형을 입력하세요 (예: 화재, 지진, 홍수, 테러 등)"
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    위험도 *
                  </label>
                  <select
                    value={newScenarioRiskLevel}
                    onChange={e => setNewScenarioRiskLevel(e.target.value)}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">위험도를 선택하세요</option>
                    <option value="LOW">낮음</option>
                    <option value="MEDIUM">보통</option>
                    <option value="HIGH">높음</option>
                    <option value="VERY_HIGH">매우 높음</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    발생 조건
                  </label>
                  <input
                    type="text"
                    value={newScenarioOccurrenceCondition}
                    onChange={e =>
                      setNewScenarioOccurrenceCondition(e.target.value)
                    }
                    placeholder="발생 조건을 입력하세요 (선택사항)"
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={() => setShowCreateScenarioModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                >
                  취소
                </Button>
                <Button
                  onClick={createScenario}
                  disabled={creatingScenario}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingScenario ? '생성 중...' : '생성'}
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
            setAdminRefreshTrigger(prev => prev + 1); // 관리자 목록 새로고침
          }}
        />

        {/* 다운로드 형식 선택 모달 */}
        {showDownloadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-96 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                통계 다운로드 형식 선택
              </h3>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                팀 훈련 결과를 어떤 형식으로 다운로드하시겠습니까?
              </p>
              <div className="flex space-x-4">
                <Button
                  onClick={() =>
                    handleDownloadTeamFile(showDownloadModal, 'excel')
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Icon type="chart" category="ui" className="inline mr-2" />
                  엑셀 파일
                </Button>
                <Button
                  onClick={() =>
                    handleDownloadTeamFile(showDownloadModal, 'pdf')
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  📄 PDF 파일
                </Button>
              </div>
              <Button
                onClick={() => setShowDownloadModal(null)}
                className="w-full mt-4 bg-gray-500 hover:bg-gray-600"
              >
                취소
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPage;
