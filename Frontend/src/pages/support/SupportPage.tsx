import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';

const SupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('faq');

  const tabs = [
    { id: 'faq', name: 'FAQ', icon: '❓', color: 'blue' },
    { id: 'contact', name: '문의', icon: '💬', color: 'green' },
  ];

  const faqContent = {
    title: '자주 묻는 질문',
    icon: '❓',
    color: 'blue',
    content: (
      <div className="space-y-8">
        {/* 검색 및 필터 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="질문을 검색하세요..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:w-64">
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>전체</option>
                <option>회원가입/로그인</option>
                <option>훈련 관련</option>
                <option>결제/구독</option>
                <option>기술 지원</option>
                <option>기타</option>
              </select>
            </div>
          </div>
        </div>

        {/* FAQ 목록 */}
        <div className="space-y-4">
          {[
            {
              id: 1,
              category: '회원가입/로그인',
              question: '회원가입은 어떻게 하나요?',
              answer:
                '홈페이지 상단의 "회원가입" 버튼을 클릭하신 후, 필요한 정보를 입력하시면 됩니다. 팀 코드가 필요하시면 팀 관리자에게 문의하세요.',
            },
            {
              id: 2,
              category: '훈련 관련',
              question: '훈련은 어떻게 시작하나요?',
              answer:
                '메인 메뉴의 "훈련하기"에서 원하는 훈련 유형을 선택하신 후, 시나리오를 선택하여 훈련을 시작할 수 있습니다.',
            },
            {
              id: 3,
              category: '훈련 관련',
              question: '훈련 점수는 어떻게 계산되나요?',
              answer:
                '훈련 점수는 정확도, 속도, 완성도를 종합하여 계산됩니다. 각 시나리오마다 다른 가중치가 적용됩니다.',
            },
            {
              id: 4,
              category: '기술 지원',
              question: '모바일에서도 이용할 수 있나요?',
              answer:
                '네, 모바일 브라우저에서도 이용 가능합니다. 최적의 경험을 위해 최신 브라우저 사용을 권장합니다.',
            },
          ].map(faq => (
            <div
              key={faq.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <button className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="ml-4">
                    <svg
                      className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* 추가 도움말 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            추가 도움이 필요하신가요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                이메일 문의
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                support@disaster-training.com
              </p>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200">
                이메일 보내기
              </button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                문의하기
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                온라인 문의 양식을 통해 문의하세요
              </p>
              <button
                onClick={() => setActiveTab('contact')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                문의하기
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  const contactContent = {
    title: '문의하기',
    icon: '💬',
    color: 'green',
    content: (
      <div className="space-y-8">
        {/* 문의 양식 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            문의 양식
          </h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                문의 유형 *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">문의 유형을 선택하세요</option>
                <option>회원가입/로그인 문제</option>
                <option>훈련 관련 문의</option>
                <option>결제/구독 문의</option>
                <option>기술적 문제</option>
                <option>서비스 개선 제안</option>
                <option>기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                제목 *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="문의 제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                문의 내용 *
              </label>
              <textarea
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="문의 내용을 자세히 입력해주세요."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              문의하기
            </button>
          </form>
        </div>

        {/* 연락처 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              연락처 정보
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 dark:text-green-400 text-sm">
                    📧
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    이메일
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    support@disaster-training.com
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 dark:text-green-400 text-sm">
                    ⏰
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    운영 시간
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    평일 09:00 - 18:00
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    토요일 09:00 - 13:00
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 dark:text-green-400 text-sm">
                    📞
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    전화
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    02-1234-5678
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              응답 시간 안내
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xs">
                    ✓
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-300">
                  일반 문의: 24시간 이내
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xs">
                    !
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-300">
                  긴급 문의: 4시간 이내
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-xs">
                    🔧
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-300">
                  기술 문의: 48시간 이내
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  const contentMap = {
    faq: faqContent,
    contact: contactContent,
  };

  const currentContent = contentMap[activeTab as keyof typeof contentMap];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 페이지 헤더 */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              고객지원
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
              궁금한 점이나 문제가 있으시면 언제든지 문의해주세요. 빠르고 정확한
              답변을 드리겠습니다.
            </p>
          </div>

          {/* 메인 콘텐츠 영역 - 7:3 비율 */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            {/* 좌측 고객지원 콘텐츠 섹션 (7/10) */}
            <div className="lg:col-span-7">
              {/* 탭 네비게이션 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-wrap gap-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
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
                  고객지원 가이드
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      ❓ FAQ
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 자주 묻는 질문과 답변 확인</li>
                      <li>• 카테고리별 필터링 및 검색</li>
                      <li>• 빠른 문제 해결 방법 안내</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      💬 문의
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 온라인 문의 양식 작성</li>
                      <li>• 연락처 정보 및 운영시간</li>
                      <li>• 응답 시간 안내 및 추적</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      📞 연락처
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 이메일: support@disaster-training.com</li>
                      <li>• 전화: 02-1234-5678</li>
                      <li>• 운영시간: 평일 09:00-18:00</li>
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

export default SupportPage;
