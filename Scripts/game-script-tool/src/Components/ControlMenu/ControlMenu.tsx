import React from "react";
import styled from "styled-components";
import { useBlockListStore, useAppStateStore } from "../../Stores/atom";
import { exportScript, importScript } from "../../Utils/api";
import type { ScriptBlock } from "../../types";
import { ApprovalStatus } from "../../types";

const Container = styled.div`
  position: fixed;
  right: 5px;
  bottom: 5px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ControlButton = styled.button`
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }

  &:active {
    background: #004085;
  }
`;

const ControlMenu: React.FC = () => {
  const { openSceneForm } = useAppStateStore();
  const { blockList, setBlockList } = useBlockListStore();

  const onAddSceneBlockClick = (): void => {
    openSceneForm();
  };

  const onAddEndingBlockClick = (): void => {
    // Ending Block 추가 로직
    const newEndingBlock: ScriptBlock = {
      sceneId: `ending_${Date.now()}`,
      title: "엔딩 시나리오",
      content: "훈련 완료 후 결과 표시",
      sceneScript: "훈련이 완료되었습니다. 결과를 확인하세요.",
      approvalStatus: ApprovalStatus.DRAFT,
      createdAt: new Date().toISOString(),
      createdBy: "admin",
      order: blockList.length,
      sceneType: "ending",
      disasterType: "none",
      difficulty: "easy",
      rejectionReason: "",
      options: [],
      nextSceneId: "",
    };

    setBlockList([...blockList, newEndingBlock]);
  };

  const onImportClick = (): void =>
    importScript((data: ScriptBlock[]) => setBlockList(data));

  const onExportClick = (): void => exportScript(blockList);

  const onClearScriptClick = (): void => {
    if (!window.confirm("정말 모든 Scene을 삭제할까요??")) return;
    setBlockList([]);
    window.alert("삭제했습니다. 원치않았다면 지금 당장 새로고침을 눌러주세요.");
  };

  return (
    <Container>
      <ControlButton onClick={onAddSceneBlockClick}>
        ➕ Add Scene Block
      </ControlButton>
      <ControlButton onClick={onAddEndingBlockClick}>
        🎬 Add Ending Block
      </ControlButton>
      <ControlButton onClick={onImportClick}>📥 Import Script</ControlButton>
      <ControlButton onClick={onExportClick}>📤 Export Script</ControlButton>
      <ControlButton onClick={onClearScriptClick}>
        🗑️ Clear Script
      </ControlButton>
    </Container>
  );
};

export default ControlMenu;
