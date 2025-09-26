import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuthStore } from '../../stores/authStore';
import { teamApi, myPageApi, userExpApi, api } from '../../services/api';
import { Button } from '../../components/ui';
import { Icon } from '../../utils/icons';
import type {
  TrainingResult,
  ScenarioTypeStatistics,
  ScenarioTypeInfo,
  User,
} from '../../types';

const MyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');
  const { user, setUser } = useAuthStore();
  const [teamCode, setTeamCode] = useState('');
  const [isValidatingTeam, setIsValidatingTeam] = useState(false);
  const [teamValidationError, setTeamValidationError] = useState('');
  const [teamInfo, setTeamInfo] = useState<any>(null);

  // 실제 데이터 상태
  const [trainingRecords, setTrainingRecords] = useState<TrainingResult[]>([]);
  const [scenarioTypeStats, setScenarioTypeStats] = useState<
    ScenarioTypeStatistics[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 회원 탈퇴 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<
    'confirm' | 'email' | 'verify' | 'complete'
  >('confirm');
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteCode, setDeleteCode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // 데이터 로딩 함수
  const loadUserData = async (userId?: number) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 사용자 데이터 로딩 시작:', { userId: targetUserId });

      // 병렬로 데이터 가져오기
      const [recordsResponse, statsResponse, scenarioTypeResponse] =
        await Promise.all([
          myPageApi.getTrainingRecords(targetUserId),
          myPageApi.getTrainingStatistics(targetUserId),
          myPageApi.getScenarioTypeStatistics(targetUserId),
        ]);

      console.log('📊 API 응답 결과:', {
        records: recordsResponse,
        stats: statsResponse,
        scenarioType: scenarioTypeResponse,
      });

      // 훈련 기록 처리
      if (recordsResponse.success) {
        console.log(
          '✅ 훈련 기록 로딩 성공:',
          recordsResponse.data?.length || 0
        );
        setTrainingRecords(recordsResponse.data || []);
      } else {
        console.error('❌ 훈련 기록 로딩 실패:', recordsResponse.error);
        setError(
          `훈련 기록을 불러오는데 실패했습니다: ${recordsResponse.error}`
        );
      }

      // 훈련 통계 처리 (참고용으로만 로딩)
      if (statsResponse.success) {
        console.log('✅ 훈련 통계 로딩 성공:', statsResponse.data);
      } else {
        console.error('❌ 훈련 통계 로딩 실패:', statsResponse.error);
        // 통계 로딩 실패는 에러로 처리하지 않음 (기록이 없을 수 있음)
      }

      // 시나리오 타입별 통계 처리
      if (scenarioTypeResponse.success) {
        console.log(
          '✅ 시나리오 타입별 통계 로딩 성공:',
          scenarioTypeResponse.data?.length || 0
        );
        setScenarioTypeStats(scenarioTypeResponse.data || []);
      } else {
        console.error(
          '❌ 시나리오 타입별 통계 로딩 실패:',
          scenarioTypeResponse.error
        );
        // 시나리오 타입별 통계 로딩 실패는 에러로 처리하지 않음
      }
    } catch (err) {
      console.error('❌ 사용자 데이터 로딩 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터 로딩
  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  // 탭 클릭 핸들러
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  // 팀 코드 검증
  const validateTeamCode = async (code: string) => {
    if (!code || code.length < 3) {
      setTeamInfo(null);
      setTeamValidationError('');
      return;
    }

    setIsValidatingTeam(true);
    setTeamValidationError('');

    try {
      console.log('🔍 팀 코드 검증 시작:', { teamCode: code });
      const response = await teamApi.validateTeamCode(code);
      console.log('🔍 팀 코드 검증 응답:', response);

      if (response.success && response.data?.valid) {
        console.log('✅ 팀 코드 검증 성공:', response.data.team);
        setTeamInfo(response.data.team);
        setTeamValidationError('');
      } else {
        console.log('❌ 팀 코드 검증 실패:', response.data?.message);
        setTeamInfo(null);
        setTeamValidationError(
          response.data?.message || '유효하지 않은 팀 코드입니다.'
        );
      }
    } catch (error) {
      console.error('❌ 팀 코드 검증 오류:', error);
      setTeamInfo(null);
      setTeamValidationError('팀 코드 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidatingTeam(false);
    }
  };

  // 사용자 정보 새로고침 함수
  const refreshUserData = async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 사용자 정보 새로고침 시작');
      // 사용자 프로필 정보 다시 가져오기
      const profileResponse = await api.get<User>(`/auth/profile`);
      if (profileResponse.success && profileResponse.data) {
        console.log('✅ 사용자 프로필 정보 업데이트:', profileResponse.data);
        setUser(profileResponse.data);

        // 팀 정보가 있으면 팀 정보도 로드
        if (profileResponse.data.teamId) {
          try {
            const teamResponse = await teamApi.getById(
              profileResponse.data.teamId
            );
            if (teamResponse.success && teamResponse.data) {
              console.log('✅ 팀 정보 로드 성공:', teamResponse.data);
              setTeamInfo(teamResponse.data);
            }
          } catch (teamError) {
            console.error('❌ 팀 정보 로드 실패:', teamError);
          }
        }
      }
    } catch (error) {
      console.error('❌ 사용자 정보 새로고침 실패:', error);
    }
  };

  // 팀 가입 처리
  const handleJoinTeam = async () => {
    if (!teamCode.trim() || !user) {
      setTeamValidationError('팀 코드를 입력해주세요.');
      return;
    }

    try {
      console.log('🔍 팀 가입 시작:', { userId: user.id, teamCode: teamCode });

      // 실제 팀 가입 API 호출 (Backend에서 팀 코드 검증 수행)
      const response = (await userExpApi.joinTeam(user.id, teamCode)) as any;
      console.log('🔍 팀 가입 API 응답:', response);

      console.log('🔍 응답 상세 분석:', {
        success: response.success,
        data: response.data,
        message: response.message,
        error: response.error,
      });

      if (response && response.success === true) {
        console.log('✅ 팀 가입 성공');
        console.log('🔍 업데이트할 사용자 데이터:', response.data);

        // 성공 시 사용자 정보 업데이트 - 백엔드에서 반환된 전체 사용자 정보 사용
        const updatedUser = {
          ...user,
          ...response.data, // 백엔드에서 반환된 전체 사용자 정보로 업데이트
        };

        console.log('🔍 업데이트된 사용자 정보:', updatedUser);
        setUser(updatedUser);
        setTeamCode('');
        setTeamInfo(null);
        setTeamValidationError('');

        alert('팀 가입이 완료되었습니다!');

        // 사용자 정보 새로고침 (팀 정보 포함)
        await refreshUserData();

        // 데이터 다시 로드
        setTimeout(async () => {
          await loadUserData(user.id);
        }, 500);
      } else {
        console.error('❌ 팀 가입 실패:', response?.error || '알 수 없는 오류');
        setTeamValidationError(response?.error || '팀 가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 팀 가입 오류:', error);
      setTeamValidationError('팀 가입 중 오류가 발생했습니다.');
    }
  };

  // 회원 탈퇴 관련 함수들
  const handleDeleteAccount = async () => {
    if (!user?.email) {
      setDeleteError('사용자 이메일을 찾을 수 없습니다.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await api.post('/auth/request-account-deletion', {
        email: user.email,
      });

      if (response.success) {
        setDeleteEmail(user.email);
        setDeleteStep('email');
      } else {
        setDeleteError(response.message || '탈퇴 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원 탈퇴 요청 오류:', error);
      setDeleteError('탈퇴 요청 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!deleteCode || deleteCode.length !== 6) {
      setDeleteError('6자리 인증 코드를 입력해주세요.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      // 인증 코드 검증
      const verifyResponse = await api.post('/auth/verify-deletion-code', {
        email: deleteEmail,
        code: deleteCode,
      });

      if (verifyResponse.success) {
        // 인증 성공 시 바로 최종 탈퇴 실행
        const deleteResponse = await api.post('/auth/delete-account', {
          email: deleteEmail,
          code: deleteCode,
        });

        if (deleteResponse.success) {
          setDeleteStep('complete');
          // 로그아웃 처리
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        } else {
          setDeleteError(deleteResponse.message || '회원 탈퇴에 실패했습니다.');
        }
      } else {
        setDeleteError(
          verifyResponse.message || '인증 코드가 일치하지 않습니다.'
        );
      }
    } catch (error) {
      console.error('회원 탈퇴 처리 오류:', error);
      setDeleteError('회원 탈퇴 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteStep('confirm');
    setDeleteEmail('');
    setDeleteCode('');
    setDeleteError('');
    setIsDeleting(false);
  };

  // 시나리오 타입 정보 정의
  // 시간을 시/분/초로 변환하는 함수
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${remainingSeconds}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${remainingSeconds}초`;
    } else {
      return `${remainingSeconds}초`;
    }
  };

  const getScenarioTypeInfo = (scenarioType: string): ScenarioTypeInfo => {
    const typeMap: Record<string, ScenarioTypeInfo> = {
      FIRE: {
        type: 'FIRE',
        name: '화재',
        icon: <Icon type="fire" category="disaster" />,
        color: 'red',
        bgClass: 'bg-red-100 dark:bg-red-900/30',
        progressClass: 'bg-red-500',
      },
      EARTHQUAKE: {
        type: 'EARTHQUAKE',
        name: '지진',
        icon: <Icon type="earthquake" category="disaster" />,
        color: 'yellow',
        bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
        progressClass: 'bg-yellow-500',
      },
      EMERGENCY: {
        type: 'EMERGENCY',
        name: '응급처치',
        icon: <Icon type="emergency" category="disaster" />,
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        progressClass: 'bg-green-500',
      },
      TRAFFIC: {
        type: 'TRAFFIC',
        name: '교통사고',
        icon: <Icon type="traffic" category="disaster" />,
        color: 'blue',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        progressClass: 'bg-blue-500',
      },
      FLOOD: {
        type: 'FLOOD',
        name: '홍수',
        icon: <Icon type="flood" category="disaster" />,
        color: 'cyan',
        bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
        progressClass: 'bg-cyan-500',
      },
      UNKNOWN: {
        type: 'UNKNOWN',
        name: '기타',
        icon: <Icon type="unknown" category="disaster" />,
        color: 'gray',
        bgClass: 'bg-gray-100 dark:bg-gray-900/30',
        progressClass: 'bg-gray-500',
      },
    };
    return typeMap[scenarioType] || typeMap.UNKNOWN;
  };

  const tabs = [
    {
      id: 'records',
      name: '훈련기록',
      icon: <Icon type="chart" category="ui" className="text-lg" />,
      color: 'indigo',
      activeClass: 'bg-indigo-600',
      hoverClass: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
    },
    {
      id: 'scores',
      name: '점수조회',
      icon: <Icon type="trophy" category="ui" className="text-lg" />,
      color: 'yellow',
      activeClass: 'bg-yellow-600',
      hoverClass: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
    },
    {
      id: 'profile',
      name: '개인정보',
      icon: <Icon type="user" category="ui" className="text-lg" />,
      color: 'purple',
      activeClass: 'bg-purple-600',
      hoverClass: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
    },
  ];

  const recordsContent = {
    title: '훈련 기록',
    icon: (
      <Icon
        type="chart"
        category="ui"
        className="text-indigo-600 dark:text-indigo-400"
      />
    ),
    color: 'indigo',
    iconBgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
    content: (
      <div className="space-y-8">
        {/* 훈련 기록 목록 */}
        <div className="overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              훈련 기록 목록
            </h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
                <span className="text-gray-600 dark:text-gray-300">
                  데이터를 불러오는 중...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-2 text-lg text-red-500">
                  <Icon type="warning" category="status" />
                </div>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : trainingRecords.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 text-4xl text-gray-400">
                  <Icon type="chart" category="ui" />
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  아직 훈련 기록이 없습니다.
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  훈련을 시작해보세요!
                </p>
                <div className="p-4 mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    💡 훈련을 완료하면 여기에 기록이 표시됩니다.
                  </p>
                  <p className="mt-1 text-xs text-blue-500 dark:text-blue-300">
                    팀에 소속되지 않아도 개인 훈련 기록을 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {trainingRecords.map(record => {
                // 시나리오 타입 정보 가져오기 (새로운 scenarioType 필드 사용)
                const scenarioType = record.scenarioType || 'UNKNOWN';
                const typeInfo = getScenarioTypeInfo(scenarioType);

                return (
                  <div
                    key={record.id}
                    className="px-6 py-4 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3 space-x-3">
                          <div
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${typeInfo.bgClass}`}
                          >
                            <span className="text-2xl">{typeInfo.icon}</span>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                              {typeInfo.name}
                            </h3>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                            시나리오 #{record.scenarioId}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <span className="flex items-center space-x-1">
                            <Icon
                              type="info"
                              category="status"
                              className="text-sm"
                            />
                            <span>
                              {new Date(
                                record.completedAt
                              ).toLocaleDateString()}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Icon
                              type="info"
                              category="status"
                              className="text-sm"
                            />
                            <span>
                              {Math.floor((record.completionTime || 0) / 60)}분{' '}
                              {(record.completionTime || 0) % 60}초
                            </span>
                          </span>
                          <span className="text-xs text-gray-500">
                            총점: {record.totalScore}점
                          </span>
                          <span className="text-xs text-gray-500">
                            정확도: {record.accuracyScore}점
                          </span>
                          <span className="text-xs text-gray-500">
                            속도: {record.speedScore}점
                          </span>
                        </div>
                        {record.feedback && (
                          <div className="p-2 mt-2 text-xs text-gray-600 rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                            <Icon
                              type="info"
                              category="status"
                              className="inline mr-1"
                            />
                            {record.feedback}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    ),
  };

  const scoresContent = {
    title: '점수 조회',
    icon: (
      <Icon
        type="trophy"
        category="ui"
        className="text-yellow-600 dark:text-yellow-400"
      />
    ),
    color: 'yellow',
    iconBgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    content: (
      <div className="space-y-8">
        {/* 시나리오 타입별 5가지 항목 통계 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-b-2 border-yellow-600 rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-300">
                통계 데이터를 불러오는 중...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-2 text-lg text-red-500">⚠️</div>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        ) : scenarioTypeStats.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 text-4xl text-gray-400">
                <Icon type="trophy" category="ui" />
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                아직 통계 데이터가 없습니다.
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                훈련을 완료하면 여기에 통계가 표시됩니다.
              </p>
              <div className="p-4 mt-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  💡 시나리오 타입별로 5가지 항목의 상세 통계를 확인할 수
                  있습니다.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              시나리오 타입별 상세 통계
            </h3>
            <div className="space-y-4">
              {scenarioTypeStats.map((stat, index) => {
                const typeInfo = getScenarioTypeInfo(stat.scenarioType);

                return (
                  <div
                    key={index}
                    className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      {/* 시나리오 타입 정보 */}
                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex items-center justify-center w-12 h-12 ${typeInfo.bgClass} rounded-lg`}
                        >
                          <span className="text-2xl">{typeInfo.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {typeInfo.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            총 {stat.totalAttempts}회 훈련 완료
                          </p>
                        </div>
                      </div>

                      {/* 통계 데이터 - 2x3 그리드 레이아웃 */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* 첫 번째 줄: 평균 점수, 정확도 */}
                        <div className="flex items-center space-x-4">
                          {/* 평균 점수 */}
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1 space-x-2">
                              <Icon
                                type="chart"
                                category="ui"
                                className="text-sm text-blue-500"
                              />
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                평균 점수
                              </span>
                            </div>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                              {stat.averageScore.toFixed(1)}점
                            </p>
                          </div>

                          {/* 정확도 */}
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1 space-x-2">
                              <Icon
                                type="success"
                                category="status"
                                className="text-sm text-green-500"
                              />
                              <span className="text-sm font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                                정확도
                              </span>
                            </div>
                            <p className="text-lg font-bold text-green-900 dark:text-green-100">
                              {stat.accuracyRate}%
                            </p>
                          </div>
                        </div>

                        {/* 두 번째 줄: 평균 시간, 최고 점수 */}
                        <div className="flex items-center space-x-4">
                          {/* 평균 시간 */}
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1 space-x-2">
                              <Icon
                                type="info"
                                category="status"
                                className="text-sm text-purple-500"
                              />
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400 whitespace-nowrap">
                                평균 시간
                              </span>
                            </div>
                            <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                              {formatTime(stat.averageTimeSpent)}
                            </p>
                          </div>

                          {/* 최고 점수 */}
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1 space-x-2">
                              <Icon
                                type="trophy"
                                category="ui"
                                className="text-sm text-yellow-500"
                              />
                              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400 whitespace-nowrap">
                                최고 점수
                              </span>
                            </div>
                            <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                              {stat.bestScore}점
                            </p>
                          </div>
                        </div>

                        {/* 세 번째 줄: 누적 점수 (중앙 정렬) */}
                        <div className="flex justify-center col-span-2">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1 space-x-2">
                              <Icon
                                type="chart"
                                category="ui"
                                className="text-sm text-indigo-500"
                              />
                              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                누적 점수
                              </span>
                            </div>
                            <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                              {stat.totalScore}점
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 마지막 훈련 정보 */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          마지막 훈련
                        </p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {new Date(stat.lastCompletedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    ),
  };

  const profileContent = {
    title: '개인정보',
    icon: (
      <Icon
        type="user"
        category="ui"
        className="text-purple-600 dark:text-purple-400"
      />
    ),
    color: 'purple',
    iconBgClass: 'bg-purple-100 dark:bg-purple-900/30',
    content: (
      <div className="space-y-8">
        {/* 기본 정보 */}
        <div className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            기본 정보
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-b-2 border-purple-600 rounded-full animate-spin"></div>
                <span className="text-gray-600 dark:text-gray-300">
                  데이터를 불러오는 중...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-2 text-lg text-red-500">
                  <Icon type="warning" category="status" />
                </div>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : !user ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 text-4xl text-gray-400">
                  <Icon type="user" category="ui" />
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  사용자 정보를 불러올 수 없습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  이름
                </label>
                <input
                  type="text"
                  defaultValue={user.name || ''}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  로그인 ID
                </label>
                <input
                  type="text"
                  defaultValue={user.loginId || ''}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  이메일
                </label>
                <input
                  type="email"
                  defaultValue={user.email || ''}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  사용자 레벨
                </label>
                <input
                  type="text"
                  value={`레벨 ${user.userLevel || 1} - ${
                    user.currentTier || '초급자'
                  }`}
                  disabled
                  className="w-full px-3 py-2 text-gray-500 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  소속 팀
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="팀 코드를 입력하세요 (예: TEAM001)"
                      value={teamCode}
                      onChange={e => {
                        setTeamCode(e.target.value);
                        // 팀 가입 성공 후에는 실시간 검증 비활성화
                        if (e.target.value.length >= 3) {
                          validateTeamCode(e.target.value);
                        } else {
                          setTeamValidationError('');
                          setTeamInfo(null);
                        }
                      }}
                      className="flex-1 px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <Button
                      onClick={handleJoinTeam}
                      disabled={!teamCode.trim() || isValidatingTeam}
                      className="px-4 py-2 text-white transition-colors duration-200 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      가입
                    </Button>
                  </div>

                  {/* 팀 코드 검증 상태 표시 */}
                  {isValidatingTeam && (
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <div className="w-4 h-4 mr-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                      팀 코드를 확인하는 중...
                    </div>
                  )}

                  {teamInfo && !isValidatingTeam && (
                    <div className="p-3 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                      <div className="flex items-center text-sm text-green-800 dark:text-green-200">
                        <span className="mr-2">✅</span>
                        <div>
                          <div className="font-medium">{teamInfo.name}</div>
                          {teamInfo.description && (
                            <div className="mt-1 text-xs text-green-600 dark:text-green-300">
                              {teamInfo.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {teamValidationError && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {teamValidationError}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  사용자 코드
                </label>
                <input
                  type="text"
                  value={user?.userCode || '자동 생성됨'}
                  disabled
                  className="w-full px-3 py-2 text-gray-500 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  사용자 코드는 시스템에서 자동으로 생성됩니다.
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-between mt-6">
            <button className="px-6 py-2 text-white transition-colors duration-200 bg-purple-600 rounded-lg hover:bg-purple-700">
              정보 수정
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-2 text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>
    ),
  };

  const contentMap = {
    records: recordsContent,
    scores: scoresContent,
    profile: profileContent,
  };

  const currentContent = contentMap[activeTab as keyof typeof contentMap];

  return (
    <Layout>
      <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* 페이지 헤더 */}
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              마이페이지
            </h1>
            <p className="max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              나의 훈련 기록, 점수, 개인정보를 한 곳에서 관리할 수 있습니다.
            </p>
          </div>

          {/* 메인 콘텐츠 영역 - 7:3 비율 */}
          <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-10">
            {/* 좌측 마이페이지 콘텐츠 섹션 (7/10) */}
            <div className="lg:col-span-7">
              {/* 탭 네비게이션 */}
              <div className="p-6 mb-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
                <div className="flex flex-wrap gap-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? `${tab.activeClass} text-white shadow-lg`
                          : `bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ${tab.hoverClass}`
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 선택된 탭의 콘텐츠 */}
              <div className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
                <div className="mb-8">
                  <div
                    className={`w-20 h-20 ${currentContent.iconBgClass} rounded-full flex items-center justify-center mb-4`}
                  >
                    <span className="text-4xl">{currentContent.icon}</span>
                  </div>
                  <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {currentContent.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    {currentContent.title}에 대한 상세한 정보를 확인하고 관리할
                    수 있습니다.
                  </p>
                </div>

                {/* 탭별 콘텐츠 */}
                {currentContent.content}
              </div>
            </div>

            {/* 우측 가이드 섹션 (3/10) */}
            <div className="lg:col-span-3">
              <div className="sticky self-start p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 top-8">
                <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                  마이페이지 가이드
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                      <Icon
                        type="chart"
                        category="ui"
                        className="inline mr-2"
                      />
                      훈련기록
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li>• 나의 모든 훈련 기록을 확인</li>
                      <li>• 훈련 유형별 필터링 및 검색</li>
                      <li>• 상세한 훈련 결과 분석</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                      <Icon
                        type="trophy"
                        category="ui"
                        className="inline mr-2"
                      />
                      점수조회
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li>• 전체 및 유형별 점수 분석</li>
                      <li>• 성과 향상 추이 확인</li>
                      <li>• 개선점 및 권장사항 제공</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                      <Icon type="user" category="ui" className="inline mr-2" />
                      개인정보
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li>• 기본 정보 수정 및 관리</li>
                      <li>• 훈련 통계 요약 확인</li>
                      <li>• 계정 설정 및 보안 관리</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 회원 탈퇴 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800">
            {deleteStep === 'confirm' && (
              <div>
                <div className="flex items-center mb-4">
                  <Icon
                    type="warning"
                    category="status"
                    className="mr-3 text-2xl text-red-500"
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    회원 탈퇴 확인
                  </h3>
                </div>
                <div className="mb-6">
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    정말로 회원 탈퇴를 진행하시겠습니까?
                  </p>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <h4 className="mb-2 font-semibold text-red-800 dark:text-red-200">
                      🚨 삭제되는 데이터
                    </h4>
                    <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                      <li>• 개인 정보 (이름, 이메일, 전화번호)</li>
                      <li>• 훈련 기록 및 성과</li>
                      <li>• 경험치 및 레벨</li>
                      <li>• 팀 정보 및 역할</li>
                      <li>• 시나리오 진행 기록</li>
                    </ul>
                    <p className="mt-2 text-sm font-semibold text-red-800 dark:text-red-200">
                      ⚠️ 모든 데이터는 영구적으로 삭제되며 복구가 불가능합니다.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={resetDeleteModal}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? '처리 중...' : '탈퇴 진행'}
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 'email' && (
              <div>
                <div className="flex items-center mb-4">
                  <Icon
                    type="success"
                    category="status"
                    className="mr-3 text-2xl text-green-500"
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    이메일 인증
                  </h3>
                </div>
                <div className="mb-6">
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    <strong>{deleteEmail}</strong>로 인증 코드가 전송되었습니다.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    이메일을 확인하고 6자리 인증 코드를 입력해주세요.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={resetDeleteModal}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => setDeleteStep('verify')}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    인증 코드 입력
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 'verify' && (
              <div>
                <div className="flex items-center mb-4">
                  <Icon
                    type="info"
                    category="status"
                    className="mr-3 text-2xl text-blue-500"
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    인증 코드 입력
                  </h3>
                </div>
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    인증 코드 (6자리)
                  </label>
                  <input
                    type="text"
                    value={deleteCode}
                    onChange={e =>
                      setDeleteCode(
                        e.target.value.replace(/\D/g, '').slice(0, 6)
                      )
                    }
                    placeholder="123456"
                    className="w-full px-3 py-2 font-mono text-lg text-center border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={6}
                  />
                  {deleteError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {deleteError}
                    </p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteStep('email')}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleVerifyCode}
                    disabled={isDeleting || deleteCode.length !== 6}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isDeleting ? '검증 중...' : '인증 확인'}
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 'complete' && (
              <div>
                <div className="flex items-center mb-4">
                  <Icon
                    type="success"
                    category="status"
                    className="mr-3 text-2xl text-green-500"
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    탈퇴 완료
                  </h3>
                </div>
                <div className="mb-6">
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    회원 탈퇴가 완료되었습니다.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    잠시 후 로그인 페이지로 이동합니다.
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => (window.location.href = '/login')}
                    className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    로그인 페이지로 이동
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyPage;
