import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuthStore } from '../../stores/authStore';
import { teamApi } from '../../services/api';
import { Button } from '../../components/ui';

const MyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');
  const { user, setUser } = useAuthStore();
  const [teamCode, setTeamCode] = useState('');
  const [isValidatingTeam, setIsValidatingTeam] = useState(false);
  const [teamValidationError, setTeamValidationError] = useState('');
  const [teamInfo, setTeamInfo] = useState<any>(null);

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
    { id: 'records', name: '훈련기록', icon: '📊', color: 'indigo' },
    { id: 'scores', name: '점수조회', icon: '🏆', color: 'yellow' },
    { id: 'profile', name: '개인정보', icon: '👤', color: 'purple' },
  ];

  const recordsContent = {
    title: '훈련 기록',
    icon: '📊',
    color: 'indigo',
    content: (
      <div className="space-y-8">
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
                title: '아파트 화재 대응',
                type: '화재',
                date: '2025-01-15',
                completion_time: 750, // 초 단위
                status: '완료',
                scenario_code: 'FIR001',
              },
              {
                id: 2,
                title: '지진 대피 훈련',
                type: '지진',
                date: '2025-01-14',
                completion_time: 525, // 초 단위
                status: '완료',
                scenario_code: 'EAR001',
              },
              {
                id: 3,
                title: '응급처치 기본',
                type: '응급처치',
                date: '2025-01-13',
                completion_time: 920, // 초 단위
                status: '완료',
                scenario_code: 'EME001',
              },
              {
                id: 4,
                title: '교통사고 대응',
                type: '교통사고',
                date: '2025-01-12',
                completion_time: 680, // 초 단위
                status: '완료',
                scenario_code: 'TRA001',
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
                      <span>
                        ⏱️ {Math.floor(record.completion_time / 60)}분{' '}
                        {record.completion_time % 60}초
                      </span>
                      <span className="text-xs text-gray-500">
                        코드: {record.scenario_code}
                      </span>
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
                <span className="text-3xl font-bold text-white">87.3</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                전체 평균 점수
              </h3>
              <p className="text-gray-600 dark:text-gray-300">15회 훈련 기준</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600">
                <span className="text-3xl font-bold text-white">92</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                최고 점수
              </h3>
              <p className="text-gray-600 dark:text-gray-300">응급처치 기본</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
                <span className="text-3xl font-bold text-white">86</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                최저 점수
              </h3>
              <p className="text-gray-600 dark:text-gray-300">교통사고 대응</p>
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
                  화재 (FIRE)
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  평균 점수: 87.0점 | 완료 횟수: 4회
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  아파트 화재 대응
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  87점
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-red-500 rounded-full"
                  style={{ width: '87%' }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                총점: 348점 | 최고점: 87점 | 총 소요시간: 50분
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
                  지진 (EARTHQUAKE)
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  평균 점수: 90.0점 | 완료 횟수: 3회
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  지진 대피 훈련
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  90점
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-yellow-500 rounded-full"
                  style={{ width: '90%' }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                총점: 270점 | 최고점: 90점 | 총 소요시간: 26분
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
                  응급처치 (EMERGENCY)
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  평균 점수: 92.0점 | 완료 횟수: 4회
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  응급처치 기본
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  92점
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: '92%' }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                총점: 368점 | 최고점: 92점 | 총 소요시간: 61분
              </div>
            </div>
          </div>

          {/* 교통사고 점수 */}
          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 mr-4 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                <span className="text-2xl">🚗</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  교통사고 (TRAFFIC)
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  평균 점수: 86.0점 | 완료 횟수: 4회
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  교통사고 대응
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  86점
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: '86%' }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                총점: 344점 | 최고점: 86점 | 총 소요시간: 45분
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
                defaultValue="김훈련"
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                로그인 ID
              </label>
              <input
                type="text"
                defaultValue="user001"
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일
              </label>
              <input
                type="email"
                defaultValue="user001@phoenix.com"
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
