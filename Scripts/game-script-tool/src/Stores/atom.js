import { atom } from "recoil";
import { loadBlockList } from "../Utils/api";

export const blockListAtom = atom({
  key: "blockListAtom",
  default: loadBlockList(),
});

export const appStateAtom = atom({
  key: "appStateAtom",
  default: {
    isSceneFormOpened: false,
    modifySceneId: null,
  },
});
