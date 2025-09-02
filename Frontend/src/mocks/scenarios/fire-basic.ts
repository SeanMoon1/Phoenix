import type { UIScenarioStep } from "../../types/scenario";

export const fireBasicSteps = [
  {
    id: "fire-1",
    title: "🔥 화재 대응 훈련",
    step: "1단계 / 5단계",
    description: "건물 2층에서 화재가 발생했습니다. 어떻게 대응하시겠습니까?",
    choices: ["즉시 대피한다", "소화기를 사용한다", "119에 신고한다"],
  },
  {
    id: "fire-2",
    title: "🔥 화재 대응 훈련",
    step: "2단계 / 5단계",
    description: "대피 중 연기가 자욱합니다. 어떻게 하시겠습니까?",
    choices: ["젖은 수건으로 입을 막는다", "창문을 연다", "엘리베이터를 탄다"],
  },
] satisfies readonly UIScenarioStep[];
