import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';

const MyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');

  // 탭 클릭 핸들러
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
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
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  총 훈련 횟수
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  15회
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  평균 점수
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  87.3점
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  현재 레벨
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Lv.8
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  연속 훈련
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  5일
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>전체 훈련</option>
                <option>화재</option>
                <option>지진</option>
                <option>응급처치</option>
                <option>홍수</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200">
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 훈련 기록 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
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
                accuracy_score: 85,
                speed_score: 90,
                total_score: 87,
                completion_time: 750, // 초 단위
                status: '완료',
                scenario_code: 'FIR001',
              },
              {
                id: 2,
                title: '지진 대피 훈련',
                type: '지진',
                date: '2025-01-14',
                accuracy_score: 92,
                speed_score: 88,
                total_score: 90,
                completion_time: 525, // 초 단위
                status: '완료',
                scenario_code: 'EAR001',
              },
              {
                id: 3,
                title: '응급처치 기본',
                type: '응급처치',
                date: '2025-01-13',
                accuracy_score: 95,
                speed_score: 90,
                total_score: 92,
                completion_time: 920, // 초 단위
                status: '완료',
                scenario_code: 'EME001',
              },
              {
                id: 4,
                title: '교통사고 대응',
                type: '교통사고',
                date: '2025-01-12',
                accuracy_score: 88,
                speed_score: 85,
                total_score: 86,
                completion_time: 680, // 초 단위
                status: '완료',
                scenario_code: 'TRA001',
              },
            ].map(record => (
              <div
                key={record.id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
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
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
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
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {record.total_score}점
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        정확도: {record.accuracy_score} | 속도:{' '}
                        {record.speed_score}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.total_score >= 90
                          ? '우수'
                          : record.total_score >= 80
                          ? '양호'
                          : record.total_score >= 70
                          ? '보통'
                          : '개선필요'}
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            전체 점수 요약
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">87.3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                전체 평균 점수
              </h3>
              <p className="text-gray-600 dark:text-gray-300">15회 훈련 기준</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">92</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                최고 점수
              </h3>
              <p className="text-gray-600 dark:text-gray-300">응급처치 기본</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">86</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                최저 점수
              </h3>
              <p className="text-gray-600 dark:text-gray-300">교통사고 대응</p>
            </div>
          </div>
        </div>

        {/* 훈련 유형별 점수 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 화재 점수 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4">
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  아파트 화재 대응
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  87점
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: '87%' }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                총점: 348점 | 최고점: 87점 | 총 소요시간: 50분
              </div>
            </div>
          </div>

          {/* 지진 점수 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mr-4">
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  지진 대피 훈련
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  90점
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: '90%' }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                총점: 270점 | 최고점: 90점 | 총 소요시간: 26분
              </div>
            </div>
          </div>

          {/* 응급처치 점수 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  응급처치 기본
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  92점
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: '92%' }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                총점: 368점 | 최고점: 92점 | 총 소요시간: 61분
              </div>
            </div>
          </div>

          {/* 교통사고 점수 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  교통사고 대응
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  86점
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            기본 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이름
              </label>
              <input
                type="text"
                defaultValue="김훈련"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                로그인 ID
              </label>
              <input
                type="text"
                defaultValue="user001"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이메일
              </label>
              <input
                type="email"
                defaultValue="user001@phoenix.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                defaultValue="010-1234-5678"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                소속 팀
              </label>
              <input
                type="text"
                defaultValue="기본 팀 (TEAM001)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                사용자 코드
              </label>
              <input
                type="text"
                defaultValue="USER001"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200">
              정보 수정
            </button>
          </div>
        </div>

        {/* 레벨업 시스템 정보 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            레벨업 시스템
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                현재 레벨
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Lv.8
              </p>
              <p className="text-sm text-gray-500">중급자</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                현재 경험치
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                1,250
              </p>
              <p className="text-sm text-gray-500">/ 1,500 (다음 레벨)</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                총 점수
              </h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                1,330
              </p>
              <p className="text-sm text-gray-500">누적 점수</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                연속 훈련
              </h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                5일
              </p>
              <p className="text-sm text-gray-500">최장 7일</p>
            </div>
          </div>

          {/* 레벨 진행도 바 */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                다음 레벨까지
              </span>
              <span className="text-sm text-gray-500">83%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: '83%' }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              250 경험치 더 필요 (약 2-3회 훈련)
            </p>
          </div>
        </div>

        {/* 훈련 통계 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            훈련 통계
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                총 훈련 횟수
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                15회
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                평균 점수
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                87.3점
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                완료 시나리오
              </h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                4개
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                마지막 훈련
              </h3>
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                2025-01-15
              </p>
            </div>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 페이지 헤더 */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              마이페이지
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
              나의 훈련 기록, 점수, 개인정보를 한 곳에서 관리할 수 있습니다.
            </p>
          </div>

          {/* 메인 콘텐츠 영역 - 7:3 비율 */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            {/* 좌측 마이페이지 콘텐츠 섹션 (7/10) */}
            <div className="lg:col-span-7">
              {/* 탭 네비게이션 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="mb-8">
                  <div
                    className={`w-20 h-20 bg-${currentContent.color}-100 dark:bg-${currentContent.color}-900/30 rounded-full flex items-center justify-center mb-4`}
                  >
                    <span className="text-4xl">{currentContent.icon}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8 self-start">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  마이페이지 가이드
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      📊 훈련기록
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 나의 모든 훈련 기록을 확인</li>
                      <li>• 훈련 유형별 필터링 및 검색</li>
                      <li>• 상세한 훈련 결과 분석</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      🏆 점수조회
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 전체 및 유형별 점수 분석</li>
                      <li>• 성과 향상 추이 확인</li>
                      <li>• 개선점 및 권장사항 제공</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      👤 개인정보
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
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
