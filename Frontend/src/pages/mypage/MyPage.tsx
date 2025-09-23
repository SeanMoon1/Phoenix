import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuthStore } from '../../stores/authStore';
import { teamApi, myPageApi } from '../../services/api';
import { Button } from '../../components/ui';
import type { TrainingResult, UserScenarioStats } from '../../types';

const MyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');
  const { user, setUser } = useAuthStore();
  const [teamCode, setTeamCode] = useState('');
  const [isValidatingTeam, setIsValidatingTeam] = useState(false);
  const [teamValidationError, setTeamValidationError] = useState('');
  const [teamInfo, setTeamInfo] = useState<any>(null);

  // 실제 데이터 상태
  const [trainingRecords, setTrainingRecords] = useState<TrainingResult[]>([]);
  const [trainingStats, setTrainingStats] = useState<{
    totalTrainings: number;
    totalScore: number;
    averageScore: number;
    bestScore: number;
  } | null>(null);
  const [scenarioStats, setScenarioStats] = useState<UserScenarioStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로딩
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('🔍 사용자 데이터 로딩 시작:', { userId: user.id });

        // 병렬로 데이터 가져오기
        const [recordsResponse, statsResponse, scenarioResponse] =
          await Promise.all([
            myPageApi.getTrainingRecords(user.id),
            myPageApi.getTrainingStatistics(user.id),
            myPageApi.getScenarioStatistics(user.id),
          ]);

        console.log('📊 API 응답 결과:', {
          records: recordsResponse,
          stats: statsResponse,
          scenario: scenarioResponse,
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

        // 훈련 통계 처리
        if (statsResponse.success) {
          console.log('✅ 훈련 통계 로딩 성공:', statsResponse.data);
          setTrainingStats(statsResponse.data || null);
        } else {
          console.error('❌ 훈련 통계 로딩 실패:', statsResponse.error);
          // 통계 로딩 실패는 에러로 처리하지 않음 (기록이 없을 수 있음)
        }

        // 시나리오 통계 처리
        if (scenarioResponse.success) {
          console.log(
            '✅ 시나리오 통계 로딩 성공:',
            scenarioResponse.data?.length || 0
          );
          setScenarioStats(scenarioResponse.data || []);
        } else {
          console.error('❌ 시나리오 통계 로딩 실패:', scenarioResponse.error);
          // 시나리오 통계 로딩 실패는 에러로 처리하지 않음
        }
      } catch (err) {
        console.error('❌ 사용자 데이터 로딩 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

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
      const response = await teamApi.validateTeamCode(code);
      if (response.success && response.data?.valid) {
        setTeamInfo(response.data.team);
        setTeamValidationError('');
      } else {
        setTeamInfo(null);
        setTeamValidationError(
          response.data?.message || '유효하지 않은 팀 코드입니다.'
        );
      }
    } catch (error) {
      setTeamInfo(null);
      setTeamValidationError('팀 코드 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidatingTeam(false);
    }
  };

  // 팀 가입 처리
  const handleJoinTeam = async () => {
    if (!teamInfo) {
      setTeamValidationError('유효한 팀 코드를 입력해주세요.');
      return;
    }

    try {
      // TODO: 팀 가입 API 호출
      console.log('팀 가입:', teamInfo);
      // 성공 시 사용자 정보 업데이트
      if (user) {
        setUser({
          ...user,
          teamId: teamInfo.id,
        });
      }
      setTeamCode('');
      setTeamInfo(null);
    } catch (error) {
      console.error('팀 가입 실패:', error);
    }
  };

  const tabs = [
    {
      id: 'records',
      name: '훈련기록',
      icon: '📊',
      color: 'indigo',
      activeClass: 'bg-indigo-600',
      hoverClass: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
    },
    {
      id: 'scores',
      name: '점수조회',
      icon: '🏆',
      color: 'yellow',
      activeClass: 'bg-yellow-600',
      hoverClass: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
    },
    {
      id: 'profile',
      name: '개인정보',
      icon: '👤',
      color: 'purple',
      activeClass: 'bg-purple-600',
      hoverClass: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
    },
  ];

  const recordsContent = {
    title: '훈련 기록',
    icon: '📊',
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
                <div className="mb-2 text-lg text-red-500">⚠️</div>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : trainingRecords.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 text-4xl text-gray-400">📊</div>
                <p className="text-gray-600 dark:text-gray-300">
                  아직 훈련 기록이 없습니다.
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  훈련을 시작해보세요!
                </p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    💡 훈련을 완료하면 여기에 기록이 표시됩니다.
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                    팀에 소속되지 않아도 개인 훈련 기록을 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {trainingRecords.map(record => (
                <div
                  key={record.id}
                  className="px-6 py-4 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          훈련 기록 #{record.id}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                          시나리오 #{record.scenarioId}
                        </span>
                      </div>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>
                          📅 {new Date(record.completedAt).toLocaleDateString()}
                        </span>
                        <span>
                          ⏱️ {Math.floor((record.completionTime || 0) / 60)}분{' '}
                          {(record.completionTime || 0) % 60}초
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
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                          💬 {record.feedback}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
  };

  const scoresContent = {
    title: '점수 조회',
    icon: '🏆',
    color: 'yellow',
    iconBgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    content: (
      <div className="space-y-8">
        {/* 전체 점수 요약 */}
        <div className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
            전체 점수 요약
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-b-2 border-yellow-600 rounded-full animate-spin"></div>
                <span className="text-gray-600 dark:text-gray-300">
                  데이터를 불러오는 중...
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
          ) : !trainingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 text-4xl text-gray-400">🏆</div>
                <p className="text-gray-600 dark:text-gray-300">
                  아직 훈련 기록이 없습니다.
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  훈련을 시작해보세요!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                  <span className="text-3xl font-bold text-white">
                    {trainingStats.averageScore.toFixed(1)}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  전체 평균 점수
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {trainingStats.totalTrainings}회 훈련 기준
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600">
                  <span className="text-3xl font-bold text-white">
                    {trainingStats.bestScore}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  최고 점수
                </h3>
                <p className="text-gray-600 dark:text-gray-300">최고 기록</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
                  <span className="text-3xl font-bold text-white">
                    {trainingStats.totalScore}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  총 점수
                </h3>
                <p className="text-gray-600 dark:text-gray-300">누적 점수</p>
              </div>
            </div>
          )}
        </div>

        {/* 훈련 유형별 점수 */}
        {scenarioStats.length > 0 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {scenarioStats.map((stat, index) => {
              const typeInfo = {
                FIRE: {
                  icon: '🔥',
                  name: '화재',
                  color: 'red',
                  bgClass: 'bg-red-100 dark:bg-red-900/30',
                  progressClass: 'bg-red-500',
                },
                EARTHQUAKE: {
                  icon: '🌍',
                  name: '지진',
                  color: 'yellow',
                  bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
                  progressClass: 'bg-yellow-500',
                },
                EMERGENCY: {
                  icon: '🚑',
                  name: '응급처치',
                  color: 'green',
                  bgClass: 'bg-green-100 dark:bg-green-900/30',
                  progressClass: 'bg-green-500',
                },
                TRAFFIC: {
                  icon: '🚗',
                  name: '교통사고',
                  color: 'blue',
                  bgClass: 'bg-blue-100 dark:bg-blue-900/30',
                  progressClass: 'bg-blue-500',
                },
                UNKNOWN: {
                  icon: '❓',
                  name: '기타',
                  color: 'gray',
                  bgClass: 'bg-gray-100 dark:bg-gray-900/30',
                  progressClass: 'bg-gray-500',
                },
              };
              const type =
                typeInfo[stat.scenarioType as keyof typeof typeInfo] ||
                typeInfo.UNKNOWN;

              return (
                <div
                  key={index}
                  className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800"
                >
                  <div className="flex items-center mb-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 mr-4 ${type.bgClass} rounded-lg`}
                    >
                      <span className="text-2xl">{type.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {type.name} ({stat.scenarioType})
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        평균 점수: {stat.averageScore.toFixed(1)}점 | 완료 횟수:{' '}
                        {stat.completedCount}회
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        시나리오 유형
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stat.bestScore}점
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                      <div
                        className={`h-2 ${type.progressClass} rounded-full`}
                        style={{
                          width: `${Math.min(
                            (stat.averageScore / 100) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      총점: {stat.totalScore}점 | 최고점: {stat.bestScore}점 |
                      평균: {stat.averageScore.toFixed(1)}점
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ),
  };

  const profileContent = {
    title: '개인정보',
    icon: '👤',
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
                <div className="mb-2 text-lg text-red-500">⚠️</div>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : !user ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 text-4xl text-gray-400">👤</div>
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
                        validateTeamCode(e.target.value);
                      }}
                      className="flex-1 px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <Button
                      onClick={handleJoinTeam}
                      disabled={!teamInfo || isValidatingTeam}
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
          <div className="flex justify-end mt-6">
            <button className="px-6 py-2 text-white transition-colors duration-200 bg-purple-600 rounded-lg hover:bg-purple-700">
              정보 수정
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
                      📊 훈련기록
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li>• 나의 모든 훈련 기록을 확인</li>
                      <li>• 훈련 유형별 필터링 및 검색</li>
                      <li>• 상세한 훈련 결과 분석</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                      🏆 점수조회
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li>• 전체 및 유형별 점수 분석</li>
                      <li>• 성과 향상 추이 확인</li>
                      <li>• 개선점 및 권장사항 제공</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                      👤 개인정보
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
    </Layout>
  );
};

export default MyPage;
