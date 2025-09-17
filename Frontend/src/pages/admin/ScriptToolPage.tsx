/**
 * Phoenix 재난 대응 훈련 시스템 - 시나리오 생성 도구
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
import ScriptView from '../../components/game/ScriptView';
import AdminPanel from '../../components/game/Partials/AdminPanel';
import ScenarioForm from '../../components/game/Partials/ScenarioForm.tsx'; // ✅ .tsx 명시
import ScenarioGeneratorPanel from '../../components/admin/ScenarioGeneratorPanel';
import { useAppStateStore } from '../../stores/game/atom';
import { useBlockListSelector } from '../../stores/game/selector';
import { useScenarioEditor } from '../../hooks/useScenarioEditor.ts'; // ✅ .ts 명시
import { loadBlockList, saveBlockList } from '../../utils/game/api';
import { UserRole } from '../../types/game';
import type { ScenarioGeneratorEvent } from '../../types';

// 간소화된 styled components
const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e9ecef;
  background: white;
  padding: 0 20px;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 12px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: ${props => (props.$active ? '#007bff' : '#6c757d')};
  border-bottom: 2px solid
    ${props => (props.$active ? '#007bff' : 'transparent')};
  transition: all 0.2s;

  &:hover {
    color: #007bff;
    background: #f8f9fa;
  }

  display: flex;
  align-items: center;
  gap: 8px;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  gap: 20px;
  padding: 20px;
`;

const LeftPanel = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const RightPanel = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 100px);
`;

const ScriptToolPage: React.FC = () => {
  const { setBlockList } = useBlockListSelector();
  const { appState } = useAppStateStore();
  const blockListState = useBlockListSelector();

  const {
    formData,
    isEditMode,
    handleInputChange,
    handleOptionChange,
    addOption,
    removeOption,
    handleSaveScenario,
    handleCancel,
  } = useScenarioEditor();

  const [activeTab, setActiveTab] = useState<string>('scenarios');
  const [scenarios, setScenarios] = useState<ScenarioGeneratorEvent[]>([]);

  // 관리자 사용자 정보
  const currentUser = {
    name: '시나리오 관리자',
    role: UserRole.ADMIN,
    user_level: 100,
    current_tier: 'MASTER',
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const savedBlockList = loadBlockList();
    if (savedBlockList.length > 0) {
      setBlockList(savedBlockList);
      // 기존 블록 리스트를 시나리오 형태로 변환
      const convertedScenarios: ScenarioGeneratorEvent[] = savedBlockList.map((block, index) => ({
        id: index + 1,
        teamId: 1,
        scenarioCode: `SCEN_${String(index + 1).padStart(3, '0')}`,
        sceneId: block.sceneId,
        title: block.title || '',
        content: block.content || '',
        sceneScript: block.sceneScript || '',
        disasterType: block.disasterType,
        riskLevel: 'MEDIUM',
        difficulty: block.difficulty,
        options: (block.options || []).map(opt => ({
          id: 0,
          eventId: 0,
          scenarioId: 0,
          choiceCode: opt.answerId,
          choiceText: opt.answer,
          isCorrect: opt.points.speed > 0 && opt.points.accuracy > 0,
          speedPoints: opt.points.speed,
          accuracyPoints: opt.points.accuracy,
          expPoints: 0,
          reactionText: opt.reaction,
          nextEventId: opt.nextId ? parseInt(opt.nextId) : undefined,
          scoreWeight: 1,
          createdBy: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        })),
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        createdAt: new Date().toISOString(),
        createdBy: 1,
        order: index + 1,
      }));
      setScenarios(convertedScenarios);
    }
  }, [setBlockList]);

  // 통계 데이터 계산
  const getScenarioStats = () => {
    const blocks = blockListState.blockList;
    return {
      total: blocks.length,
      byType: {
        fire: blocks.filter(b => b.disasterType === 'fire').length,
        earthquake: blocks.filter(b => b.disasterType === 'earthquake').length,
        flood: blocks.filter(b => b.disasterType === 'flood').length,
        emergency: blocks.filter(b => b.disasterType === 'emergency').length,
      },
      byDifficulty: {
        easy: blocks.filter(b => b.difficulty === 'easy').length,
        medium: blocks.filter(b => b.difficulty === 'medium').length,
        hard: blocks.filter(b => b.difficulty === 'hard').length,
      },
    };
  };

  // 관리자 패널 핸들러들
  const handleCreateScenario = () => {
    const { openSceneForm } = useAppStateStore.getState();
    openSceneForm();
  };

  const handleExportScenarios = () => {
    const blocks = loadBlockList();
    const dataStr = JSON.stringify(blocks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scenarios_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportScenarios = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const importedBlocks = JSON.parse(e.target?.result as string);
          saveBlockList(importedBlocks);
          setBlockList(importedBlocks);
          
          // 시나리오 데이터도 업데이트
          const convertedScenarios: ScenarioGeneratorEvent[] = importedBlocks.map((block: any, index: number) => ({
            id: index + 1,
            teamId: 1,
            scenarioCode: `SCEN_${String(index + 1).padStart(3, '0')}`,
            sceneId: block.sceneId,
            title: block.title || '',
            content: block.content || '',
            sceneScript: block.sceneScript || '',
            disasterType: block.disasterType,
            riskLevel: 'MEDIUM',
            difficulty: block.difficulty,
            options: (block.options || []).map((opt: any) => ({
              id: 0,
              eventId: 0,
              scenarioId: 0,
              choiceCode: opt.answerId,
              choiceText: opt.answer,
              isCorrect: opt.points?.speed > 0 && opt.points?.accuracy > 0,
              speedPoints: opt.points?.speed || 0,
              accuracyPoints: opt.points?.accuracy || 0,
              expPoints: 0,
              reactionText: opt.reaction,
              nextEventId: opt.nextId ? parseInt(opt.nextId) : undefined,
              scoreWeight: 1,
              createdBy: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isActive: true,
            })),
            status: 'ACTIVE',
            approvalStatus: 'APPROVED',
            createdAt: new Date().toISOString(),
            createdBy: 1,
            order: index + 1,
          }));
          setScenarios(convertedScenarios);
          
          alert('시나리오를 성공적으로 가져왔습니다!');
        } catch (error) {
          alert('파일 형식이 올바르지 않습니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleScenariosUpdate = (newScenarios: ScenarioGeneratorEvent[]) => {
    setScenarios(newScenarios);
    // 기존 블록 리스트 형태로도 변환하여 저장
    const convertedBlocks = newScenarios.map(scenario => ({
      sceneId: scenario.sceneId,
      title: scenario.title,
      content: scenario.content,
      sceneScript: scenario.sceneScript,
      disasterType: scenario.disasterType,
      difficulty: scenario.difficulty,
      options: scenario.options.map(opt => ({
        answerId: opt.choiceCode,
        answer: opt.choiceText,
        reaction: opt.reactionText || '',
        nextId: opt.nextEventId?.toString() || '',
        points: {
          speed: opt.speedPoints,
          accuracy: opt.accuracyPoints,
        },
      })),
      approvalStatus: 'APPROVED' as const,
      createdAt: new Date().toISOString(),
      createdBy: '1',
      order: scenario.order || 1,
    }));
    saveBlockList(convertedBlocks);
    setBlockList(convertedBlocks);
  };

  const handleDeleteAllScenarios = () => {
    if (
      window.confirm(
        '정말로 모든 시나리오를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      saveBlockList([]);
      setBlockList([]);
      setScenarios([]);
      alert('모든 시나리오가 삭제되었습니다.');
    }
  };

  const stats = getScenarioStats();

  return (
    <Container>
      {/* 탭 네비게이션 */}
      <TabContainer>
        <Tab
          $active={activeTab === 'scenarios'}
          onClick={() => setActiveTab('scenarios')}
        >
          📚 시나리오 관리
        </Tab>
      </TabContainer>

      <MainContent>
        {/* 좌측 메인 콘텐츠 */}
        <LeftPanel>
          {appState.isSceneFormOpened ? (
            <ScenarioForm
              formData={formData}
              isEditMode={isEditMode}
              existingBlocks={blockListState.blockList}
              onInputChange={handleInputChange}
              onOptionChange={handleOptionChange}
              onAddOption={addOption}
              onRemoveOption={removeOption}
              onSave={handleSaveScenario}
              onCancel={handleCancel}
            />
          ) : (
            <ScriptView />
          )}
        </LeftPanel>

        {/* 우측 패널 */}
        <RightPanel>
          {/* 시나리오 생성기 패널 */}
          <ScenarioGeneratorPanel
            scenarios={scenarios}
            onScenariosUpdate={handleScenariosUpdate}
          />
          
          {/* 기존 관리자 패널 */}
          <AdminPanel
            currentUser={currentUser}
            stats={stats}
            onCreateScenario={handleCreateScenario}
            onExportScenarios={handleExportScenarios}
            onImportScenarios={handleImportScenarios}
            onDeleteAllScenarios={handleDeleteAllScenarios}
          />
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default ScriptToolPage;
