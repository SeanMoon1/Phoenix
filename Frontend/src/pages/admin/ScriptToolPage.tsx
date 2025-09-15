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
import { useAppStateStore } from '../../stores/game/atom';
import { useBlockListSelector } from '../../stores/game/selector';
import { useScenarioEditor } from '../../hooks/useScenarioEditor.ts'; // ✅ .ts 명시
import { loadBlockList, saveBlockList } from '../../utils/game/api';
import { UserRole } from '../../types/game';
import type { User } from '../../types/game';

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

  // 관리자 사용자 정보
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

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const savedBlockList = loadBlockList();
    if (savedBlockList.length > 0) {
      setBlockList(savedBlockList);
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
          alert('시나리오를 성공적으로 가져왔습니다!');
        } catch (error) {
          alert('파일 형식이 올바르지 않습니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteAllScenarios = () => {
    if (
      window.confirm(
        '정말로 모든 시나리오를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      saveBlockList([]);
      setBlockList([]);
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

        {/* 우측 관리자 패널 */}
        <AdminPanel
          currentUser={currentUser}
          stats={stats}
          onCreateScenario={handleCreateScenario}
          onExportScenarios={handleExportScenarios}
          onImportScenarios={handleImportScenarios}
          onDeleteAllScenarios={handleDeleteAllScenarios}
        />
      </MainContent>
    </Container>
  );
};

export default ScriptToolPage;
