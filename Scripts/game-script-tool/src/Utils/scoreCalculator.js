import {
  SCORE_WEIGHTS,
  SCORE_GRADES,
} from "../Components/ScriptInput/constant";

/**
 * 훈련 결과 점수 계산
 * @param {Array} userChoices - 사용자 선택 기록
 * @param {Array} blockList - 전체 시나리오 블록 목록
 * @returns {Object} 계산된 점수 및 분석 결과
 */
export const calculateTrainingScore = (userChoices, blockList) => {
  let totalSpeedScore = 0;
  let totalAccuracyScore = 0;
  let totalChoices = 0;
  const choiceDetails = [];

  userChoices.forEach((choice) => {
    const { sceneId, selectedOptionIndex, timeSpent } = choice;
    const block = blockList.find((b) => b.sceneId === sceneId);

    if (block && block.options[selectedOptionIndex]) {
      const option = block.options[selectedOptionIndex];
      const speedScore = option.points?.speed || 0;
      const accuracyScore = option.points?.accuracy || 0;

      // 시간 보너스 계산 (빠를수록 높은 점수)
      const timeBonus = Math.max(0, 100 - (timeSpent / block.timeLimit) * 100);
      const adjustedSpeedScore = Math.min(100, speedScore + timeBonus);

      totalSpeedScore += adjustedSpeedScore;
      totalAccuracyScore += accuracyScore;
      totalChoices++;

      choiceDetails.push({
        sceneId,
        choice: option.answer,
        speedScore: adjustedSpeedScore,
        accuracyScore,
        timeSpent,
        timeLimit: block.timeLimit,
        feedback: generateChoiceFeedback(
          adjustedSpeedScore,
          accuracyScore,
          timeSpent,
          block.timeLimit
        ),
      });
    }
  });

  if (totalChoices === 0) {
    return {
      totalScore: 0,
      speedScore: 0,
      accuracyScore: 0,
      grade: "POOR",
      gradeInfo: SCORE_GRADES.POOR,
      choiceDetails: [],
      overallFeedback: "훈련을 완료하지 못했습니다.",
    };
  }

  const averageSpeedScore = totalSpeedScore / totalChoices;
  const averageAccuracyScore = totalAccuracyScore / totalChoices;

  // 가중 평균으로 총점 계산
  const totalScore = Math.round(
    averageSpeedScore * SCORE_WEIGHTS.SPEED +
      averageAccuracyScore * SCORE_WEIGHTS.ACCURACY
  );

  const grade = getScoreGrade(totalScore);
  const gradeInfo = SCORE_GRADES[grade];
  const overallFeedback = generateOverallFeedback(
    totalScore,
    averageSpeedScore,
    averageAccuracyScore
  );

  return {
    totalScore,
    speedScore: Math.round(averageSpeedScore),
    accuracyScore: Math.round(averageAccuracyScore),
    grade,
    gradeInfo,
    choiceDetails,
    overallFeedback,
    improvementSuggestions: generateImprovementSuggestions(
      averageSpeedScore,
      averageAccuracyScore
    ),
  };
};

/**
 * 점수 등급 결정
 * @param {number} score - 총점
 * @returns {string} 등급
 */
const getScoreGrade = (score) => {
  if (score >= SCORE_GRADES.EXCELLENT.min) return "EXCELLENT";
  if (score >= SCORE_GRADES.GOOD.min) return "GOOD";
  if (score >= SCORE_GRADES.AVERAGE.min) return "AVERAGE";
  if (score >= SCORE_GRADES.BELOW_AVERAGE.min) return "BELOW_AVERAGE";
  return "POOR";
};

/**
 * 선택별 피드백 생성
 * @param {number} speedScore - 신속성 점수
 * @param {number} accuracyScore - 정확성 점수
 * @param {number} timeSpent - 소요 시간
 * @param {number} timeLimit - 제한 시간
 * @returns {string} 피드백 메시지
 */
const generateChoiceFeedback = (
  speedScore,
  accuracyScore,
  timeSpent,
  timeLimit
) => {
  const timeRatio = timeSpent / timeLimit;

  if (speedScore >= 90 && accuracyScore >= 90) {
    return "완벽한 대응입니다! 신속하고 정확한 판단을 하셨습니다.";
  } else if (speedScore >= 80 && accuracyScore >= 80) {
    return "훌륭한 대응입니다. 조금 더 빠르게 반응하면 더 좋겠습니다.";
  } else if (timeRatio > 0.8) {
    return "시간이 부족했습니다. 더 빠른 판단이 필요합니다.";
  } else if (accuracyScore < 70) {
    return "정확한 판단이 필요합니다. 안전 수칙을 다시 한번 확인해보세요.";
  } else {
    return "적절한 대응입니다. 더 나은 결과를 위해 노력해보세요.";
  }
};

/**
 * 전체 피드백 생성
 * @param {number} totalScore - 총점
 * @param {number} speedScore - 신속성 점수
 * @param {number} accuracyScore - 정확성 점수
 * @returns {string} 전체 피드백
 */
const generateOverallFeedback = (totalScore, speedScore, accuracyScore) => {
  if (totalScore >= 90) {
    return "훌륭합니다! 재난 대응에 대한 깊은 이해와 빠른 판단력을 보여주셨습니다.";
  } else if (totalScore >= 80) {
    return "잘했습니다! 대부분의 상황에 적절하게 대응하셨습니다.";
  } else if (totalScore >= 70) {
    return "보통 수준입니다. 더 나은 결과를 위해 추가 훈련이 필요합니다.";
  } else if (totalScore >= 60) {
    return "기본적인 대응은 가능하지만, 많은 개선이 필요합니다.";
  } else {
    return "재난 대응에 대한 기본 지식과 훈련이 필요합니다.";
  }
};

/**
 * 개선 제안 생성
 * @param {number} speedScore - 신속성 점수
 * @param {number} accuracyScore - 정확성 점수
 * @returns {Array} 개선 제안 목록
 */
const generateImprovementSuggestions = (speedScore, accuracyScore) => {
  const suggestions = [];

  if (speedScore < 80) {
    suggestions.push("신속성 향상을 위해 상황 판단 속도를 높여보세요.");
  }

  if (accuracyScore < 80) {
    suggestions.push("정확성 향상을 위해 안전 수칙을 다시 한번 학습해보세요.");
  }

  if (speedScore < 70 && accuracyScore < 70) {
    suggestions.push("기본적인 재난 대응 훈련을 반복적으로 진행해보세요.");
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "현재 수준을 유지하면서 더 높은 단계의 훈련에 도전해보세요."
    );
  }

  return suggestions;
};

/**
 * 다음 훈련 추천
 * @param {string} currentGrade - 현재 등급
 * @param {Array} availableScenarios - 사용 가능한 시나리오 목록
 * @returns {Object} 추천 시나리오 정보
 */
export const recommendNextTraining = (currentGrade, availableScenarios) => {
  const scenarios = availableScenarios.filter((s) => s.sceneType !== "ending");

  if (scenarios.length === 0) return null;

  // 등급별 난이도 추천
  let recommendedDifficulty;
  switch (currentGrade) {
    case "EXCELLENT":
      recommendedDifficulty = "hard";
      break;
    case "GOOD":
      recommendedDifficulty = "medium";
      break;
    case "AVERAGE":
      recommendedDifficulty = "medium";
      break;
    default:
      recommendedDifficulty = "easy";
  }

  // 추천 난이도의 시나리오 중 랜덤 선택
  const recommendedScenarios = scenarios.filter(
    (s) => s.difficulty === recommendedDifficulty
  );
  const selectedScenario =
    recommendedScenarios.length > 0
      ? recommendedScenarios[
          Math.floor(Math.random() * recommendedScenarios.length)
        ]
      : scenarios[Math.floor(Math.random() * scenarios.length)];

  return {
    scenario: selectedScenario,
    reason: `${
      currentGrade === "EXCELLENT"
        ? "높은 수준의"
        : currentGrade === "GOOD"
        ? "적절한 수준의"
        : "기본적인"
    } 훈련을 추천합니다.`,
    difficulty: selectedScenario.difficulty,
  };
};
