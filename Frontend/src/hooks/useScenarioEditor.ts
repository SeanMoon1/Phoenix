import { useState, useEffect } from 'react';
import { useAppStateStore } from '../stores/game/atom';
import { useBlockListSelector } from '../stores/game/selector';
import { loadBlockList, saveBlockList } from '../utils/game/api';
import type { ScriptBlock } from '../types/game';
import { ApprovalStatus } from '../types/game';

interface FormData {
  sceneId: string;
  title: string;
  content: string;
  sceneScript: string;
  disasterType: string;
  difficulty: string;
  options: Array<{
    answerId: string;
    answer: string;
    reaction: string;
    nextId: string;
  }>;
}

// #1-1 형식으로 다음 사용 가능한 Scene ID 생성
const getNextAvailableSceneId = (existingBlocks: ScriptBlock[]): string => {
  const existingIds = existingBlocks.map(block => block.sceneId);

  // 기존 ID들에서 시나리오 번호와 장면 번호 추출
  const scenarioMap: { [key: number]: number[] } = {};

  existingIds.forEach(id => {
    // #1-1, #2-3 등의 형식에서 번호 추출
    const match = id.match(/^#(\d+)-(\d+)$/);
    if (match) {
      const scenarioNum = parseInt(match[1]);
      const sceneNum = parseInt(match[2]);

      if (!scenarioMap[scenarioNum]) {
        scenarioMap[scenarioNum] = [];
      }
      scenarioMap[scenarioNum].push(sceneNum);
    }
  });

  // 가장 큰 시나리오 번호 찾기
  const maxScenarioNum = Math.max(0, ...Object.keys(scenarioMap).map(Number));

  if (maxScenarioNum === 0) {
    // 기존 시나리오가 없으면 #1-1부터 시작
    return '#1-1';
  }

  // 현재 가장 큰 시나리오에서 다음 장면 번호 찾기
  const currentScenarioScenes = scenarioMap[maxScenarioNum] || [];
  const maxSceneNum = Math.max(0, ...currentScenarioScenes);

  // 다음 장면 번호로 ID 생성
  return `#${maxScenarioNum}-${maxSceneNum + 1}`;
};

export const useScenarioEditor = () => {
  const { setBlockList } = useBlockListSelector();
  const { appState, closeSceneForm, openSceneForm } = useAppStateStore();

  const [formData, setFormData] = useState<FormData>({
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

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);

  // 새 시나리오 생성 시 ID 자동 생성
  useEffect(() => {
    if (appState.isSceneFormOpened && !isEditMode && !formData.sceneId) {
      const existingBlocks = loadBlockList();
      const newSceneId = getNextAvailableSceneId(existingBlocks);
      setFormData(prev => ({ ...prev, sceneId: newSceneId }));
    }
  }, [appState.isSceneFormOpened, isEditMode, formData.sceneId]);

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
      const reorderedOptions = newOptions.map((option, i) => ({
        ...option,
        answerId: `answer${i + 1}`,
      }));
      setFormData(prev => ({ ...prev, options: reorderedOptions }));
    }
  };

  // 시나리오 수정 모드 시작
  const startEditScenario = (block: ScriptBlock) => {
    setFormData({
      sceneId: block.sceneId,
      title: block.title || '',
      content: block.content || '',
      sceneScript: block.sceneScript || '',
      disasterType: block.disasterType || 'fire',
      difficulty: block.difficulty || 'medium',
      options: (block.options || []).map(opt => ({
        answerId: opt.answerId,
        answer: opt.answer,
        reaction: opt.reaction,
        nextId: opt.nextId,
      })),
    });
    setIsEditMode(true);
    setEditingSceneId(block.sceneId);
    openSceneForm();
  };

  // 시나리오 저장
  const handleSaveScenario = () => {
    // 필수 항목 검증
    if (!formData.sceneId || !formData.title || !formData.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    // 선택지 검증
    const validOptions = formData.options.filter(opt => opt.answer.trim());
    if (validOptions.length === 0) {
      alert('최소 하나의 선택지를 입력해주세요.');
      return;
    }

    const currentBlocks = loadBlockList();
    let updatedBlocks: ScriptBlock[];

    if (isEditMode && editingSceneId) {
      // 수정 모드
      updatedBlocks = currentBlocks.map(block =>
        block.sceneId === editingSceneId
          ? {
              ...block,
              title: formData.title,
              content: formData.content,
              sceneScript: formData.sceneScript,
              disasterType: formData.disasterType,
              difficulty: formData.difficulty,
              options: formData.options
                .filter(opt => opt.answer.trim())
                .map(option => ({
                  answerId: option.answerId,
                  answer: option.answer,
                  reaction: option.reaction,
                  nextId: option.nextId,
                  points: { speed: 0, accuracy: 0 },
                })),
              updatedAt: new Date().toISOString(),
            }
          : block
      );
    } else {
      // 생성 모드
      const newScriptBlock: ScriptBlock = {
        sceneId: formData.sceneId,
        title: formData.title,
        content: formData.content,
        sceneScript: formData.sceneScript,
        approvalStatus: ApprovalStatus.DRAFT,
        createdAt: new Date().toISOString(),
        createdBy: '시나리오 관리자',
        order: Date.now(),
        disasterType: formData.disasterType,
        difficulty: formData.difficulty,
        options: formData.options
          .filter(opt => opt.answer.trim())
          .map(option => ({
            answerId: option.answerId,
            answer: option.answer,
            reaction: option.reaction,
            nextId: option.nextId,
            points: { speed: 0, accuracy: 0 },
          })),
      };
      updatedBlocks = [...currentBlocks, newScriptBlock];
    }

    saveBlockList(updatedBlocks);
    setBlockList(updatedBlocks);
    resetForm();
    closeSceneForm();
    alert(
      isEditMode ? '시나리오가 수정되었습니다!' : '시나리오가 저장되었습니다!'
    );
  };

  // 폼 초기화
  const resetForm = () => {
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
  };

  // 폼 취소
  const handleCancel = () => {
    resetForm();
    closeSceneForm();
  };

  return {
    formData,
    isEditMode,
    editingSceneId,
    handleInputChange,
    handleOptionChange,
    addOption,
    removeOption,
    handleSaveScenario,
    handleCancel,
    startEditScenario,
    resetForm,
  };
};
