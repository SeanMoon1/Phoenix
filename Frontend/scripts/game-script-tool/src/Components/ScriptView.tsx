import React from "react";
import styled from "styled-components";
import { useBlockListStore, useAppStateStore } from "../Stores/atom";
import ScriptBlock from "../Components/Partials/ScriptBlock";
import type { ScriptBlock as ScriptBlockType } from "../types";

const Container = styled.div`
  padding: 5px 0px;
`;

const ScriptView: React.FC = () => {
  const { blockList, setBlockList, updateBlock } = useBlockListStore();
  const { openSceneForm } = useAppStateStore();

  const moveBlockBy = (sceneId: string, by: number): void => {
    const index = blockList.findIndex(
      (block: ScriptBlockType) => block.sceneId === sceneId
    );
    const at = index + by;
    if (at < 0 || at >= blockList.length) return;

    const tmpArray = [
      ...blockList.slice(0, index),
      ...blockList.slice(index + 1),
    ];
    const result = [
      ...tmpArray.slice(0, at),
      blockList[index],
      ...tmpArray.slice(at),
    ];

    // 순서 업데이트
    result.forEach((block: ScriptBlockType, newIndex: number) => {
      updateBlock(block.sceneId, { order: newIndex });
    });

    setBlockList(result);
  };

  const removeBlock = (sceneId: string): void => {
    if (!window.confirm("삭제한 후 되돌릴 수 없습니다. 삭제하시겠습니까?"))
      return;

    const updatedBlockList = blockList.filter(
      (block: ScriptBlockType) => block.sceneId !== sceneId
    );
    setBlockList(updatedBlockList);
  };

  const modifyBlock = (sceneId: string): void => {
    openSceneForm(sceneId);
  };

  // 완료 블록은 관리자에게 보이지 않도록 필터링
  const visibleBlocks = blockList.filter(
    (block: ScriptBlockType) =>
      !block.sceneId || !block.sceneId.startsWith("#ending-")
  );

  return (
    <Container>
      {visibleBlocks.map((block: ScriptBlockType) => (
        <ScriptBlock
          key={block.sceneId}
          block={block}
          moveBlockBy={moveBlockBy}
          removeBlock={removeBlock}
          modifyBlock={modifyBlock}
          blockList={blockList}
        />
      ))}
    </Container>
  );
};

export default ScriptView;
