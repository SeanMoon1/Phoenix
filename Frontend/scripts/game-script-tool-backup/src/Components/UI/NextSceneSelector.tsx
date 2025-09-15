import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  compareSceneIds,
  getRecommendedNextScenes,
} from '../../Utils/sceneIdGenerator';

interface NextSceneSelectorProps {
  value: string;
  onChange: (nextSceneId: string) => void;
  availableScenes: Array<{ sceneId: string; title: string }>;
  currentSceneId?: string; // 현재 장면 ID (추천을 위해 필요)
  allowEnding?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button<{ $isOpen: boolean; $disabled: boolean }>`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: ${props => (props.$disabled ? '#f5f5f5' : 'white')};
  color: ${props => (props.$disabled ? '#999' : '#333')};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => (props.$disabled ? '#ddd' : '#007bff')};
  }

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const DropdownIcon = styled.span<{ $isOpen: boolean }>`
  transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s;
  font-size: 12px;
  color: #666;
`;

const DropdownList = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled.div<{
  $isSelected: boolean;
  $isEnding: boolean;
  $isRecommended: boolean;
}>`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  background: ${props => {
    if (props.$isSelected) return '#e3f2fd';
    if (props.$isRecommended) return '#fff3cd';
    return 'white';
  }};
  color: ${props => (props.$isEnding ? '#28a745' : '#333')};
  border-bottom: 1px solid #f0f0f0;
  border-left: ${props =>
    props.$isRecommended ? '3px solid #ffc107' : '3px solid transparent'};

  &:hover {
    background: ${props => {
      if (props.$isSelected) return '#e3f2fd';
      if (props.$isRecommended) return '#ffeaa7';
      return '#f8f9fa';
    }};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SceneTitle = styled.span`
  font-size: 12px;
  color: #666;
  margin-left: 8px;
`;

const EndingIndicator = styled.span`
  font-size: 12px;
  color: #28a745;
  margin-left: 8px;
`;

const RecommendedIndicator = styled.span`
  font-size: 12px;
  color: #ffc107;
  margin-left: 8px;
  font-weight: bold;
`;

const SectionDivider = styled.div`
  padding: 4px 12px;
  background: #f8f9fa;
  color: #666;
  font-size: 12px;
  font-weight: bold;
  border-bottom: 1px solid #e9ecef;
`;

const NextSceneSelector: React.FC<NextSceneSelectorProps> = ({
  value,
  onChange,
  availableScenes,
  currentSceneId,
  allowEnding = true,
  placeholder = '다음 장면을 선택하세요',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 추천 장면 ID 목록 생성
  const recommendedSceneIds = currentSceneId
    ? getRecommendedNextScenes(
        currentSceneId,
        availableScenes.map(scene => scene.sceneId),
        5
      )
    : [];

  // 사용 가능한 옵션 목록 생성
  const options = [
    // 빈 옵션 (연결 없음)
    { id: '', title: '연결 없음', isEnding: false, isRecommended: false },
    // 추천 장면들 (새로 생성될 장면들)
    ...recommendedSceneIds
      .filter(
        sceneId => !availableScenes.some(scene => scene.sceneId === sceneId)
      )
      .map(sceneId => ({
        id: sceneId,
        title: `${sceneId} (새로 생성)`,
        isEnding: false,
        isRecommended: true,
      })),
    // 기존 장면들
    ...availableScenes
      .filter(scene => scene.sceneId !== value) // 현재 장면은 제외
      .sort((a, b) => compareSceneIds(a.sceneId, b.sceneId))
      .map(scene => ({
        id: scene.sceneId,
        title: scene.title,
        isEnding: false,
        isRecommended: recommendedSceneIds.includes(scene.sceneId),
      })),
    // 훈련 완료 옵션
    ...(allowEnding
      ? [
          {
            id: 'ENDING',
            title: '훈련 완료',
            isEnding: true,
            isRecommended: false,
          },
        ]
      : []),
  ];

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getDisplayText = () => {
    if (!value) return placeholder;

    const selectedOption = options.find(option => option.id === value);
    if (selectedOption) {
      return selectedOption.title;
    }

    return value;
  };

  return (
    <Container ref={containerRef}>
      <SelectButton
        type="button"
        $isOpen={isOpen}
        $disabled={disabled}
        onClick={handleButtonClick}
      >
        <span>{getDisplayText()}</span>
        <DropdownIcon $isOpen={isOpen}>▼</DropdownIcon>
      </SelectButton>

      <DropdownList $isOpen={isOpen}>
        {options.map((option, index) => {
          const showRecommendedSection =
            index === 1 &&
            option.isRecommended &&
            recommendedSceneIds.length > 0;
          const showExistingSection =
            index > 0 &&
            !option.isRecommended &&
            !option.isEnding &&
            options[index - 1]?.isRecommended &&
            recommendedSceneIds.length > 0;

          return (
            <React.Fragment key={option.id}>
              {showRecommendedSection && (
                <SectionDivider>✨ 추천 장면</SectionDivider>
              )}
              {showExistingSection && (
                <SectionDivider>📋 기존 장면</SectionDivider>
              )}
              <DropdownItem
                $isSelected={option.id === value}
                $isEnding={option.isEnding}
                $isRecommended={option.isRecommended}
                onClick={() => handleSelect(option.id)}
              >
                {option.title}
                {option.isEnding && <EndingIndicator>🏁</EndingIndicator>}
                {option.isRecommended && !option.isEnding && (
                  <RecommendedIndicator>⭐</RecommendedIndicator>
                )}
                {!option.isEnding && option.id && !option.isRecommended && (
                  <SceneTitle>({option.id})</SceneTitle>
                )}
              </DropdownItem>
            </React.Fragment>
          );
        })}
      </DropdownList>
    </Container>
  );
};

export default NextSceneSelector;
