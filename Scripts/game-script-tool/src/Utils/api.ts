import type { ScriptBlock } from "../types";

const LOCAL_STORAGE_ID = "me.1000ship.game-script-tool";

export const loadBlockList = (): ScriptBlock[] => {
  let cachedBlockList: ScriptBlock[];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_ID);
    cachedBlockList = stored ? JSON.parse(stored) : [];
    if (cachedBlockList === null) cachedBlockList = [];
  } catch {
    cachedBlockList = [];
  }
  return cachedBlockList;
};

export const saveBlockList = (blockList: ScriptBlock[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_ID, JSON.stringify(blockList));
  } catch {
    alert("자동 저장 중 문제 발생");
  }
};

export const exportScript = (blockList: ScriptBlock[]): void => {
  try {
    download(
      JSON.stringify(blockList),
      `script_${Math.floor(Math.random() * 1000)}`,
      "txt"
    );
  } catch {
    alert("저장하는데 문제가 생겼어요");
  }
};

export const importScript = (callback: (data: ScriptBlock[]) => void): void => {
  try {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "text/plain, text/html, .jsp";
    input.click();
    input.onchange = function (event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        processFile(target.files[0]);
      }
    };

    function processFile(file: File): void {
      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function () {
        try {
          const result = reader.result as string;
          const parsed = JSON.parse(result);
          callback(parsed);
        } catch (error) {
          alert("파일 형식이 올바르지 않습니다.");
        }
      };
    }
  } catch {
    alert("불러오는데 문제가 생겼어요");
  }
};

function download(data: string, filename: string, type: string): void {
  const file = new Blob([data], { type: type });

  // Modern browsers only
  const a = document.createElement("a");
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}
