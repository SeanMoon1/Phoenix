import { create } from 'zustand';
import type { ScriptBlock, AppState } from '../types';

interface BlockListStore {
  blockList: ScriptBlock[];
  setBlockList: (blockList: ScriptBlock[]) => void;
  addBlock: (block: ScriptBlock) => void;
  updateBlock: (sceneId: string, updates: Partial<ScriptBlock>) => void;
  removeBlock: (sceneId: string) => void;
}

interface AppStateStore {
  appState: AppState;
  setAppState: (appState: AppState) => void;
  openSceneForm: (modifySceneId?: string) => void;
  closeSceneForm: () => void;
}

export const useBlockListStore = create<BlockListStore>((set) => ({
  blockList: [],
  setBlockList: (blockList) => set({ blockList }),
  addBlock: (block) => set((state) => ({ 
    blockList: [...state.blockList, block] 
  })),
  updateBlock: (sceneId, updates) => set((state) => ({
    blockList: state.blockList.map(block => 
      block.sceneId === sceneId ? { ...block, ...updates } : block
    )
  })),
  removeBlock: (sceneId) => set((state) => ({
    blockList: state.blockList.filter(block => block.sceneId !== sceneId)
  })),
}));

export const useAppStateStore = create<AppStateStore>((set) => ({
  appState: {
    isSceneFormOpened: false,
    modifySceneId: null,
  },
  setAppState: (appState) => set({ appState }),
  openSceneForm: (modifySceneId) => set((state) => ({
    appState: {
      ...state.appState,
      isSceneFormOpened: true,
      modifySceneId: modifySceneId || null,
    }
  })),
  closeSceneForm: () => set((state) => ({
    appState: {
      ...state.appState,
      isSceneFormOpened: false,
      modifySceneId: null,
    }
  })),
}));
