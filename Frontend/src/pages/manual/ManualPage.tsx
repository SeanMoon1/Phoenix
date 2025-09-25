import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Icon } from '../../utils/icons';

const ManualPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fire');

  const tabs = [
    {
      id: 'fire',
      name: '화재',
      icon: <Icon type="fire" category="disaster" />,
      color: 'red',
    },
    {
      id: 'earthquake',
      name: '지진',
      icon: <Icon type="earthquake" category="disaster" />,
      color: 'yellow',
    },
    {
      id: 'emergency',
      name: '응급처치',
      icon: <Icon type="emergency" category="disaster" />,
      color: 'green',
    },
    {
      id: 'traffic',
      name: '교통사고',
      icon: <Icon type="traffic" category="disaster" />,
      color: 'blue',
    },
  ];

  const manualContent = {
    fire: {
      title: '화재 대응 메뉴얼',
      icon: <Icon type="fire" category="disaster" />,
      color: 'red',
      content: [
        {
          step: 1,
          title: '화재 감지 및 신고',
          description: '화재 발생 시 즉시 감지하고 신고하는 방법',
          details: [
            '화재 감지기 소리나 연기, 불꽃을 발견하면 즉시 119에 신고',
            '정확한 주소와 상황을 명확히 전달',
            '주변 사람들에게 화재 발생을 알림',
          ],
        },
        {
          step: 2,
          title: '안전한 대피',
          description: '연기와 불길을 피해 안전한 경로로 대피하는 방법',
          details: [
            '문 손잡이를 만져보고 뜨거우면 다른 출구 이용',
            '연기가 있다면 바닥에 엎드려서 기어가기',
            '엘리베이터 사용 금지, 계단 이용',
            '대피 시 문을 닫아 화재 확산 방지',
          ],
        },
        {
          step: 3,
          title: '초기 진화',
          description: '소화기 사용법과 초기 진화 요령',
          details: [
            '소화기 사용법: P.A.S.S (Pull, Aim, Squeeze, Sweep)',
            '화재가 작고 초기 단계일 때만 진화 시도',
            '진화 불가능하면 즉시 대피',
            '가스 밸브 차단',
          ],
        },
      ],
    },
    earthquake: {
      title: '지진 대응 메뉴얼',
      icon: <Icon type="earthquake" category="disaster" />,
      color: 'yellow',
      content: [
        {
          step: 1,
          title: '지진 감지 및 대응',
          description: '지진 발생 시 즉시 안전한 장소로 대피하는 방법',
          details: [
            '지진 발생 시 즉시 책상 아래나 안전한 곳으로 대피',
            '문이나 창문에서 멀리 떨어지기',
            '떨어지는 물건에 주의',
            '진동이 멈출 때까지 대피 장소에서 대기',
          ],
        },
        {
          step: 2,
          title: '안전한 대피',
          description: '건물 붕괴 위험을 피해 안전한 장소로 대피하는 방법',
          details: [
            '진동이 멈춘 후 안전한 장소로 대피',
            '엘리베이터 사용 금지',
            '계단을 이용하여 신속하게 대피',
            '건물 밖으로 나가서 넓은 공간으로 이동',
          ],
        },
        {
          step: 3,
          title: '생존 요령',
          description: '지진 후 생존을 위한 기본적인 요령과 준비물',
          details: [
            '응급구호품 준비 (물, 식량, 응급약품)',
            '가족과의 연락 방법 사전 약속',
            '지진 후 여진에 주의',
            '라디오로 정확한 정보 확인',
          ],
        },
      ],
    },
    emergency: {
      title: '응급처치 메뉴얼',
      icon: <Icon type="emergency" category="disaster" />,
      color: 'green',
      content: [
        {
          step: 1,
          title: '응급상황 판단',
          description:
            '응급상황을 정확히 판단하고 적절한 대응 방법을 선택하는 방법',
          details: [
            '의식 상태 확인 (의식 있음/없음)',
            '호흡 상태 확인',
            '출혈 여부 확인',
            '119 신고 및 응급의료서비스 요청',
          ],
        },
        {
          step: 2,
          title: '기본 응급처치',
          description: '심폐소생술, 지혈, 골절 대응 등 기본적인 응급처치 방법',
          details: [
            '심폐소생술: 30회 압박 후 2회 인공호흡',
            '지혈: 직접 압박법으로 출혈 부위 압박',
            '골절: 부목으로 고정 후 움직이지 않게 함',
            '화상: 찬물로 15-20분간 냉각',
          ],
        },
        {
          step: 3,
          title: '응급의료서비스 연계',
          description: '119 신고 및 응급의료서비스와의 연계 방법',
          details: [
            '119 신고 시 정확한 주소와 상황 전달',
            '환자 상태와 응급처치 내용 보고',
            '응급차량 접근 경로 안내',
            '의료진 도착까지 응급처치 지속',
          ],
        },
      ],
    },
    traffic: {
      title: '교통사고 대응 메뉴얼',
      icon: <Icon type="traffic" category="disaster" />,
      color: 'blue',
      content: [
        {
          step: 1,
          title: '교통사고 발생 시 초기 대응',
          description: '교통사고 발생 시 즉시 해야 할 기본 대응 방법',
          details: [
            '안전한 곳으로 차량을 이동하고 비상등 켜기',
            '119에 신고하고 정확한 위치와 상황 전달',
            '부상자 확인 및 응급처치 필요 여부 판단',
            '2차 사고 방지를 위한 삼각대 설치',
          ],
        },
        {
          step: 2,
          title: '부상자 응급처치',
          description: '교통사고 부상자에 대한 안전한 응급처치 방법',
          details: [
            '부상자를 함부로 움직이지 말고 전문가 도움 요청',
            '의식이 있는 경우 안정시키고 출혈 확인',
            '목이나 척추 부상 의심 시 움직임 최소화',
            '심폐소생술이 필요한 경우에만 시행',
          ],
        },
        {
          step: 3,
          title: '사고 처리 및 정리',
          description: '교통사고 후 필요한 절차와 정리 방법',
          details: [
            '경찰 신고 및 사고 현장 보존',
            '보험사 연락 및 사고 접수',
            '증거 수집 (사진 촬영, 목격자 확보)',
            '차량 견인 및 정리 작업',
          ],
        },
      ],
    },
  };

  const currentContent = manualContent[activeTab as keyof typeof manualContent];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 페이지 헤더 */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              행동메뉴얼
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
              다양한 재난 상황에 대한 체계적인 대응 방법을 학습하고 실전에
              적용할 수 있습니다.
            </p>
          </div>

          {/* 메인 콘텐츠 영역 - 7:3 비율 */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            {/* 좌측 메뉴얼 콘텐츠 섹션 (7/10) */}
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
                      <span className="text-lg leading-none">{tab.icon}</span>
                      <span className="text-lg leading-none">{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 선택된 탭의 메뉴얼 내용 */}
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
                    {currentContent.title}에 대한 상세한 대응 방법을 단계별로
                    안내합니다.
                  </p>
                </div>

                {/* 단계별 내용 */}
                <div className="space-y-8">
                  {currentContent.content.map((step, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-gray-300 dark:border-gray-600 pl-6"
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-12 h-12 bg-${currentContent.color}-100 dark:bg-${currentContent.color}-900/30 rounded-full flex items-center justify-center flex-shrink-0`}
                        >
                          <span
                            className={`text-${currentContent.color}-600 dark:text-${currentContent.color}-400 font-bold text-lg`}
                          >
                            {step.step}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {step.description}
                          </p>
                          <ul className="space-y-2">
                            {step.details.map((detail, detailIndex) => (
                              <li
                                key={detailIndex}
                                className="flex items-start space-x-2"
                              >
                                <span className="text-gray-400 dark:text-gray-500 mt-1">
                                  •
                                </span>
                                <span className="text-gray-700 dark:text-gray-300">
                                  {detail}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 우측 가이드 섹션 (3/10) */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8 self-start">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  메뉴얼 활용 가이드
                </h2>
                <div className="space-y-6">
                  {/* 재난 유형별 가이드 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Icon
                        type="fire"
                        category="disaster"
                        className="text-red-500"
                      />
                      화재 대응
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 화재 감지 시 즉시 119 신고</li>
                      <li>• 연기와 불길을 피해 안전한 경로로 대피</li>
                      <li>• 초기 진화 시 소화기 P.A.S.S 방법 활용</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Icon
                        type="earthquake"
                        category="disaster"
                        className="text-yellow-500"
                      />
                      지진 대응
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 지진 발생 시 즉시 책상 아래로 대피</li>
                      <li>• 진동이 멈춘 후 안전한 장소로 이동</li>
                      <li>• 가스 밸브 차단 및 전기 차단기 내리기</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Icon
                        type="emergency"
                        category="disaster"
                        className="text-green-500"
                      />
                      응급처치
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 의식 확인 후 119 신고</li>
                      <li>• 심폐소생술(CPR) 실시</li>
                      <li>• 자동제세동기(AED) 사용법 숙지</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Icon
                        type="traffic"
                        category="disaster"
                        className="text-blue-500"
                      />
                      교통사고
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• 사고 발생 시 즉시 안전한 곳으로 이동</li>
                      <li>• 119 신고 및 교통 정리</li>
                      <li>• 부상자 응급처치 및 병원 이송</li>
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

export default ManualPage;
