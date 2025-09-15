import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

const TrainingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fire');

  // 탭 클릭 핸들러
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const tabs = [
    { id: 'fire', name: '화재', icon: '🔥', color: 'red' },
    { id: 'earthquake', name: '지진', icon: '🌍', color: 'yellow' },
    { id: 'emergency', name: '응급처치', icon: '🚑', color: 'green' },
    { id: 'trafficAccident', name: '교통사고', icon: '🚗', color: 'blue' },
  ];

  const fireContent = {
    title: '화재 대응 훈련',
    icon: '🔥',
    color: 'red',
    content: (
      <div className="space-y-8">
        {/* 훈련 개요 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            훈련 개요
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 dark:text-red-400 text-sm">
                  1
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  화재 감지 및 신고
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  화재 발생 시 즉시 감지하고 신고하는 방법을 학습합니다.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 dark:text-red-400 text-sm">
                  2
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  안전한 대피
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  연기와 불길을 피해 안전한 경로로 대피하는 방법을 익힙니다.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 dark:text-red-400 text-sm">
                  3
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  초기 진화
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  소화기 사용법과 초기 화재 진화 요령을 실습합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 훈련 시작 버튼 - FireScenarioPage로 연결 */}
        <div className="mt-24 text-center">
          <button
            onClick={() => navigate('/training/fire')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            화재 대응 훈련 시작하기
          </button>
        </div>
      </div>
    ),
  };

  const earthquakeContent = {
    title: '지진 대응 훈련',
    icon: '🌍',
    color: 'yellow',
    content: (
      <div className="space-y-8">
        {/* 훈련 개요 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            훈련 개요
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                  1
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  지진 감지 및 대응
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  지진 발생 시 즉시 대응하는 방법을 학습합니다.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                  2
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  안전한 대피
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  건물 붕괴 위험을 피해 안전한 장소로 대피하는 방법을 익힙니다.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                  3
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  생존 요령
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  지진 후 생존을 위한 필수 요령을 실습합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 훈련 시작 버튼 - EarthquakeScenarioPage로 연결 */}
        <div className="mt-24 text-center">
          <button
            onClick={() => navigate('/training/earthquake')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            지진 대응 훈련 시작하기
          </button>
        </div>
      </div>
    ),
  };

  const emergencyContent = {
    title: '응급처치 훈련',
    icon: '🚑',
    color: 'green',
    content: (
      <div className="space-y-8">
        {/* 훈련 개요 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            훈련 개요
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 dark:text-green-400 text-sm">
                  1
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  심폐소생술 (CPR)
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  심정지 환자에 대한 심폐소생술을 올바르게 수행하는 방법을
                  학습합니다.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 dark:text-green-400 text-sm">
                  2
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  지혈 응급처치
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  출혈 상황에서 적절한 지혈 방법을 익힙니다.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 dark:text-green-400 text-sm">
                  3
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  응급상황 대응
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  다양한 응급상황에 대한 대응 방법을 실습합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 훈련 시작 버튼 - EmergencyFirstAidScenarioPage로 연결 */}
        <div className="mt-24 text-center">
          <button
            onClick={() => navigate('/training/first-aid')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            응급처치 훈련 시작하기
          </button>
        </div>
      </div>
    ),
  };

  const trafficAccidentContent = {
    title: '교통사고 대응 훈련',
    icon: '🚗',
    color: 'blue',
    content: (
      <div className="space-y-8">
        {/* 훈련 개요 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            훈련 개요
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  1
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  사고 현장 안전 확보
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  교통사고 발생 시 현장 안전을 확보하고 2차 사고를 방지하는
                  방법을 학습합니다.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  2
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  응급 신고 및 구조
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  신속한 신고와 부상자 구조를 위한 올바른 절차를 익힙니다.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  3
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  응급처치 및 대응
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  교통사고 부상자에 대한 응급처치와 상황별 대응 방법을
                  실습합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 훈련 시작 버튼 - TrafficAccidentScenarioPage로 연결 */}
        <div className="mt-24 text-center">
          <button
            onClick={() => navigate('/training/traffic-accident')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            교통사고 대응 훈련 시작하기
          </button>
        </div>
      </div>
    ),
  };

  const contentMap = {
    fire: fireContent,
    earthquake: earthquakeContent,
    emergency: emergencyContent,
    trafficAccident: trafficAccidentContent,
  };

  const currentContent = contentMap[activeTab as keyof typeof contentMap];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 페이지 헤더 */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              훈련하기
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
              다양한 재난 상황에 대한 대응 방법을 실전 훈련을 통해 학습하고
              실력을 향상시킬 수 있습니다.
            </p>
          </div>

          {/* 메인 콘텐츠 영역 - 7:3 비율 */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            {/* 좌측 훈련 콘텐츠 섹션 (7/10) */}
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
                    {currentContent.title}에 대한 상세한 정보를 확인하고 훈련을
                    시작할 수 있습니다.
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
                  훈련 가이드
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      🔥 화재
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 화재 감지 및 신고 방법</li>
                      <li>• 안전한 대피 경로 선택</li>
                      <li>• 소화기 사용법 및 초기 진화</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      🌍 지진
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 지진 발생 시 즉시 대응</li>
                      <li>• 건물 붕괴 위험 회피</li>
                      <li>• 안전한 대피 및 생존 요령</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      🚑 응급처치
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 심폐소생술 (CPR) 실습</li>
                      <li>• 지혈 응급처치 방법</li>
                      <li>• 다양한 응급상황 대응</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      🚗 교통사고
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 사고 현장 안전 확보</li>
                      <li>• 응급 신고 및 구조</li>
                      <li>• 교통사고 응급처치</li>
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

export default TrainingPage;
