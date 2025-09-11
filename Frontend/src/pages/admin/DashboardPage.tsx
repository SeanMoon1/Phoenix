import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui';

// Game Script Tool 컴포넌트들을 import
import ControlMenu from '../../../scripts/game-script-tool/src/Components/ControlMenu/ControlMenu';
import ScriptView from '../../../scripts/game-script-tool/src/Components/ScriptView';
import SceneIdSelector from '../../../scripts/game-script-tool/src/Components/UI/SceneIdSelector';
import NextSceneSelector from '../../../scripts/game-script-tool/src/Components/UI/NextSceneSelector';
import { useAppStateStore } from '../../../scripts/game-script-tool/src/Stores/atom';
import { useBlockListSelector } from '../../../scripts/game-script-tool/src/Stores/selector';
import type {
  User,
  ScriptBlock,
} from '../../../scripts/game-script-tool/src/types';
import {
  UserRole,
  ApprovalStatus,
} from '../../../scripts/game-script-tool/src/types';
import {
  loadBlockList,
  saveBlockList,
} from '../../../scripts/game-script-tool/src/Utils/api';
import { getNextAvailableSceneId } from '../../../scripts/game-script-tool/src/Utils/sceneIdGenerator';

const DashboardPage: React.FC = () => {
  const { setBlockList } = useBlockListSelector();
  const { appState, closeSceneForm } = useAppStateStore();
  const [activeTab, setActiveTab] = useState<string>('scenarios');

  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    sceneId: '',
    title: '',
    content: '',
    sceneScript: '',
    disasterType: 'fire',
    difficulty: 'medium',
    options: [
      { answerId: 'answer1', answer: '', reaction: '', nextId: '' },
      { answerId: 'answer2', answer: '', reaction: '', nextId: '' },
    ],
  });

  // 수정 모드 상태 관리
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);

  // 블록 리스트 상태
  const blockListState = useBlockListSelector();

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedBlockList = loadBlockList();
    if (savedBlockList.length > 0) {
      setBlockList(savedBlockList);
    }
  }, [setBlockList]);

  // 수정 모드일 때 기존 데이터를 폼에 채우기
  useEffect(() => {
    if (appState.modifySceneId && appState.modifySceneId !== editingSceneId) {
      const currentBlocks = loadBlockList();
      const blockToEdit = currentBlocks.find(
        block => block.sceneId === appState.modifySceneId
      );

      if (blockToEdit) {
        setFormData({
          sceneId: blockToEdit.sceneId,
          title: blockToEdit.title || '',
          content: blockToEdit.content || '',
          sceneScript: blockToEdit.sceneScript || '',
          disasterType: blockToEdit.disasterType || 'fire',
          difficulty: blockToEdit.difficulty || 'medium',
          options: blockToEdit.options?.map(option => ({
            answerId: option.answerId,
            answer: option.answer,
            reaction: option.reaction,
            nextId: option.nextId,
          })) || [
            { answerId: 'answer1', answer: '', reaction: '', nextId: '' },
          ],
        });
        setIsEditMode(true);
        setEditingSceneId(appState.modifySceneId);
      }
    }
  }, [appState.modifySceneId, editingSceneId]);

  // 새 시나리오 생성 시 자동으로 다음 사용 가능한 장면 ID 할당
  useEffect(() => {
    if (appState.isSceneFormOpened && !isEditMode && !formData.sceneId) {
      const currentBlocks = loadBlockList();
      const nextSceneId = getNextAvailableSceneId(
        currentBlocks.map((block: ScriptBlock) => block.sceneId)
      );
      setFormData(prev => ({
        ...prev,
        sceneId: nextSceneId,
      }));
    }
  }, [appState.isSceneFormOpened, isEditMode, formData.sceneId]);

  // 사용자 역할을 관리자로 고정
  const currentUser: User = {
    id: 'admin001',
    name: '시나리오 관리자',
    role: UserRole.ADMIN,
    user_level: 100,
    user_exp: 999999,
    total_score: 999999,
    completed_scenarios: 999,
    current_tier: '마스터',
    level_progress: 100.0,
    next_level_exp: 0,
    scenario_stats: {
      fire: { completed: 999, total_score: 999999, best_score: 100 },
      earthquake: { completed: 999, total_score: 999999, best_score: 100 },
      flood: { completed: 999, total_score: 999999, best_score: 100 },
      emergency: { completed: 999, total_score: 999999, best_score: 100 },
      chemical: { completed: 999, total_score: 999999, best_score: 100 },
      nuclear: { completed: 999, total_score: 999999, best_score: 100 },
      terrorism: { completed: 999, total_score: 999999, best_score: 100 },
      pandemic: { completed: 999, total_score: 999999, best_score: 100 },
      natural_disaster: {
        completed: 999,
        total_score: 999999,
        best_score: 100,
      },
      complex: { completed: 999, total_score: 999999, best_score: 100 },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 폼 입력 처리
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 선택지 입력 처리
  const handleOptionChange = (index: number, field: string, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  // answerId 재정렬 함수
  const reorderAnswerIds = (
    options: Array<{
      answerId: string;
      answer: string;
      reaction: string;
      nextId: string;
    }>
  ) => {
    return options.map((option, index) => ({
      ...option,
      answerId: `answer${index + 1}`,
    }));
  };

  // 선택지 추가
  const addOption = () => {
    const newAnswerId = `answer${formData.options.length + 1}`;
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { answerId: newAnswerId, answer: '', reaction: '', nextId: '' },
      ],
    }));
  };

  // 선택지 삭제
  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      const reorderedOptions = reorderAnswerIds(newOptions);
      setFormData(prev => ({ ...prev, options: reorderedOptions }));
    }
  };

  // 시나리오 저장
  const handleSaveScenario = () => {
    if (!formData.sceneId || !formData.title || !formData.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const currentBlocks = loadBlockList();
    let updatedBlocks: ScriptBlock[];

    if (isEditMode && editingSceneId) {
      updatedBlocks = currentBlocks.map(block =>
        block.sceneId === editingSceneId
          ? {
              ...block,
              title: formData.title,
              content: formData.content,
              sceneScript: formData.sceneScript,
              disasterType: formData.disasterType,
              difficulty: formData.difficulty,
              options: formData.options.map(option => ({
                answerId: option.answerId,
                answer: option.answer,
                reaction: option.reaction,
                nextId: option.nextId,
                points: {
                  speed: 0,
                  accuracy: 0,
                },
              })),
              updatedAt: new Date().toISOString(),
            }
          : block
      );
    } else {
      const newScriptBlock: ScriptBlock = {
        sceneId: formData.sceneId,
        title: formData.title,
        content: formData.content,
        sceneScript: formData.sceneScript,
        approvalStatus: ApprovalStatus.DRAFT,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name,
        order: Date.now(),
        disasterType: formData.disasterType,
        difficulty: formData.difficulty,
        options: formData.options.map(option => ({
          answerId: option.answerId,
          answer: option.answer,
          reaction: option.reaction,
          nextId: option.nextId,
          points: {
            speed: 0,
            accuracy: 0,
          },
        })),
      };
      updatedBlocks = [...currentBlocks, newScriptBlock];
    }

    saveBlockList(updatedBlocks);
    setBlockList(updatedBlocks);

    setFormData({
      sceneId: '',
      title: '',
      content: '',
      sceneScript: '',
      disasterType: 'fire',
      difficulty: 'medium',
      options: [
        { answerId: 'answer1', answer: '', reaction: '', nextId: '' },
        { answerId: 'answer2', answer: '', reaction: '', nextId: '' },
      ],
    });

    setIsEditMode(false);
    setEditingSceneId(null);
    closeSceneForm();

    alert(
      isEditMode ? '시나리오가 수정되었습니다!' : '시나리오가 저장되었습니다!'
    );
  };

  // 폼 취소
  const handleCancel = () => {
    setFormData({
      sceneId: '',
      title: '',
      content: '',
      sceneScript: '',
      disasterType: 'fire',
      difficulty: 'medium',
      options: [
        { answerId: 'answer1', answer: '', reaction: '', nextId: '' },
        { answerId: 'answer2', answer: '', reaction: '', nextId: '' },
      ],
    });
    setIsEditMode(false);
    setEditingSceneId(null);
    closeSceneForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            관리자페이지
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            재난 대응 훈련 시나리오를 생성하고 관리할 수 있는 통합 관리
            시스템입니다.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'scenarios'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              <span className="text-xl">📚</span>
              <span>시나리오 관리</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              <span className="text-xl">👥</span>
              <span>이용자 관리</span>
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'statistics'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              <span className="text-xl">📊</span>
              <span>통계</span>
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'tools'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              <span className="text-xl">🛠️</span>
              <span>도구</span>
            </button>
          </div>
        </div>
        {activeTab === 'statistics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 transition-all duration-300 transform bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-2 dark:border-gray-600 h-full w-full flex flex-col">
                <div className="text-center flex flex-col h-full">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl">
                    📚
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                    총 시나리오
                  </h3>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 flex-grow flex items-center justify-center">
                    {blockListState.blockList.length}
                  </p>
                </div>
              </div>

              <div className="p-6 transition-all duration-300 transform bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-2 dark:border-gray-600 h-full w-full flex flex-col">
                <div className="text-center flex flex-col h-full">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl">
                    ✅
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                    완료된 시나리오
                  </h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 flex-grow flex items-center justify-center">
                    {
                      blockListState.blockList.filter(
                        (block: ScriptBlock) =>
                          block.approvalStatus === ApprovalStatus.APPROVED
                      ).length
                    }
                  </p>
                </div>
              </div>

              <div className="p-6 transition-all duration-300 transform bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-2 dark:border-gray-600 h-full w-full flex flex-col">
                <div className="text-center flex flex-col h-full">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl">
                    ⏳
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                    검토 중
                  </h3>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 flex-grow flex items-center justify-center">
                    {
                      blockListState.blockList.filter(
                        (block: ScriptBlock) =>
                          block.approvalStatus === ApprovalStatus.PENDING
                      ).length
                    }
                  </p>
                </div>
              </div>

              <div className="p-6 transition-all duration-300 transform bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-2 dark:border-gray-600 h-full w-full flex flex-col">
                <div className="text-center flex flex-col h-full">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl">
                    📝
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                    초안
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex-grow flex items-center justify-center">
                    {
                      blockListState.blockList.filter(
                        (block: ScriptBlock) =>
                          block.approvalStatus === ApprovalStatus.DRAFT
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-600">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  최근 활동
                </h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {blockListState.blockList
                      .slice(0, 5)
                      .map((block: ScriptBlock, index: number) => (
                        <li key={block.sceneId}>
                          <div className="relative pb-8">
                            {index !==
                              blockListState.blockList.slice(0, 5).length -
                                1 && (
                              <span
                                className="absolute top-6 left-6 -ml-px h-full w-0.5 bg-gradient-to-b from-orange-200 to-orange-400 dark:from-orange-800 dark:to-orange-600"
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative flex space-x-4">
                              <div>
                                <span className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800 shadow-lg">
                                  <span className="text-white text-lg">📝</span>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-2 flex justify-between space-x-4">
                                <div>
                                  <p className="text-base text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                      {block.title || block.sceneId}
                                    </span>{' '}
                                    시나리오가 생성되었습니다.
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {block.disasterType} • {block.difficulty}
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    block.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* 좌측 메인 콘텐츠 섹션 (8/10) */}
            <div className="lg:col-span-8">
              {appState.isSceneFormOpened ? (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-600">
                  <div className="px-6 py-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {isEditMode
                          ? '재난 대응 훈련 시나리오 수정'
                          : '재난 대응 훈련 시나리오 생성'}
                      </h3>
                      <button
                        onClick={handleCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          재난 유형
                        </label>
                        <select
                          value={formData.disasterType}
                          onChange={e =>
                            handleInputChange('disasterType', e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                        >
                          <option value="fire">🔥 화재</option>
                          <option value="earthquake">🌍 지진</option>
                          <option value="flood">🌊 홍수</option>
                          <option value="emergency">🚑 응급상황</option>
                          <option value="complex">⚠️ 복합재난</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          난이도
                        </label>
                        <select
                          value={formData.difficulty}
                          onChange={e =>
                            handleInputChange('difficulty', e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                        >
                          <option value="easy">🟢 초급</option>
                          <option value="medium">🟡 중급</option>
                          <option value="hard">🔴 고급</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        장면 ID
                      </label>
                      <SceneIdSelector
                        value={formData.sceneId}
                        onChange={sceneId =>
                          handleInputChange('sceneId', sceneId)
                        }
                        existingSceneIds={blockListState.blockList.map(
                          (block: ScriptBlock) => block.sceneId
                        )}
                        placeholder="장면 ID를 선택하세요"
                        disabled={isEditMode}
                      />
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        장면 제목
                      </label>
                      <input
                        type="text"
                        placeholder="화재 발생 현장 도착"
                        value={formData.title}
                        onChange={e =>
                          handleInputChange('title', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                      />
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        장면 설명
                      </label>
                      <textarea
                        placeholder="화재 현장에 도착했습니다. 연기가 가득한 건물을 확인하고 대응 방안을 결정하세요."
                        rows={4}
                        value={formData.content}
                        onChange={e =>
                          handleInputChange('content', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                      />
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        장면 스크립트
                      </label>
                      <textarea
                        placeholder="화재 현장 상황을 파악하고 신속하게 대응하세요. 연기와 불길이 보이는 건물입니다."
                        rows={3}
                        value={formData.sceneScript}
                        onChange={e =>
                          handleInputChange('sceneScript', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                      />
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        선택지
                      </label>
                      <div className="space-y-6">
                        {formData.options.map((option, index) => (
                          <div
                            key={option.answerId}
                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                  답변
                                </label>
                                <input
                                  type="text"
                                  placeholder="소화기로 진화 시도"
                                  value={option.answer}
                                  onChange={e =>
                                    handleOptionChange(
                                      index,
                                      'answer',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-600 dark:text-gray-100 transition-colors duration-200"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                  반응
                                </label>
                                <input
                                  type="text"
                                  placeholder="화재 확산 방지"
                                  value={option.reaction}
                                  onChange={e =>
                                    handleOptionChange(
                                      index,
                                      'reaction',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-600 dark:text-gray-100 transition-colors duration-200"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <div className="flex-1">
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    다음 장면
                                  </label>
                                  <NextSceneSelector
                                    value={option.nextId}
                                    onChange={nextId =>
                                      handleOptionChange(
                                        index,
                                        'nextId',
                                        nextId
                                      )
                                    }
                                    availableScenes={blockListState.blockList.map(
                                      (block: ScriptBlock) => ({
                                        sceneId: block.sceneId,
                                        title: block.title || block.sceneId,
                                      })
                                    )}
                                    currentSceneId={formData.sceneId}
                                    allowEnding={true}
                                    placeholder="다음 장면을 선택하세요"
                                  />
                                </div>
                                {formData.options.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 mt-6"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={addOption}
                        className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 font-medium"
                      >
                        + 선택지 추가
                      </button>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="px-6 py-3"
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleSaveScenario}
                        className="px-6 py-3"
                      >
                        {isEditMode ? '시나리오 수정' : '시나리오 저장'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <ScriptView />
              )}
            </div>

            {/* 우측 시나리오 관리 섹션 (2/10) */}
            <div className="lg:col-span-2">
              <ControlMenu />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-600">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  이용자 관리
                </h3>
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="w-full h-full"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    이용자 관리
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    이용자 관리 기능이 준비 중입니다.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 transition-all duration-300 transform bg-gray-50 dark:bg-gray-700 rounded-2xl hover:shadow-lg hover:-translate-y-1">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                        0
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        총 이용자
                      </div>
                    </div>
                    <div className="p-6 transition-all duration-300 transform bg-gray-50 dark:bg-gray-700 rounded-2xl hover:shadow-lg hover:-translate-y-1">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        0
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        활성 이용자
                      </div>
                    </div>
                    <div className="p-6 transition-all duration-300 transform bg-gray-50 dark:bg-gray-700 rounded-2xl hover:shadow-lg hover:-translate-y-1">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        0
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        신규 가입자
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 transition-all duration-300 transform bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-2 dark:border-gray-600 h-full w-full flex flex-col">
                <div className="text-center flex flex-col h-full">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl">
                    🎮
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                    Game Script Tool
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    재난 대응 훈련 시나리오를 생성하고 관리할 수 있는 전용
                    도구입니다.
                  </p>
                  <a
                    href="http://localhost:5174"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-lg hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                  >
                    도구 열기
                  </a>
                </div>
              </div>

              <div className="p-6 transition-all duration-300 transform bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-2 dark:border-gray-600 h-full w-full flex flex-col">
                <div className="text-center flex flex-col h-full">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl">
                    🔄
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                    시나리오 변환기
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    기존 시나리오 데이터를 Phoenix 형식으로 변환합니다.
                  </p>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-mono">
                      npm run scenario:convert
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-mono">
                      npm run scenario:convert-all
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 transition-all duration-300 transform bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-2 dark:border-gray-600 h-full w-full flex flex-col">
                <div className="text-center flex flex-col h-full">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl">
                    📊
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-800 dark:text-gray-100">
                    데이터 검증
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    생성된 시나리오 데이터의 유효성을 검증합니다.
                  </p>
                  <button className="w-full text-left px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-mono">
                    npm run scenario:validate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
