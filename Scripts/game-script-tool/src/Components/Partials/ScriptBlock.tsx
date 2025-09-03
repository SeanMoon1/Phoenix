/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import styled from "styled-components";
import { APPROVAL_STATUS_INFO } from "../ScriptInput/constants";
import { ScriptBlock as ScriptBlockType, ApprovalStatus } from "../../types";

const Container = styled.div`
  background-color: #efefef;
  padding: 10px;
  margin: 5px;
  position: relative;
`;

const SceneID = styled.div`
  font-weight: 800;
  cursor: pointer;
  & small {
    font-weight: 400;
    cursor: default;
    margin-left: 8px;
  }
`;

// 재난 정보 스타일 추가
const DisasterInfo = styled.div`
  margin-top: 5px;
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #666;
`;

const InfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

// 승인 상태 표시 스타일
const ApprovalStatusContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
`;

const StatusBadge = styled.span<{ color: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  color: white;
  background-color: ${(props) => props.color};
`;

const CreatorInfo = styled.div`
  font-size: 11px;
  color: #666;
  text-align: right;
`;

const SceneScript = styled.div`
  margin-top: 5px;
  background-color: white;
  padding: 5px;
  border-radius: 3px;
`;

const OptionGroup = styled.ol``;
const OptionItem = styled.li``;

// 점수 표시 스타일
const ScoreInfo = styled.div`
  margin-top: 5px;
  font-size: 12px;
  color: #555;
  background-color: #f8f8f8;
  padding: 5px;
  border-radius: 3px;
`;

const ScoreItem = styled.span`
  margin-right: 15px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

interface ScriptBlockProps {
  block: ScriptBlockType;
  moveBlockBy: (sceneId: string, by: number) => void;
  removeBlock: (sceneId: string) => void;
  modifyBlock: (sceneId: string) => void;
  blockList: ScriptBlockType[];
}

const ScriptBlock: React.FC<ScriptBlockProps> = ({
  block,
  moveBlockBy,
  removeBlock,
  modifyBlock,
  blockList,
}) => {
  const getDisasterEmoji = (type: string): string => {
    switch (type) {
      case "fire":
        return "🔥";
      case "earthquake":
        return "🌋";
      case "emergency":
        return "🚑";
      case "flood":
        return "🌊";
      case "complex":
        return "⚠️";
      default:
        return "❓";
    }
  };

  const getDifficultyEmoji = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const getStatusInfo = (status: ApprovalStatus) => {
    return (
      APPROVAL_STATUS_INFO[status] || APPROVAL_STATUS_INFO[ApprovalStatus.DRAFT]
    );
  };

  const statusInfo = getStatusInfo(block.approvalStatus);

  return (
    <Container>
      <ApprovalStatusContainer>
        <StatusBadge color={statusInfo.color}>
          {statusInfo.emoji} {statusInfo.name}
        </StatusBadge>
        <CreatorInfo>
          작성자: {block.createdBy}
          {block.approvedBy && (
            <>
              <br />
              승인자: {block.approvedBy}
            </>
          )}
        </CreatorInfo>
      </ApprovalStatusContainer>

      <SceneID onClick={() => modifyBlock(block.sceneId)}>
        Scene {block.sceneId}
        <small>
          (순서: {block.order}, 작성:{" "}
          {new Date(block.createdAt).toLocaleDateString()})
        </small>
      </SceneID>

      <DisasterInfo>
        <InfoItem>
          {getDisasterEmoji(block.disasterType || "unknown")}{" "}
          {block.disasterType || "재난 유형"}
        </InfoItem>
        <InfoItem>
          {getDifficultyEmoji(block.difficulty || "medium")}{" "}
          {block.difficulty || "난이도"}
        </InfoItem>
      </DisasterInfo>

      <SceneScript>{block.content || block.sceneScript}</SceneScript>

      {block.options && block.options.length > 0 && (
        <OptionGroup>
          {block.options.map((option) => (
            <OptionItem key={option.answerId}>
              <div style={{ marginBottom: "5px" }}>
                <strong>{option.answerId}</strong>: {option.answer}
              </div>
              <div style={{ marginBottom: "5px", color: "#666" }}>
                → {option.reaction}
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                다음 장면: {option.nextId}
              </div>
              {option.points && (
                <ScoreInfo>
                  <ScoreItem>🏃 신속성: {option.points.speed || 0}점</ScoreItem>
                  <ScoreItem>
                    🎯 정확성: {option.points.accuracy || 0}점
                  </ScoreItem>
                </ScoreInfo>
              )}
            </OptionItem>
          ))}
        </OptionGroup>
      )}

      <div style={{ marginTop: "10px", textAlign: "right" }}>
        <button
          onClick={() => moveBlockBy(block.sceneId, -1)}
          disabled={
            blockList.findIndex((b) => b.sceneId === block.sceneId) === 0
          }
        >
          ⬆️ 위로
        </button>
        <button
          onClick={() => moveBlockBy(block.sceneId, 1)}
          disabled={
            blockList.findIndex((b) => b.sceneId === block.sceneId) ===
            blockList.length - 1
          }
        >
          ⬇️ 아래로
        </button>
        <button onClick={() => modifyBlock(block.sceneId)}>✏️ 수정</button>
        <button onClick={() => removeBlock(block.sceneId)}>🗑️ 삭제</button>
      </div>
    </Container>
  );
};

export default ScriptBlock;
