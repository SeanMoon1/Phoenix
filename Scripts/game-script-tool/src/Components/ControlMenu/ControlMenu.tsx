import React from "react";
import styled from "styled-components";
import { useAppStateStore } from "../../Stores/atom";

const Container = styled.div`
  display: flex;
  gap: 10px;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #007bff;
    color: white;
  }

  &.primary {
    background: #007bff;
    color: white;
  }

  &.warning {
    border-color: #ffc107;
    color: #ffc107;

    &:hover {
      background: #ffc107;
      color: white;
    }
  }

  &.danger {
    border-color: #dc3545;
    color: #dc3545;

    &:hover {
      background: #dc3545;
      color: white;
    }
  }
`;

const ControlMenu: React.FC = () => {
  const { openSceneForm } = useAppStateStore();

  const onAddSceneBlockClick = () => {
    openSceneForm();
  };

  const onAddEndingBlockClick = () => {
    const newEndingBlock = {
      sceneId: `#ending-${Date.now()}`,
      title: "훈련 완료",
      content: "재난 대응 훈련이 완료되었습니다.",
      sceneScript:
        "훈련을 통해 배운 내용을 바탕으로 실제 상황에서도 신속하고 정확하게 대응할 수 있기를 바랍니다.",
      approvalStatus: "DRAFT" as const,
      createdAt: new Date().toISOString(),
      createdBy: "시스템",
      order: Date.now(),
      disasterType: "training",
      difficulty: "completed",
      options: [
        {
          answerId: "answer1",
          answer: "훈련 완료 확인",
          reaction: "훈련이 성공적으로 완료되었습니다.",
          nextId: "",
          points: {
            speed: 100,
            accuracy: 100,
          },
        },
      ],
    };

    // 기존 로직 유지 (하위 호환성)
    const currentBlocks = JSON.parse(
      localStorage.getItem("me.phoenix.game-script-tool") || "[]"
    );
    const updatedBlocks = [...currentBlocks, newEndingBlock];
    localStorage.setItem(
      "me.phoenix.game-script-tool",
      JSON.stringify(updatedBlocks)
    );

    alert("훈련 완료 블록이 추가되었습니다!");
  };

  const onImportClick = () => {
    // 기존 import 로직 유지
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.txt,text/plain";
    input.click();
    input.onchange = function (event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.readAsText(target.files[0], "UTF-8");
        reader.onload = function () {
          try {
            const result = reader.result as string;
            const parsed = JSON.parse(result);
            localStorage.setItem(
              "me.phoenix.game-script-tool",
              JSON.stringify(parsed)
            );
            alert("파일이 성공적으로 import되었습니다!");
            window.location.reload();
          } catch (error) {
            alert("파일 형식이 올바르지 않습니다.");
          }
        };
      }
    };
  };

  const onExportClick = () => {
    // 기존 export 로직 유지
    const currentBlocks = JSON.parse(
      localStorage.getItem("me.phoenix.game-script-tool") || "[]"
    );
    const dataStr = JSON.stringify(currentBlocks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `script_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const onClearClick = () => {
    if (
      confirm("모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
    ) {
      localStorage.removeItem("me.phoenix.game-script-tool");
      alert("모든 데이터가 삭제되었습니다!");
      window.location.reload();
    }
  };

  return (
    <Container>
      <Button className="primary" onClick={onAddSceneBlockClick}>
        ➕ Add Scene Block
      </Button>
      <Button className="warning" onClick={onAddEndingBlockClick}>
        🏁 Add Ending Block
      </Button>
      <Button onClick={onImportClick}>📥 Import Script</Button>
      <Button onClick={onExportClick}>📤 Export Script</Button>
      <Button className="danger" onClick={onClearClick}>
        🗑️ Clear All
      </Button>
    </Container>
  );
};

export default ControlMenu;
