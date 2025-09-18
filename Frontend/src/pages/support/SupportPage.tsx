import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';

const SupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

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
        {/* FAQ 목록 */}
        <div className="space-y-4">
          {[
            {
              id: 1,
              category: '회원가입/로그인',
              question: '회원가입은 어떻게 하나요?',
              answer:
                'Phoenix 재난훈련 시스템에 가입하려면 먼저 팀 관리자로부터 팀 코드를 받아야 합니다. 팀 코드를 받으신 후 홈페이지 상단의 "회원가입" 버튼을 클릭하여 개인정보를 입력하고 팀 코드를 입력하시면 됩니다. 가입 과정에서 이메일 인증이 필요하며, 인증 완료 후 즉시 서비스를 이용하실 수 있습니다.',
            },
            {
              id: 2,
              category: '훈련 관련',
              question: '훈련은 어떻게 시작하나요?',
              answer:
                '로그인 후 메인 대시보드에서 "훈련 시작하기" 버튼을 클릭하세요. 다양한 재난 시나리오 중에서 원하는 훈련을 선택할 수 있습니다. 각 시나리오는 지진, 화재, 교통사고, 응급처치 등으로 구성되어 있으며, 난이도별로 구분되어 있습니다. 훈련 시작 전 간단한 안전 수칙을 확인하고, 준비가 되면 "훈련 시작" 버튼을 눌러 실제 상황과 유사한 환경에서 훈련을 진행하세요.',
            },
            {
              id: 3,
              category: '훈련 관련',
              question: '훈련 점수는 어떻게 계산되나요?',
              answer:
                '훈련 점수는 정확도(40%), 속도(30%), 완성도(30%)의 가중치를 적용하여 계산됩니다. 정확도는 올바른 응답과 행동의 비율을, 속도는 제한 시간 내 완료 여부를, 완성도는 전체 시나리오 완주 여부를 평가합니다. 각 시나리오마다 다른 배점과 보너스 점수가 있으며, 연속으로 정답을 맞추면 콤보 보너스가 추가됩니다. 최종 점수는 100점 만점으로 표시되며, 80점 이상이면 우수, 60점 이상이면 보통, 60점 미만이면 재훈련을 권장합니다.',
            },
            {
              id: 4,
              category: '기술 지원',
              question: '모바일에서도 이용할 수 있나요?',
              answer:
                '네, Phoenix 재난훈련 시스템은 반응형 웹 디자인으로 제작되어 스마트폰, 태블릿, 데스크톱 등 모든 기기에서 이용 가능합니다. 모바일에서는 터치 인터페이스로 최적화되어 있으며, 훈련 중 발생하는 상황에 대한 선택지도 터치로 쉽게 선택할 수 있습니다. 최적의 경험을 위해 iOS Safari 14+, Android Chrome 90+ 이상의 최신 브라우저 사용을 권장하며, 인터넷 연결이 안정적인 환경에서 이용하시기 바랍니다.',
            },
            {
              id: 5,
              category: '훈련 관련',
              question: '훈련 중 문제가 발생했을 때 어떻게 해야 하나요?',
              answer:
                '훈련 중 기술적 문제나 오류가 발생하면 즉시 "일시정지" 버튼을 눌러 훈련을 중단하세요. 진행 상황은 자동으로 저장되므로 걱정하지 마세요. 문제 해결 후 "훈련 재개" 버튼을 눌러 이어서 진행할 수 있습니다. 만약 문제가 지속되면 훈련을 완전히 종료하고 고객지원팀에 문의하세요. 문의 시 훈련 ID와 발생한 오류 메시지를 함께 전달해주시면 빠른 해결이 가능합니다. 모든 훈련 기록은 서버에 안전하게 보관되므로 데이터 손실 걱정은 하지 않으셔도 됩니다.',
            },
          ].map(faq => (
            <div
              key={faq.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() =>
                  setOpenFaqId(openFaqId === faq.id ? null : faq.id)
                }
              >
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
                      className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                        openFaqId === faq.id ? 'rotate-180' : ''
                      }`}
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

              {/* 답변 영역 */}
              {openFaqId === faq.id && (
                <div className="px-6 pb-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="pt-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 추가 도움말 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            추가 도움이 필요하신가요?
          </h2>
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
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              문의하기
            </button>
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

        {/* 응답 시간 안내 */}
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
                      <li>• 빠른 문제 해결 방법 안내</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      💬 문의
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 온라인 문의 양식 작성</li>
                      <li>• 문의 유형별 분류</li>
                      <li>• 응답 시간 안내 및 추적</li>
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
