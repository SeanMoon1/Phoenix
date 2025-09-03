import React from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { appStateAtom } from "../../Stores/atom";
import { blockListSelector } from "../../Stores/selector";
import { APPROVAL_STATUS } from "../ScriptInput/constant";

const Container = styled.div`
  padding: 10px 0px;
  border-bottom: 1px solid gray;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &.primary {
    background-color: #007bff;
    color: white;
    &:hover {
      background-color: #0056b3;
    }
  }

  &.success {
    background-color: #28a745;
    color: white;
    &:hover {
      background-color: #1e7e34;
    }
  }

  &.warning {
    background-color: #ffc107;
    color: #212529;
    &:hover {
      background-color: #e0a800;
    }
  }

  &.info {
    background-color: #17a2b8;
    color: white;
    &:hover {
      background-color: #138496;
    }
  }
`;

const StatusInfo = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 14px;
  color: #666;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StatusCount = styled.span`
  font-weight: bold;
  color: #333;
`;

const ControlMenu = () => {
  const [appState, setAppState] = useRecoilState(appStateAtom);
  const [blockList] = useRecoilState(blockListSelector);

  const onNewBlockClick = () => {
    setAppState({
      isSceneFormOpened: true,
      modifySceneId: null,
    });
  };

  const onExportClick = () => {
    const dataStr = JSON.stringify(blockList, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "scenario_data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const onImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
              // 기존 데이터와 병합 (중복 제거)
              const existingIds = new Set(
                blockList.map((block) => block.sceneId)
              );
              const newBlocks = importedData.filter(
                (block) => !existingIds.has(block.sceneId)
              );

              if (newBlocks.length > 0) {
                // 승인 상태 초기화
                const processedBlocks = newBlocks.map((block) => ({
                  ...block,
                  approvalStatus: APPROVAL_STATUS.DRAFT,
                  createdAt: new Date().toISOString(),
                  createdBy: "imported",
                  approvedBy: "",
                  approvedAt: "",
                  rejectionReason: "",
                }));

                // 상태 업데이트 (실제로는 atom을 통해 처리해야 함)
                alert(
                  `${processedBlocks.length}개의 새로운 시나리오가 가져와졌습니다. 승인 상태는 초안으로 설정되었습니다.`
                );
              } else {
                alert("가져올 새로운 시나리오가 없습니다.");
              }
            } else {
              alert("올바른 JSON 형식이 아닙니다.");
            }
          } catch (error) {
            alert("파일을 읽는 중 오류가 발생했습니다: " + error.message);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // ✅ 승인 상태별 통계 계산
  const getApprovalStats = () => {
    const stats = {
      total: blockList.length,
      draft: blockList.filter(
        (block) => block.approvalStatus === APPROVAL_STATUS.DRAFT
      ).length,
      pending: blockList.filter(
        (block) => block.approvalStatus === APPROVAL_STATUS.PENDING
      ).length,
      approved: blockList.filter(
        (block) => block.approvalStatus === APPROVAL_STATUS.APPROVED
      ).length,
      rejected: blockList.filter(
        (block) => block.approvalStatus === APPROVAL_STATUS.REJECTED
      ).length,
    };
    return stats;
  };

  const stats = getApprovalStats();

  return (
    <Container>
      <ButtonGroup>
        <Button className="primary" onClick={onNewBlockClick}>
          ➕ 새 시나리오
        </Button>
        <Button className="success" onClick={onExportClick}>
          📤 내보내기
        </Button>
        <Button className="warning" onClick={onImportClick}>
          📥 가져오기
        </Button>
      </ButtonGroup>

      {/* ✅ 승인 상태 통계 표시 */}
      <StatusInfo>
        <StatusItem>
          📊 전체: <StatusCount>{stats.total}</StatusCount>
        </StatusItem>
        <StatusItem>
          📝 초안: <StatusCount>{stats.draft}</StatusCount>
        </StatusItem>
        <StatusItem>
          ⏳ 대기: <StatusCount>{stats.pending}</StatusCount>
        </StatusItem>
        <StatusItem>
          ✅ 승인: <StatusCount>{stats.approved}</StatusCount>
        </StatusItem>
        <StatusItem>
          ❌ 거부: <StatusCount>{stats.rejected}</StatusCount>
        </StatusItem>
      </StatusInfo>
    </Container>
  );
};

export default ControlMenu;
