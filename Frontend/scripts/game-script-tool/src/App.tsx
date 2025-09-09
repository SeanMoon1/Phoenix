/**
 * Phoenix 재난 대응 훈련 시스템 - Admin Dashboard
 *
 * 이 컴포넌트는 관리자만 접근 가능한 시나리오 생성/관리 도구입니다.
 * - 시나리오 생성, 수정, 삭제
 * - Export/Import 기능
 * - 로컬 스토리지 기반 데이터 관리
 *
 * 실제 훈련은 별도의 Training Dashboard에서 진행됩니다.
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ControlMenu from './Components/ControlMenu/ControlMenu';
import ScriptView from './Components/ScriptView';
import SceneIdSelector from './Components/UI/SceneIdSelector';
import NextSceneSelector from './Components/UI/NextSceneSelector';
import { useAppStateStore } from './Stores/atom';
import { useBlockListSelector } from './Stores/selector';
import type { User, ScriptBlock } from './types';
import { UserRole, ApprovalStatus } from './types';
import { loadBlockList, saveBlockList } from './Utils/api';
import { getNextAvailableSceneId } from './Utils/sceneIdGenerator';

const Container = styled.div`
  @media (min-width: 800px) {
    width: 80%;
  }
  margin: auto auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const BlockContainer = styled.div`
  overflow-y: auto;
`;

const UserInfo = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-size: 12px;
`;

const RoleBadge = styled.span<{ role: UserRole }>`
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  background-color: ${props => {
    switch (props.role) {
      case UserRole.ADMIN:
        return '#dc3545';
      case UserRole.TRAINER:
        return '#28a745';
      case UserRole.VIEWER:
        return '#6c757d';
      default:
        return '#6c757d';
    }
  }};
`;

const TabContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  border: none;
  background: ${props => (props.$active ? 'white' : 'transparent')};
  color: ${props => (props.$active ? '#007bff' : '#6c757d')};
  cursor: pointer;
  border-bottom: 2px solid
    ${props => (props.$active ? '#007bff' : 'transparent')};
  transition: all 0.2s;

  &:hover {
    background: ${props => (props.$active ? 'white' : '#e9ecef')};
  }
`;

// 시나리오 편집 폼 스타일
const SceneFormSection = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const SceneFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;

  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #333;
  }
`;

const SceneFormContent = styled.div`
  padding: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const FormField = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  select {
    background: white;
    cursor: pointer;
  }
`;

const OptionsList = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  background: #f8f9fa;
`;

const OptionItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  input {
    padding: 6px 8px;
    font-size: 13px;
  }
`;

const AddOptionButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;

  &:hover {
    background: #218838;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border: 1px solid ${props => (props.$primary ? '#007bff' : '#6c757d')};
  background: ${props => (props.$primary ? '#007bff' : 'white')};
  color: ${props => (props.$primary ? 'white' : '#6c757d')};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${props => (props.$primary ? '#0056b3' : '#f8f9fa')};
    border-color: ${props => (props.$primary ? '#0056b3' : '#5a6268')};
  }
`;

const App: React.FC = () => {
  const { setBlockList } = useBlockListSelector();
  const { appState, closeSceneForm } = useAppStateStore();

  // 폼 데이터 상태 관리 (기존 ScriptBlock 구조)
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

  // 블록 리스트 상태 (Hooks 순서 문제 해결을 위해 최상단에서 호출)
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

  // 사용자 역할을 관리자로 고정 (Admin Dashboard 전용)
  const currentUser: User = {
    id: 1,
    name: '시나리오 관리자',
    role: 'ADMIN',
    userLevel: 100, // 관리자는 최고 레벨
    userExp: 999999, // 관리자는 최대 경험치
    totalScore: 999999, // 관리자는 최고 점수
    completedScenarios: 999, // 관리자는 모든 시나리오 완료
    currentTier: '마스터', // 관리자는 마스터 등급
    levelProgress: 100.0, // 관리자는 100% 진행도
    nextLevelExp: 0, // 관리자는 다음 레벨 불필요
    teamId: 1,
    userCode: 'ADMIN001',
    loginId: 'admin',
    email: 'admin@phoenix.com',
    useYn: 'Y',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scenarioStats: {
      fire: { completed: 999, totalScore: 999999, bestScore: 100 },
      earthquake: { completed: 999, totalScore: 999999, bestScore: 100 },
      flood: { completed: 999, totalScore: 999999, bestScore: 100 },
      emergency: { completed: 999, totalScore: 999999, bestScore: 100 },
      chemical: { completed: 999, totalScore: 999999, bestScore: 100 },
      nuclear: { completed: 999, totalScore: 999999, bestScore: 100 },
      terrorism: { completed: 999, totalScore: 999999, bestScore: 100 },
      pandemic: { completed: 999, totalScore: 999999, bestScore: 100 },
      naturalDisaster: {
        completed: 999,
        totalScore: 999999,
        bestScore: 100,
      },
      complex: { completed: 999, totalScore: 999999, bestScore: 100 },
    },
  };

  // 탭 관리 상태
  const [activeTab, setActiveTab] = useState<string>('scenarios');

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
      // answerId 재정렬
      const reorderedOptions = reorderAnswerIds(newOptions);
      setFormData(prev => ({ ...prev, options: reorderedOptions }));
    }
  };

  // 시나리오 저장 (생성 또는 수정)
  const handleSaveScenario = () => {
    if (!formData.sceneId || !formData.title || !formData.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const currentBlocks = loadBlockList();
    let updatedBlocks: ScriptBlock[];

    if (isEditMode && editingSceneId) {
      // 수정 모드: 기존 블록 업데이트
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
      // 생성 모드: 새 블록 추가
      const newScriptBlock: ScriptBlock = {
        sceneId: formData.sceneId,
        title: formData.title,
        content: formData.content,
        sceneScript: formData.sceneScript,
        approvalStatus: ApprovalStatus.DRAFT,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name,
        order: Date.now(), // 임시 순서
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

    // 로컬 스토리지에 저장
    saveBlockList(updatedBlocks);

    // 상태 업데이트
    setBlockList(updatedBlocks);

    // 폼 초기화
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

    // 수정 모드 해제
    setIsEditMode(false);
    setEditingSceneId(null);

    // 폼 닫기
    closeSceneForm();

    alert(
      isEditMode ? '시나리오가 수정되었습니다!' : '시나리오가 저장되었습니다!'
    );
  };

  // 폼 취소 시 초기화
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
    <Container>
      {/* 사용자 정보 표시 */}
      <UserInfo>
        <div>👤 {currentUser.name}</div>
        <RoleBadge role={currentUser.role as any}>🔐 관리자</RoleBadge>
        <div style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>
          🏆 {currentUser.currentTier} (Lv.{currentUser.userLevel})
        </div>
        <div style={{ fontSize: '10px', color: '#999' }}>Admin Dashboard</div>
      </UserInfo>

      <ControlMenu />

      {/* 탭 네비게이션 */}
      <TabContainer>
        <Tab
          $active={activeTab === 'scenarios'}
          onClick={() => setActiveTab('scenarios')}
        >
          📚 시나리오 관리
        </Tab>
      </TabContainer>

      {/* 시나리오 콘텐츠 */}
      {activeTab === 'scenarios' && (
        <BlockContainer>
          {/* 시나리오 편집 폼이 열려있을 때 */}
          {appState.isSceneFormOpened ? (
            <SceneFormSection>
              <SceneFormHeader>
                <h3>
                  {isEditMode
                    ? '재난 대응 훈련 시나리오 수정'
                    : '재난 대응 훈련 시나리오 생성'}
                </h3>
                <CloseButton onClick={handleCancel}>✕</CloseButton>
              </SceneFormHeader>
              <SceneFormContent>
                <FormRow>
                  <FormField>
                    <label>재난 유형:</label>
                    <select
                      value={formData.disasterType}
                      onChange={e =>
                        handleInputChange('disasterType', e.target.value)
                      }
                    >
                      <option value="fire">화재</option>
                      <option value="earthquake">지진</option>
                      <option value="flood">홍수</option>
                      <option value="emergency">응급상황</option>
                      <option value="complex">복합재난</option>
                    </select>
                  </FormField>

                  <FormField>
                    <label>난이도:</label>
                    <select
                      value={formData.difficulty}
                      onChange={e =>
                        handleInputChange('difficulty', e.target.value)
                      }
                    >
                      <option value="easy">초급</option>
                      <option value="medium">중급</option>
                      <option value="hard">고급</option>
                    </select>
                  </FormField>
                </FormRow>

                <FormField>
                  <label>장면 ID:</label>
                  <SceneIdSelector
                    value={formData.sceneId}
                    onChange={sceneId => handleInputChange('sceneId', sceneId)}
                    existingSceneIds={blockListState.blockList.map(
                      (block: ScriptBlock) => block.sceneId
                    )}
                    placeholder="장면 ID를 선택하세요"
                    disabled={isEditMode} // 수정 모드에서는 장면 ID 변경 불가
                  />
                </FormField>

                <FormField>
                  <label>장면 제목:</label>
                  <input
                    type="text"
                    placeholder="화재 발생 현장 도착"
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                  />
                </FormField>

                <FormField>
                  <label>장면 설명:</label>
                  <textarea
                    placeholder="화재 현장에 도착했습니다. 연기가 가득한 건물을 확인하고 대응 방안을 결정하세요."
                    rows={4}
                    value={formData.content}
                    onChange={e => handleInputChange('content', e.target.value)}
                  />
                </FormField>

                <FormField>
                  <label>장면 스크립트:</label>
                  <textarea
                    placeholder="화재 현장 상황을 파악하고 신속하게 대응하세요. 연기와 불길이 보이는 건물입니다."
                    rows={3}
                    value={formData.sceneScript}
                    onChange={e =>
                      handleInputChange('sceneScript', e.target.value)
                    }
                  />
                </FormField>

                <FormField>
                  <label>선택지:</label>
                  <OptionsList>
                    {formData.options.map((option, index) => (
                      <OptionItem key={option.answerId}>
                        <input
                          type="text"
                          placeholder="답변 (예: 소화기로 진화 시도)"
                          value={option.answer}
                          onChange={e =>
                            handleOptionChange(index, 'answer', e.target.value)
                          }
                        />
                        <input
                          type="text"
                          placeholder="반응 (예: 화재 확산 방지)"
                          value={option.reaction}
                          onChange={e =>
                            handleOptionChange(
                              index,
                              'reaction',
                              e.target.value
                            )
                          }
                        />
                        <NextSceneSelector
                          value={option.nextId}
                          onChange={nextId =>
                            handleOptionChange(index, 'nextId', nextId)
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
                        {formData.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                            }}
                          >
                            삭제
                          </button>
                        )}
                      </OptionItem>
                    ))}
                  </OptionsList>
                  <AddOptionButton onClick={addOption}>
                    선택지 추가
                  </AddOptionButton>
                </FormField>

                <FormActions>
                  <ActionButton onClick={handleCancel}>취소</ActionButton>
                  <ActionButton $primary onClick={handleSaveScenario}>
                    {isEditMode ? '시나리오 수정' : '시나리오 저장'}
                  </ActionButton>
                </FormActions>
              </SceneFormContent>
            </SceneFormSection>
          ) : (
            /* 기존 시나리오 목록 표시 */
            <ScriptView />
          )}
        </BlockContainer>
      )}
    </Container>
  );
};

export default App;
