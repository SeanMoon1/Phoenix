import React from "react";
import styled from "styled-components";
import {
  SCENE_TYPE_DISASTER,
  SCENE_TYPE_ENDING,
  SCENE_TYPE_TRAINING,
  DISASTER_TYPES,
  DIFFICULTY_LEVELS,
  APPROVAL_STATUS_INFO,
} from "./constant";

const Container = styled.div`
  padding: 10px 0px;
  border-bottom: 1px solid gray;
  z-index: 1;
`;

const InputGroup = styled.div`
  display: flex;
  justify-content: space-between;
`;

const InputPair = styled.div`
  padding: 3px 0px;
`;

const Label = styled.label``;

const TextInput = styled.input``;

const TextArea = styled.textarea`
  width: 100%;
  height: 50px;
  display: block;
`;

const Select = styled.select`
  padding: 5px;
  margin: 0 10px;
`;

// ✅ 승인 상태 표시 스타일
const ApprovalStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background-color: ${(props) => props.color};
`;

const ApprovalButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  background-color: #007bff;
  color: white;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const ScriptInputPresenter = ({
  isModifyMode,
  formData: {
    sceneId,
    sceneScript,
    nextSceneId,
    options,
    sceneType,
    disasterType,
    difficulty,
    timeLimit,
    approvalStatus,
    createdBy,
    createdAt,
    approvedBy,
    approvedAt,
    rejectionReason,
  },
  onInputChange,
  onOptionAddClick,
  onOptionRemoveClick,
  onNewBlockClick,
  onModifyBlockClick,
  onApprovalRequest,
  currentUser,
}) => (
  <Container>
    {/* ✅ 승인 상태 표시 */}
    <ApprovalStatus>
      <span>📋 승인 상태:</span>
      <StatusBadge color={APPROVAL_STATUS_INFO[approvalStatus]?.color}>
        {APPROVAL_STATUS_INFO[approvalStatus]?.emoji}
        {APPROVAL_STATUS_INFO[approvalStatus]?.name}
      </StatusBadge>
      {approvalStatus === "draft" && (
        <ApprovalButton
          onClick={onApprovalRequest}
          disabled={!sceneId || !sceneScript.trim()}
        >
          📤 승인 요청
        </ApprovalButton>
      )}
      {approvalStatus === "rejected" && rejectionReason && (
        <div style={{ color: "#f44336", fontSize: "12px" }}>
          ❌ 거부 사유: {rejectionReason}
        </div>
      )}
    </ApprovalStatus>

    {/* ✅ 재난 대응 시나리오 타입 */}
    <InputPair>
      <span>시나리오 타입 : </span>
      <TextInput
        name="sceneType"
        id="scene-type-disaster"
        data-value={SCENE_TYPE_DISASTER}
        type="radio"
        checked={sceneType === SCENE_TYPE_DISASTER}
        onChange={onInputChange}
      />
      <Label htmlFor="scene-type-disaster">재난 상황</Label>
      <TextInput
        name="sceneType"
        id="scene-type-training"
        data-value={SCENE_TYPE_TRAINING}
        type="radio"
        checked={sceneType === SCENE_TYPE_TRAINING}
        onChange={onInputChange}
      />
      <Label htmlFor="scene-type-training">훈련 진행</Label>
      <TextInput
        name="sceneType"
        id="scene-type-ending"
        data-value={SCENE_TYPE_ENDING}
        type="radio"
        checked={sceneType === SCENE_TYPE_ENDING}
        onChange={onInputChange}
      />
      <Label htmlFor="scene-type-ending">훈련 결과</Label>
    </InputPair>

    {/* Scene ID */}
    <InputPair>
      <Label htmlFor="scene-id">시나리오 ID : </Label>
      <TextInput
        name="sceneId"
        id="scene-id"
        type="text"
        placeholder="#3-1"
        value={sceneId}
        onChange={onInputChange}
        disabled={isModifyMode}
      />
      {isModifyMode && <small> 수정 중</small>}
    </InputPair>

    {/* ✅ 재난 유형 선택 */}
    {sceneType !== SCENE_TYPE_ENDING && (
      <InputPair>
        <Label htmlFor="disaster-type">재난 유형 : </Label>
        <Select
          name="disasterType"
          id="disaster-type"
          value={disasterType}
          onChange={onInputChange}
        >
          <option value={DISASTER_TYPES.FIRE}>🔥 화재</option>
          <option value={DISASTER_TYPES.EARTHQUAKE}>🌋 지진</option>
          <option value={DISASTER_TYPES.EMERGENCY}>🚑 응급처치</option>
          <option value={DISASTER_TYPES.FLOOD}>🌊 침수/홍수</option>
          <option value={DISASTER_TYPES.COMPLEX}>⚡ 복합 재난</option>
        </Select>
      </InputPair>
    )}

    {/* ✅ 난이도 선택 */}
    {sceneType !== SCENE_TYPE_ENDING && (
      <InputPair>
        <Label htmlFor="difficulty">난이도 : </Label>
        <Select
          name="difficulty"
          id="difficulty"
          value={difficulty}
          onChange={onInputChange}
        >
          <option value={DIFFICULTY_LEVELS.EASY}>🟢 쉬움</option>
          <option value={DIFFICULTY_LEVELS.MEDIUM}>🟡 보통</option>
          <option value={DIFFICULTY_LEVELS.HARD}>🔴 어려움</option>
        </Select>
      </InputPair>
    )}

    {/* ✅ 타이머 설정 */}
    {sceneType !== SCENE_TYPE_ENDING && (
      <InputPair>
        <Label htmlFor="time-limit">제한 시간 (초) : </Label>
        <TextInput
          name="timeLimit"
          id="time-limit"
          type="number"
          min="10"
          max="300"
          value={timeLimit}
          onChange={onInputChange}
          placeholder="60"
        />
      </InputPair>
    )}

    {/* 시나리오 스크립트 */}
    <InputPair>
      <Label htmlFor="scene-script">상황 설명 : </Label>
      <TextArea
        name="sceneScript"
        value={sceneScript}
        onChange={onInputChange}
        id="scene-script"
        placeholder={
          sceneType === SCENE_TYPE_ENDING
            ? "훈련 완료! 총점: 85점, 신속성: 90점, 정확성: 80점"
            : "건물 3층에서 화재가 발생했습니다. 연기가 계단을 타고 올라오고 있습니다. 어떻게 하시겠습니까?"
        }
      />
    </InputPair>

    {/* ✅ 주석 처리로 보존 (나중에 사용 가능) */}
    {sceneType !== SCENE_TYPE_ENDING && (
      <InputGroup>
        <InputPair>
          <Label htmlFor="background-image">배경 이미지 : </Label>
          <TextInput
            name="backgroundImage"
            value=""
            onChange={onInputChange}
            id="background-image"
            placeholder="fire_scene.png (선택입력)"
            disabled
          />
          <small style={{ color: "gray" }}> - 주석 처리됨</small>
        </InputPair>
        <InputPair>
          <Label htmlFor="scene-sound">상황 음향 : </Label>
          <TextInput
            name="sceneSound"
            value=""
            onChange={onInputChange}
            id="scene-sound"
            placeholder="fire_alarm.mp3 (선택입력)"
            disabled
          />
          <small style={{ color: "gray" }}> - 주석 처리됨</small>
        </InputPair>
      </InputGroup>
    )}

    {/* 선택지 시스템 */}
    {sceneType !== SCENE_TYPE_ENDING && (
      <>
        {options.length > 0 ? (
          options.map(({ answer, reaction, nextId, points }, i) => (
            <InputPair
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid #ddd",
                padding: "10px",
                margin: "5px 0",
              }}
            >
              <div style={{ display: "flex", marginBottom: "5px" }}>
                <Label style={{ marginRight: "10px" }}>{i + 1}. </Label>
                <TextInput
                  style={{ flex: 1, marginRight: "10px" }}
                  type="text"
                  placeholder="선택지 (예: 대피, 신고, 진화 시도)"
                  name="answer"
                  data-option-index={i}
                  value={answer}
                  onChange={onInputChange}
                />
                <TextInput
                  style={{ flex: 1, marginRight: "10px" }}
                  type="text"
                  placeholder="결과/반응 (예: 안전하게 대피했습니다)"
                  name="reaction"
                  data-option-index={i}
                  value={reaction}
                  onChange={onInputChange}
                />
                <TextInput
                  type="text"
                  placeholder={`#3-${i + 2}`}
                  name="nextId"
                  data-option-index={i}
                  value={nextId}
                  onChange={onInputChange}
                />
              </div>
              {/* ✅ 점수 시스템 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <div>
                  <Label>신속성: </Label>
                  <TextInput
                    type="number"
                    min="0"
                    max="100"
                    name="speed"
                    data-option-index={i}
                    value={points?.speed || 0}
                    onChange={onInputChange}
                    style={{ width: "50px" }}
                  />
                </div>
                <div>
                  <Label>정확성: </Label>
                  <TextInput
                    type="number"
                    min="0"
                    max="100"
                    name="accuracy"
                    data-option-index={i}
                    value={points?.accuracy || 0}
                    onChange={onInputChange}
                    style={{ width: "50px" }}
                  />
                </div>
                {/* ❌ 협업 점수 제거 - 싱글 플레이 불필요 */}
              </div>
            </InputPair>
          ))
        ) : (
          <InputPair>
            <Label htmlFor="next-scene-id">다음 시나리오 ID : </Label>
            <TextInput
              name="nextSceneId"
              value={nextSceneId}
              onChange={onInputChange}
              id="next-scene-id"
              type="text"
              placeholder="#4-1"
            />
          </InputPair>
        )}
        <button onClick={onOptionAddClick}>선택지 추가</button>
        {options.length > 0 && (
          <button onClick={onOptionRemoveClick}>선택지 삭제</button>
        )}
        <br />
      </>
    )}
    <button onClick={isModifyMode ? onModifyBlockClick : onNewBlockClick}>
      {isModifyMode ? "블럭 수정" : "블럭 추가"}
    </button>
  </Container>
);

export default ScriptInputPresenter;
