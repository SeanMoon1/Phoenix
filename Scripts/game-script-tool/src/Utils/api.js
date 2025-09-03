const LOCAL_STORAGE_ID = "me.1000ship.game-script-tool";

export const loadBlockList = () => {
  let cachedBlockList;
  try {
    cachedBlockList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ID));
    if (cachedBlockList === null) cachedBlockList = [];
  } catch {
    cachedBlockList = [];
  }
  return cachedBlockList;
};

export const saveBlockList = (blockList) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_ID, JSON.stringify(blockList));
  } catch {
    alert("자동 저장 중 문제 발생");
  }
};

export const exportScript = (blockList) => {
  try {
    download(
      JSON.stringify(blockList),
      `script_${parseInt(Math.random() * 1000)}`,
      "txt"
    );
  } catch {
    alert("저장하는데 문제가 생겼어요");
  }
};

export const importScript = (callback) => {
  try {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "text/plain, text/html, .jsp";
    input.click();
    input.onchange = function (event) {
      processFile(event.target.files[0]);
    };
    function processFile(file) {
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function () {
        callback( JSON.parse(reader.result) )
      };
    }
  } catch {
    alert("불러오는데 문제가 생겼어요");
  }
};

function download(data, filename, type) {
  var file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}
