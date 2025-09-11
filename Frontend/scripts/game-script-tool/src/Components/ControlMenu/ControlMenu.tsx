import React from 'react';
import { useAppStateStore } from '../../Stores/atom';

const ControlMenu: React.FC = () => {
  const { openSceneForm } = useAppStateStore();

  const onAddSceneBlockClick = () => {
    openSceneForm();
  };

  const onImportClick = () => {
    // 기존 import 로직 유지
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt,text/plain';
    input.click();
    input.onchange = function (event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.readAsText(target.files[0], 'UTF-8');
        reader.onload = function () {
          try {
            const result = reader.result as string;
            const parsed = JSON.parse(result);
            localStorage.setItem(
              'me.phoenix.game-script-tool',
              JSON.stringify(parsed)
            );
            alert('파일이 성공적으로 import되었습니다!');
            window.location.reload();
          } catch (error) {
            alert('파일 형식이 올바르지 않습니다.');
          }
        };
      }
    };
  };

  const onExportClick = () => {
    // 기존 export 로직 유지
    const currentBlocks = JSON.parse(
      localStorage.getItem('me.phoenix.game-script-tool') || '[]'
    );

    // 완료 블록이 없는 경우 자동으로 추가
    const hasEndingBlock = currentBlocks.some(
      (block: any) => block.sceneId && block.sceneId.startsWith('#ending-')
    );

    let blocksToExport = currentBlocks;
    if (!hasEndingBlock && currentBlocks.length > 0) {
      const autoEndingBlock = {
        sceneId: `#ending-${Date.now()}`,
        title: '훈련 완료',
        content: '재난 대응 훈련이 완료되었습니다.',
        sceneScript:
          '훈련을 통해 배운 내용을 바탕으로 실제 상황에서도 신속하고 정확하게 대응할 수 있기를 바랍니다.',
        approvalStatus: 'DRAFT' as const,
        createdAt: new Date().toISOString(),
        createdBy: '시스템',
        order: Date.now(),
        disasterType: 'training',
        difficulty: 'completed',
        options: [
          {
            answerId: 'answer1',
            answer: '훈련 완료 확인',
            reaction: '훈련이 성공적으로 완료되었습니다.',
            nextId: '',
            points: {
              speed: 100,
              accuracy: 100,
            },
          },
        ],
      };
      blocksToExport = [...currentBlocks, autoEndingBlock];
    }

    const dataStr = JSON.stringify(blocksToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `script_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const onClearClick = () => {
    if (
      confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    ) {
      localStorage.removeItem('me.phoenix.game-script-tool');
      alert('모든 데이터가 삭제되었습니다!');
      window.location.reload();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-600 p-6">
      <div className="flex flex-col space-y-3">
        {/* 첫 번째 행 */}
        <div className="flex space-x-3">
          <button
            onClick={onAddSceneBlockClick}
            className="flex-1 flex flex-col items-center justify-center space-y-2 px-3 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-lg hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px]"
          >
            <span className="text-xl">➕</span>
            <span className="text-xs text-center">시나리오 생성</span>
          </button>
          <button
            onClick={onImportClick}
            className="flex-1 flex flex-col items-center justify-center space-y-2 px-3 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 min-h-[80px]"
          >
            <span className="text-xl">📥</span>
            <span className="text-xs text-center">시나리오 가져오기</span>
          </button>
        </div>
        {/* 두 번째 행 */}
        <div className="flex space-x-3">
          <button
            onClick={onExportClick}
            className="flex-1 flex flex-col items-center justify-center space-y-2 px-3 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 min-h-[80px]"
          >
            <span className="text-xl">📤</span>
            <span className="text-xs text-center">시나리오 내보내기</span>
          </button>
          <button
            onClick={onClearClick}
            className="flex-1 flex flex-col items-center justify-center space-y-2 px-3 py-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 min-h-[80px]"
          >
            <span className="text-xl">🗑️</span>
            <span className="text-xs text-center">모든 시나리오 삭제</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlMenu;
