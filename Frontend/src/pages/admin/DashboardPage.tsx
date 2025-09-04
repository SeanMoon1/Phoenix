import React from 'react';
import { AnimatedText } from '../../components/ui';

// 통계 카드 컴포넌트
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  delay: number;
}> = ({ title, value, change, changeType, icon, delay }) => {
  const changeColor = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <AnimatedText
      delay={delay}
      animation="fadeIn"
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          <p className={`text-sm ${changeColor[changeType]} mt-1`}>{change}</p>
        </div>
        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </AnimatedText>
  );
};

// 최근 활동 아이템 컴포넌트
const ActivityItem: React.FC<{
  user: string;
  action: string;
  time: string;
  delay: number;
}> = ({ user, action, time, delay }) => (
  <AnimatedText
    delay={delay}
    animation="slideRight"
    className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
  >
    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
      {user.charAt(0)}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {user}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{action}</p>
    </div>
    <div className="text-xs text-gray-500 dark:text-gray-400">{time}</div>
  </AnimatedText>
);

// 훈련 진행률 차트 컴포넌트
const TrainingProgress: React.FC<{
  title: string;
  progress: number;
  total: number;
  delay: number;
}> = ({ title, progress, total, delay }) => {
  const percentage = (progress / total) * 100;

  return (
    <AnimatedText
      delay={delay}
      animation="fadeIn"
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {progress}/{total}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
        <div
          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {percentage.toFixed(1)}% 완료
      </p>
    </AnimatedText>
  );
};

const DashboardPage: React.FC = () => {
  const stats = [
    {
      title: '총 사용자',
      value: '0',
      change: '시스템 초기화',
      changeType: 'neutral' as const,
      icon: '👥',
      delay: 0,
    },
    {
      title: '활성 훈련',
      value: '0',
      change: '훈련 대기 중',
      changeType: 'neutral' as const,
      icon: '🎯',
      delay: 100,
    },
    {
      title: '완료된 시나리오',
      value: '0',
      change: '시나리오 준비 중',
      changeType: 'neutral' as const,
      icon: '✅',
      delay: 200,
    },
    {
      title: '평균 점수',
      value: '0.0',
      change: '데이터 수집 중',
      changeType: 'neutral' as const,
      icon: '📊',
      delay: 300,
    },
  ];

  const recentActivities = [
    {
      user: '시스템',
      action: '관리자 대시보드가 초기화되었습니다',
      time: '방금 전',
    },
    {
      user: '시스템',
      action: '재난훈련ON 시스템이 시작되었습니다',
      time: '1분 전',
    },
    {
      user: '관리자',
      action: '관리자 계정으로 로그인했습니다',
      time: '2분 전',
    },
  ];

  const trainingProgress = [
    { title: '화재 대응 훈련', progress: 0, total: 100, delay: 0 },
    { title: '지진 대응 훈련', progress: 0, total: 100, delay: 100 },
    { title: '홍수 대응 훈련', progress: 0, total: 100, delay: 200 },
    { title: '태풍 대응 훈련', progress: 0, total: 100, delay: 300 },
  ];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <AnimatedText delay={0} animation="fadeIn">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            관리자 대시보드
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            재난훈련ON 시스템 현황을 한눈에 확인하세요
          </p>
        </div>
      </AnimatedText>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* 메인 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 활동 */}
        <div className="lg:col-span-2">
          <AnimatedText delay={400} animation="fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                최근 활동
              </h2>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    {...activity}
                    delay={500 + index * 100}
                  />
                ))}
              </div>
            </div>
          </AnimatedText>
        </div>

        {/* 훈련 진행률 */}
        <div>
          <AnimatedText delay={400} animation="fadeIn">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                훈련 진행률
              </h2>
              {trainingProgress.map(training => (
                <TrainingProgress key={training.title} {...training} />
              ))}
            </div>
          </AnimatedText>
        </div>
      </div>

      {/* 빠른 액션 버튼 */}
      <AnimatedText delay={1000} animation="fadeIn">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            빠른 액션
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200">
              <span className="mr-2">➕</span>새 시나리오 추가
            </button>
            <button className="flex items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
              <span className="mr-2">👥</span>
              사용자 초대
            </button>
            <button className="flex items-center justify-center p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200">
              <span className="mr-2">📊</span>
              리포트 생성
            </button>
          </div>
        </div>
      </AnimatedText>
    </div>
  );
};

export default DashboardPage;
