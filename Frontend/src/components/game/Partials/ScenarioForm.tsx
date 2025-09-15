import React from 'react';
import styled from 'styled-components';
import SceneIdSelector from '../UI/SceneIdSelector';
import NextSceneSelector from '../UI/NextSceneSelector';
import type { ScriptBlock } from '../../../types/game';

interface ScenarioFormProps {
  formData: {
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
  };
  isEditMode: boolean;
  existingBlocks: ScriptBlock[];
  onInputChange: (field: string, value: string) => void;
  onOptionChange: (index: number, field: string, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

/* ===== 디자인 토큰(라이트/다크 기본 대응) ===== */
const SceneFormSection = styled.div`
  --bg: #ffffff;
  --bg-soft: #f6f7fb;
  --text: #1f2937;
  --muted: #6b7280;
  --ring: #7c3aed;
  --ring-soft: rgba(124, 58, 237, 0.15);
  --border: #e5e7eb;
  --success: #22c55e;
  --danger: #ef4444;
  --primary-from: #7c3aed;
  --primary-to: #4f46e5;

  @media (prefers-color-scheme: dark) {
    --bg: #0f1220;
    --bg-soft: #15182a;
    --text: #e5e7eb;
    --muted: #9ca3af;
    --ring: #8b5cf6;
    --ring-soft: rgba(139, 92, 246, 0.25);
    --border: #23263a;
  }

  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 18, 32, 0.06);
  overflow: clip;
`;

/* 헤더: 그라디언트 + 약간의 글라스 느낌 */
const SceneFormHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 5;
  background: linear-gradient(135deg, var(--primary-from), var(--primary-to));
  color: #fff;
  padding: 18px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: saturate(150%) blur(6px);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.2px;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.18);
  border: 0;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 18px;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.26);
    transform: rotate(10deg);
  }
  &:active {
    transform: scale(0.98);
  }
`;

const SceneFormContent = styled.div`
  padding: 28px;
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 18px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const FieldShell = styled.div`
  display: grid;
  gap: 10px;
`;

const Label = styled.label`
  font-weight: 700;
  color: var(--text);
  font-size: 13px;
  letter-spacing: 0.2px;
`;

const Control = styled.div`
  position: relative;

  input,
  select,
  textarea {
    width: 100%;
    padding: 12px 14px;
    font-size: 14px;
    color: var(--text);
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    outline: none;
    transition: box-shadow 0.15s ease, border-color 0.15s ease,
      background 0.2s ease;

    &::placeholder {
      color: var(--muted);
    }
    &:hover {
      border-color: #c7c9d9;
    }
    &:focus {
      border-color: var(--ring);
      box-shadow: 0 0 0 6px var(--ring-soft);
    }
  }

  textarea {
    min-height: 120px;
    resize: vertical;
    line-height: 1.5;
  }
`;

const OptionSection = styled.section`
  margin-top: 30px;
  padding-top: 22px;
  border-top: 1px dashed var(--border);
`;

const OptionTitle = styled.h4`
  margin: 0 0 14px 0;
  color: var(--text);
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    font-weight: 600;
    color: var(--muted);
  }
`;

/* 옵션 카드: 헤더/바디 분리 + 호버 엘리베이션 */
const OptionCard = styled.div`
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 14px;
  transition: transform 0.12s ease, box-shadow 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(15, 18, 32, 0.06);
    border-color: #c7c9d9;
  }
`;

const OptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 1px dashed var(--border);

  h5 {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    font-weight: 800;
  }
`;

const RemoveOptionButton = styled.button`
  background: var(--danger);
  color: #fff;
  border: none;
  border-radius: 10px;
  width: 34px;
  height: 34px;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 14px;
  transition: transform 0.12s ease, filter 0.12s ease;

  &:hover {
    filter: brightness(0.95);
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.98);
  }
`;

const AddOptionButton = styled.button`
  margin-top: 6px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
  transition: transform 0.12s ease, filter 0.12s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    filter: brightness(0.98);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
`;

/* 액션 바: 반-sticky로 하단 고정 느낌 */
const FormActions = styled.div`
  position: sticky;
  bottom: 0;
  background: linear-gradient(
    to top,
    var(--bg),
    color-mix(in oklab, var(--bg) 85%, transparent)
  );
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding: 16px 0 0;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;

  ${props =>
    props.$primary
      ? `
        background: linear-gradient(135deg, var(--primary-from), var(--primary-to));
        color: #fff;
        box-shadow: 0 6px 16px rgba(79, 70, 229, .28);
        &:hover { transform: translateY(-1px); filter: brightness(1.02); }
        &:active { transform: translateY(0); }
      `
      : `
        background: var(--bg-soft);
        color: var(--text);
        border: 1px solid var(--border);
        &:hover { filter: brightness(0.98); }
      `}
`;

const ScenarioForm: React.FC<ScenarioFormProps> = ({
  formData,
  isEditMode,
  existingBlocks,
  onInputChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onSave,
  onCancel,
}) => {
  const existingSceneIds = existingBlocks.map(block => block.sceneId);
  const availableScenes = existingBlocks.map(block => ({
    sceneId: block.sceneId,
    title: block.title || block.sceneId,
  }));

  return (
    <SceneFormSection>
      <SceneFormHeader>
        <h3>
          {isEditMode
            ? '재난 대응 훈련 시나리오 수정'
            : '재난 대응 훈련 시나리오 생성'}
        </h3>
        <CloseButton onClick={onCancel} aria-label="닫기">
          ✕
        </CloseButton>
      </SceneFormHeader>

      <SceneFormContent>
        {/* 재난 유형 및 난이도 */}
        <FormRow>
          <FieldShell>
            <Label>재난 유형</Label>
            <Control>
              <select
                value={formData.disasterType}
                onChange={e => onInputChange('disasterType', e.target.value)}
              >
                <option value="fire">🔥 화재</option>
                <option value="earthquake">🌍 지진</option>
                <option value="flood">🌊 홍수</option>
                <option value="emergency">🚨 응급상황</option>
                <option value="complex">⚡ 복합재난</option>
              </select>
            </Control>
          </FieldShell>

          <FieldShell>
            <Label>난이도</Label>
            <Control>
              <select
                value={formData.difficulty}
                onChange={e => onInputChange('difficulty', e.target.value)}
              >
                <option value="easy">🟢 초급</option>
                <option value="medium">🟡 중급</option>
                <option value="hard">🔴 고급</option>
              </select>
            </Control>
          </FieldShell>
        </FormRow>

        {/* 시나리오 ID */}
        <FormRow>
          <FieldShell>
            <Label>장면 ID</Label>
            <Control>
              <SceneIdSelector
                value={formData.sceneId}
                onChange={value => onInputChange('sceneId', value)}
                existingSceneIds={existingSceneIds}
                placeholder="장면 ID를 선택하세요"
              />
            </Control>
          </FieldShell>
        </FormRow>

        {/* 제목 */}
        <FieldShell>
          <Label>시나리오 제목</Label>
          <Control>
            <input
              type="text"
              value={formData.title}
              onChange={e => onInputChange('title', e.target.value)}
              placeholder="상황의 제목을 입력하세요"
            />
          </Control>
        </FieldShell>

        {/* 상황 설명 */}
        <FieldShell>
          <Label>상황 설명</Label>
          <Control>
            <textarea
              value={formData.content}
              onChange={e => onInputChange('content', e.target.value)}
              placeholder="현장 상황 설명을 자세히 입력하세요"
            />
          </Control>
        </FieldShell>

        {/* 상황 대사 */}
        <FieldShell>
          <Label>상황 대사</Label>
          <Control>
            <textarea
              value={formData.sceneScript}
              onChange={e => onInputChange('sceneScript', e.target.value)}
              placeholder="캐릭터 대사를 입력하세요"
            />
          </Control>
        </FieldShell>

        {/* 선택지 섹션 */}
        <OptionSection>
          <OptionTitle>
            🎯 선택지 설정 <span>({formData.options.length}개)</span>
          </OptionTitle>

          {formData.options.map((option, index) => (
            <OptionCard key={index}>
              <OptionHeader>
                <h5>선택지 {index + 1}</h5>
                {formData.options.length > 1 && (
                  <RemoveOptionButton
                    aria-label="선택지 삭제"
                    onClick={() => onRemoveOption(index)}
                  >
                    ✕
                  </RemoveOptionButton>
                )}
              </OptionHeader>

              <FieldShell>
                <Label>선택지 내용</Label>
                <Control>
                  <input
                    type="text"
                    value={option.answer}
                    onChange={e =>
                      onOptionChange(index, 'answer', e.target.value)
                    }
                    placeholder="선택할 행동을 입력하세요"
                  />
                </Control>
              </FieldShell>

              <FieldShell>
                <Label>결과 반응</Label>
                <Control>
                  <textarea
                    value={option.reaction}
                    onChange={e =>
                      onOptionChange(index, 'reaction', e.target.value)
                    }
                    placeholder="선택 시 결과/피드백을 입력하세요"
                  />
                </Control>
              </FieldShell>

              <FieldShell>
                <Label>다음 장면</Label>
                <Control>
                  <NextSceneSelector
                    value={option.nextId}
                    onChange={value => onOptionChange(index, 'nextId', value)}
                    availableScenes={availableScenes}
                    currentSceneId={formData.sceneId}
                    placeholder="다음 장면을 선택하세요"
                  />
                </Control>
              </FieldShell>
            </OptionCard>
          ))}

          <AddOptionButton onClick={onAddOption}>
            ➕ 선택지 추가
          </AddOptionButton>
        </OptionSection>

        {/* 저장/취소 버튼 */}
        <FormActions>
          <ActionButton onClick={onCancel}>취소</ActionButton>
          <ActionButton $primary onClick={onSave}>
            {isEditMode ? '시나리오 수정' : '시나리오 저장'}
          </ActionButton>
        </FormActions>
      </SceneFormContent>
    </SceneFormSection>
  );
};

export default ScenarioForm;
