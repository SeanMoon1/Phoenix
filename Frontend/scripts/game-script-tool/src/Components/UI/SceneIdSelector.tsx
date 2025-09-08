import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  getAvailableSceneIds,
  compareSceneIds,
} from '../../Utils/sceneIdGenerator';

interface SceneIdSelectorProps {
  value: string;
  onChange: (sceneId: string) => void;
  existingSceneIds: string[];
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

const DropdownItem = styled.div<{ $isSelected: boolean; $isNew: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  background: ${props => (props.$isSelected ? '#e3f2fd' : 'white')};
  color: ${props => (props.$isNew ? '#007bff' : '#333')};
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background: ${props => (props.$isSelected ? '#e3f2fd' : '#f8f9fa')};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NewSceneIndicator = styled.span`
  font-size: 12px;
  color: #007bff;
  margin-left: 8px;
`;

const SceneIdSelector: React.FC<SceneIdSelectorProps> = ({
  value,
  onChange,
  existingSceneIds,
  placeholder = '장면 ID를 선택하세요',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 사용 가능한 장면 ID 목록 생성
  const availableSceneIds =
    getAvailableSceneIds(existingSceneIds).sort(compareSceneIds);

  // 현재 값이 목록에 없으면 "새로 생성" 옵션 추가
  const hasCurrentValue = availableSceneIds.includes(value);
  const displayOptions = hasCurrentValue
    ? availableSceneIds
    : [...availableSceneIds, value].sort(compareSceneIds);

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

  const handleSelect = (sceneId: string) => {
    onChange(sceneId);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getDisplayText = () => {
    if (!value) return placeholder;
    return value;
  };

  const isNewScene = (sceneId: string) => {
    return !existingSceneIds.includes(sceneId);
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
        {displayOptions.map(sceneId => (
          <DropdownItem
            key={sceneId}
            $isSelected={sceneId === value}
            $isNew={isNewScene(sceneId)}
            onClick={() => handleSelect(sceneId)}
          >
            {sceneId}
            {isNewScene(sceneId) && (
              <NewSceneIndicator>(새로 생성)</NewSceneIndicator>
            )}
          </DropdownItem>
        ))}
      </DropdownList>
    </Container>
  );
};

export default SceneIdSelector;
