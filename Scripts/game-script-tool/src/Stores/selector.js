import { selector } from "recoil";
import { saveBlockList } from "../Utils/api";
import { blockListAtom } from "./atom";

export const blockListSelector = selector({
  key: "blockListSelector",
  get({ get }) {
    return get(blockListAtom);
  },
  set({ set }, newValue) {
    saveBlockList(newValue);
    set(blockListAtom, newValue);
  },
});
