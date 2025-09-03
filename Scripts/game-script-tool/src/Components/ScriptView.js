import React from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { appStateAtom } from "../Stores/atom";
import { blockListSelector } from "../Stores/selector";
import ScriptBlock from "./Partials/ScriptBlock";

const Container = styled.div`
  padding: 5px 0px;
`;

const ScriptView = () => {
  const [blockList, setBlockList] = useRecoilState(blockListSelector);
  const [appState, setAppState] = useRecoilState(appStateAtom);

  const moveBlockBy = (sceneId, by) => {
    setBlockList((blockList) => {
      const index = blockList.findIndex((block) => block.sceneId === sceneId);
      const at = index + by;
      if (at < 0 || at >= blockList.length) return blockList;
      const tmpArray = [
        ...blockList.slice(0, index),
        ...blockList.slice(index + 1),
      ];
      const result = [
        ...tmpArray.slice(0, at),
        blockList[index],
        ...tmpArray.slice(at),
      ];
      return result;
    });
  };

  const removeBlock = (sceneId) => {
    if (!window.confirm("삭제한 후 되돌릴 수 없습니다. 삭제하시겠습니까?"))
      return;
    setBlockList((blockList) =>
      blockList.filter((block) => block.sceneId !== sceneId)
    );
  };

  const modifyBlock = (sceneId) =>
    setAppState({
      ...appState,
      isSceneFormOpened: true,
      modifySceneId: sceneId,
    });

  return (
    <Container>
      {blockList.map((block, i) => (
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
