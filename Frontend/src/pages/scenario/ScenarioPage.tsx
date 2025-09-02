import { useState } from "react";
import { fireBasicSteps } from "../../mocks/scenarios/fire-basic";

export default function ScenarioPage() {
  const [current, setCurrent] = useState(0);
  const scenarios = fireBasicSteps;
  const scenario = scenarios[current];

  const handleChoice = () => {
    if (current < scenarios.length - 1) setCurrent((c) => c + 1);
    else alert("훈련이 종료되었습니다!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[linear-gradient(135deg,#232526_0%,#414345_100%)] text-white py-10">
      {/* 상황 설명 영역 추가 */}
      <section className="bg-black/60 rounded-xl p-6 mb-8 w-3/5 shadow-xl leading-relaxed">
        <p className="text-[1.5rem]">
          <strong>상황:</strong> {scenario.description}
        </p>
      </section>
      {/* 선택지 영역 */}
      <section className="flex flex-col gap-4 mb-10 w-3/5">
        {scenario.choices.map((choice, idx) => (
          <button
            key={idx}
            className="w-full bg-red-500 text-white px-8 py-4 text-xl shadow-md transition-colors hover:bg-orange-400 hover:cursor-pointer"
            onClick={handleChoice}
          >
            {String.fromCharCode(65 + idx)}. {choice}
          </button>
        ))}
      </section>
    </div>
  );
}
