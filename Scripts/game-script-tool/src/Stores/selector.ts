import { useBlockListStore } from "./atom";

// Zustand에서는 selector 대신 store 내부에서 computed 값을 계산하거나
// 컴포넌트에서 직접 계산하는 방식을 사용합니다.

export const useBlockListSelector = () => {
  const { blockList, setBlockList } = useBlockListStore();

  // 정렬된 블록 리스트 반환
  const sortedBlockList = [...blockList].sort((a, b) => a.order - b.order);

  // 승인된 블록만 필터링
  const approvedBlocks = blockList.filter(
    (block) => block.approvalStatus === "APPROVED"
  );

  // 대기 중인 블록만 필터링
  const pendingBlocks = blockList.filter(
    (block) => block.approvalStatus === "PENDING"
  );

  return {
    blockList: sortedBlockList,
    approvedBlocks,
    pendingBlocks,
    setBlockList,
  };
};
