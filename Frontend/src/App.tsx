import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          🔥 Phoenix - 재난 대응 훈련 시스템
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">개발 환경 설정 완료!</h2>
          <div className="mb-4">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              테스트 카운터: {count}
            </button>
          </div>
          <p className="text-gray-600">
            TailwindCSS와 React가 정상적으로 작동하고 있습니다.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>
              프로젝트 브랜치:{" "}
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                dev.yong
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
