// src/mocks/scenarios/fire-basic.ts
import type { ScenarioStep } from "../../types/scenario";

export const fireBasicSteps: ScenarioStep[] = [
  {
    description: "건물 2층에서 화재 발생. 첫 대응은?",
    choices: [
      "엘리베이터로 이동",
      "119 신고",
      "소화전 호스 사용",
      "계단으로 대피",
    ],
    correctIndex: 3,
  },
  {
    description: "대피 중 복도에 연기가 가득하다. 올바른 행동은?",
    choices: [
      "창문을 활짝 연다",
      "젖은 수건으로 입과 코를 막고 낮은 자세로 이동",
      "엘리베이터 호출",
      "제자리 대기",
    ],
    correctIndex: 1,
  },
  // ... 나머지도 같은 형식
];
