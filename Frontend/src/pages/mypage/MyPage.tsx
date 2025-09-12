import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { trainingResultApi, teamApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const MyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  const [isValidatingTeam, setIsValidatingTeam] = useState(false);
  const [teamValidationError, setTeamValidationError] = useState<string>('');
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const { user } = useAuthStore();

  // 사용자 통계 로드
  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id]);

  const loadUserStats = async () => {
    setLoading(true);
    try {
      const response = await trainingResultApi.getMyStats();
      if (response.success && response.data) {
        setUserStats(response.data);
      }
    } catch (error) {
      console.error('사용자 통계 로드 실패:', error);
    } finally {
      setLoading(false);
    }
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
        setTeamInfo(response.data.team || null);
        setTeamValidationError('');
      } else {
        setTeamInfo(null);
        setTeamValidationError(
          response.data?.message || '유효하지 않은 팀 코드입니다.'
        );
      }
    } catch (error: unknown) {
      setTeamInfo(null);
      setTeamValidationError('팀 코드 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidatingTeam(false);
    }
  };

  // 팀 가입
  const joinTeam = async () => {
    if (!teamInfo || !user?.id) return;

    try {
      const response = await teamApi.joinTeam(teamCode, user.id);
      if (response.success) {
        alert('팀에 성공적으로 가입되었습니다!');
        setTeamCode('');
        setTeamInfo(null);
        // 사용자 정보 새로고침
        window.location.reload();
      } else {
        alert('팀 가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('팀 가입 실패:', error);
      alert('팀 가입 중 오류가 발생했습니다.');
    }
  };

  // 탭 클릭 핸들러
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const tabs = [
    { id: 'records', name: '훈련기록', icon: '📊', color: 'indigo' },
    { id: 'scores', name: '점수조회', icon: '🏆', color: 'yellow' },
    { id: 'profile', name: '개인정보', icon: '👤', color: 'purple' },
    { id: 'team', name: '팀 관리', icon: '👥', color: 'blue' },
  ];

  const recordsContent = {
    title: '훈련 기록',
    icon: '📊',
    color: 'indigo',
    content: (
      <div className="space-y-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  총 훈련 횟수
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : userStats?.totalTrainings || 0}회
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg dark:bg-green-900/30">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  평균 점수
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : (userStats?.averageScore || 0).toFixed(1)}
                  점
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg dark:bg-yellow-900/30">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  현재 레벨
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Lv.{loading ? '...' : userStats?.currentLevel || 1}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  연속 훈련
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : userStats?.currentTier || '초급자'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
              <select className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <option>전체 훈련</option>
                <option>화재</option>
                <option>지진</option>
                <option>응급처치</option>
                <option>홍수</option>
              </select>
              <select className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <option>전체 기간</option>
                <option>최근 1주일</option>
                <option>최근 1개월</option>
                <option>최근 3개월</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="훈련 검색..."
                className="px-4 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
              <button className="px-4 py-2 text-white transition-colors duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700">
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 훈련 기록 목록 */}
        <div className="overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              훈련 기록 목록
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[
              {
                id: 1,
                title: '화재 훈련 - 주택 화재',
                type: '화재',
                date: '2024-01-15',
                score: 92,
                duration: '12분 30초',
                status: '완료',
              },
              {
                id: 2,
                title: '지진 훈련 - 사무실 지진',
                type: '지진',
                date: '2024-01-14',
                score: 88,
                duration: '8분 45초',
                status: '완료',
              },
              {
                id: 3,
                title: '응급처치 훈련 - 심폐소생술',
                type: '응급처치',
                date: '2024-01-13',
                score: 95,
                duration: '15분 20초',
                status: '완료',
              },
            ].map(record => (
              <div
                key={record.id}
                className="px-6 py-4 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {record.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.type === '화재'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : record.type === '지진'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : record.type === '응급처치'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {record.type}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>📅 {record.date}</span>
                      <span>⏱️ {record.duration}</span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.status === '완료'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {record.score}점
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {record.score >= 90
                          ? '우수'
                          : record.score >= 80
                          ? '양호'
                          : record.score >= 70
                          ? '보통'
                          : '개선필요'}
                      </div>
                    </div>
                    <button className="px-4 py-2 text-white transition-colors duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700">
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  };

  const scoresContent = {
    title: '점수 조회',
    icon: '🏆',
    color: 'yellow',
    content: (
      <div className="space-y-8">
        {/* 전체 점수 요약 */}
        <div className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
            전체 점수 요약
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                <span className="text-3xl font-bold text-white">85.2</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                전체 평균 점수
              </h3>
              <p className="text-gray-600 dark:text-gray-300">24회 훈련 기준</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600">
                <span className="text-3xl font-bold text-white">95</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                최고 점수
              </h3>
              <p className="text-gray-600 dark:text-gray-300">응급처치 훈련</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
                <span className="text-3xl font-bold text-white">76</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                최저 점수
              </h3>
              <p className="text-gray-600 dark:text-gray-300">홍수 훈련</p>
            </div>
          </div>
        </div>

        {/* 훈련 유형별 점수 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 화재 점수 */}
          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 mr-4 bg-red-100 rounded-lg dark:bg-red-900/30">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  화재
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  평균 점수: 87.5점
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  주택 화재
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  92점
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-red-500 rounded-full"
                  style={{ width: '92%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* 지진 점수 */}
          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 mr-4 bg-yellow-100 rounded-lg dark:bg-yellow-900/30">
                <span className="text-2xl">🌍</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  지진
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  평균 점수: 88.0점
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  사무실 지진
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  88점
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-yellow-500 rounded-full"
                  style={{ width: '88%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* 응급처치 점수 */}
          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 mr-4 bg-green-100 rounded-lg dark:bg-green-900/30">
                <span className="text-2xl">🚑</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  응급처치
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  평균 점수: 91.7점
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  심폐소생술
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  95점
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: '95%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* 홍수 점수 */}
          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 mr-4 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                <span className="text-2xl">🌊</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  홍수
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  평균 점수: 76.0점
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  지하공간 침수
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  76점
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: '76%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  const profileContent = {
    title: '개인정보',
    icon: '👤',
    color: 'purple',
    content: (
      <div className="space-y-8">
        {/* 기본 정보 */}
        <div className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            기본 정보
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                이름
              </label>
              <input
                type="text"
                defaultValue="김철수"
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일
              </label>
              <input
                type="email"
                defaultValue="kimcheolsu@example.com"
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                전화번호
              </label>
              <input
                type="tel"
                defaultValue="010-1234-5678"
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                소속 팀
              </label>
              <input
                type="text"
                defaultValue="안전관리팀"
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button className="px-6 py-2 text-white transition-colors duration-200 bg-purple-600 rounded-lg hover:bg-purple-700">
              정보 수정
            </button>
          </div>
        </div>

        {/* 훈련 통계 */}
        <div className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            훈련 통계
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full dark:bg-blue-900/30">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                총 훈련 횟수
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                24회
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full dark:bg-green-900/30">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                평균 점수
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                85.2점
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-yellow-100 rounded-full dark:bg-yellow-900/30">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                현재 레벨
              </h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                Lv.12
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full dark:bg-purple-900/30">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                연속 훈련
              </h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                7일
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  const teamContent = {
    title: '팀 관리',
    icon: '👥',
    color: 'blue',
    content: (
      <div className="space-y-8">
        {/* 현재 팀 정보 */}
        <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            현재 소속 팀
          </h3>
          {user?.teamId ? (
            <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-center text-green-800 dark:text-green-200">
                <span className="mr-2">✅</span>
                <div>
                  <div className="font-medium">팀에 소속되어 있습니다</div>
                  <div className="text-sm text-green-600 dark:text-green-300">
                    팀 ID: {user.teamId}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
              <div className="flex items-center text-yellow-800 dark:text-yellow-200">
                <span className="mr-2">⚠️</span>
                <div>
                  <div className="font-medium">아직 소속된 팀이 없습니다</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-300">
                    아래에서 팀 코드를 입력하여 팀에 가입하세요
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 팀 가입 */}
        {!user?.teamId && (
          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              팀 가입
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  팀 코드 입력
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="TEAM001"
                    value={teamCode}
                    onChange={e => {
                      setTeamCode(e.target.value);
                      validateTeamCode(e.target.value);
                    }}
                    className="flex-1 px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={joinTeam}
                    disabled={!teamInfo || isValidatingTeam}
                    className="px-4 py-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    가입
                  </button>
                </div>

                {/* 팀 코드 검증 상태 표시 */}
                {isValidatingTeam && (
                  <div className="flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400">
                    <div className="w-4 h-4 mr-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    팀 코드를 확인하는 중...
                  </div>
                )}

                {teamInfo && !isValidatingTeam && (
                  <div className="p-3 mt-2 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
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
                  <div className="flex items-center mt-2 text-sm text-red-600 dark:text-red-400">
                    <span className="mr-2">❌</span>
                    {teamValidationError}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 팀 정보 */}
        {user?.teamId && (
          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              팀 정보
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  팀 ID
                </label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user.teamId}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  사용자 코드
                </label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user.userCode || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    ),
  };

  const contentMap = {
    records: recordsContent,
    scores: scoresContent,
    profile: profileContent,
    team: teamContent,
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
                          ? `bg-${tab.color}-600 text-white shadow-lg`
                          : `bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-${tab.color}-100 dark:hover:bg-${tab.color}-900/30`
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
                    className={`w-20 h-20 bg-${currentContent.color}-100 dark:bg-${currentContent.color}-900/30 rounded-full flex items-center justify-center mb-4`}
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
