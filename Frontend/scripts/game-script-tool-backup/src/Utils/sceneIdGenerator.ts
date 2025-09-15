/**
 * 장면 ID 자동 생성 및 관리 유틸리티
 */

export interface SceneIdInfo {
  scenarioNumber: number;
  sceneNumber: number;
  fullId: string;
}

/**
 * 장면 ID를 파싱하여 정보를 반환
 * @param sceneId - 파싱할 장면 ID (예: "#1-1")
 * @returns 파싱된 장면 ID 정보
 */
export const parseSceneId = (sceneId: string): SceneIdInfo | null => {
  const match = sceneId.match(/^#(\d+)-(\d+)$/);
  if (!match) return null;

  return {
    scenarioNumber: parseInt(match[1]),
    sceneNumber: parseInt(match[2]),
    fullId: sceneId,
  };
};

/**
 * 시나리오 번호와 장면 번호로 장면 ID 생성
 * @param scenarioNumber - 시나리오 번호 (1부터 시작)
 * @param sceneNumber - 장면 번호 (1부터 시작)
 * @returns 생성된 장면 ID
 */
export const generateSceneId = (
  scenarioNumber: number,
  sceneNumber: number
): string => {
  return `#${scenarioNumber}-${sceneNumber}`;
};

/**
 * 기존 장면 목록을 기반으로 다음 사용 가능한 장면 ID 생성
 * @param existingSceneIds - 기존 장면 ID 목록
 * @returns 다음 사용 가능한 장면 ID
 */
export const getNextAvailableSceneId = (existingSceneIds: string[]): string => {
  // 기존 ID들을 파싱하여 시나리오별 최대 장면 번호 찾기
  const scenarioMaxScenes: { [key: number]: number } = {};

  existingSceneIds.forEach((id) => {
    const parsed = parseSceneId(id);
    if (parsed) {
      const currentMax = scenarioMaxScenes[parsed.scenarioNumber] || 0;
      scenarioMaxScenes[parsed.scenarioNumber] = Math.max(
        currentMax,
        parsed.sceneNumber
      );
    }
  });

  // 첫 번째 시나리오의 다음 장면 ID 생성
  const firstScenario = 1;
  const nextSceneNumber = (scenarioMaxScenes[firstScenario] || 0) + 1;

  return generateSceneId(firstScenario, nextSceneNumber);
};

/**
 * 기존 장면 목록을 기반으로 사용 가능한 모든 장면 ID 목록 생성
 * @param existingSceneIds - 기존 장면 ID 목록
 * @param maxScenesPerScenario - 시나리오당 최대 장면 수 (기본값: 10)
 * @returns 사용 가능한 장면 ID 목록
 */
export const getAvailableSceneIds = (
  existingSceneIds: string[],
  maxScenesPerScenario: number = 10
): string[] => {
  const availableIds: string[] = [];

  // 기존 ID들을 파싱하여 시나리오별 최대 장면 번호 찾기
  const scenarioMaxScenes: { [key: number]: number } = {};

  existingSceneIds.forEach((id) => {
    const parsed = parseSceneId(id);
    if (parsed) {
      const currentMax = scenarioMaxScenes[parsed.scenarioNumber] || 0;
      scenarioMaxScenes[parsed.scenarioNumber] = Math.max(
        currentMax,
        parsed.sceneNumber
      );
    }
  });

  // 각 시나리오별로 사용 가능한 ID 생성
  const maxScenario = Math.max(
    ...Object.keys(scenarioMaxScenes).map(Number),
    1
  );

  for (let scenario = 1; scenario <= maxScenario; scenario++) {
    const maxScene = scenarioMaxScenes[scenario] || 0;
    const scenesToGenerate = Math.max(maxScene + 2, 3); // 최소 3개, 기존 최대 + 2개

    for (
      let scene = 1;
      scene <= Math.min(scenesToGenerate, maxScenesPerScenario);
      scene++
    ) {
      const id = generateSceneId(scenario, scene);
      availableIds.push(id);
    }
  }

  return availableIds;
};

/**
 * 장면 ID가 유효한 형식인지 검증
 * @param sceneId - 검증할 장면 ID
 * @returns 유효한 형식인지 여부
 */
export const isValidSceneId = (sceneId: string): boolean => {
  return parseSceneId(sceneId) !== null;
};

/**
 * 장면 ID를 정렬하기 위한 비교 함수
 * @param a - 첫 번째 장면 ID
 * @param b - 두 번째 장면 ID
 * @returns 정렬 순서 (-1, 0, 1)
 */
export const compareSceneIds = (a: string, b: string): number => {
  const parsedA = parseSceneId(a);
  const parsedB = parseSceneId(b);

  if (!parsedA || !parsedB) return 0;

  if (parsedA.scenarioNumber !== parsedB.scenarioNumber) {
    return parsedA.scenarioNumber - parsedB.scenarioNumber;
  }

  return parsedA.sceneNumber - parsedB.sceneNumber;
};

/**
 * 현재 장면 ID를 기반으로 다음 가능한 장면 ID들을 추천
 * @param currentSceneId - 현재 장면 ID (예: "#1-1")
 * @param existingSceneIds - 기존 장면 ID 목록
 * @param maxRecommendations - 최대 추천 개수 (기본값: 5)
 * @returns 추천 장면 ID 목록 (우선순위 순)
 */
export const getRecommendedNextScenes = (
  currentSceneId: string,
  existingSceneIds: string[],
  maxRecommendations: number = 5
): string[] => {
  const current = parseSceneId(currentSceneId);
  if (!current) return [];

  const recommendations: string[] = [];
  const usedIds = new Set(existingSceneIds);

  // 1. 같은 시나리오의 다음 장면 (우선순위 1)
  const nextSceneInSameScenario = generateSceneId(
    current.scenarioNumber,
    current.sceneNumber + 1
  );
  if (!usedIds.has(nextSceneInSameScenario)) {
    recommendations.push(nextSceneInSameScenario);
  }

  // 2. 다음 시나리오의 첫 장면 (우선순위 2)
  const firstSceneInNextScenario = generateSceneId(
    current.scenarioNumber + 1,
    1
  );
  if (!usedIds.has(firstSceneInNextScenario)) {
    recommendations.push(firstSceneInNextScenario);
  }

  // 3. 같은 시나리오의 이전 장면들 (우선순위 3)
  for (let scene = 1; scene < current.sceneNumber; scene++) {
    const prevScene = generateSceneId(current.scenarioNumber, scene);
    if (!usedIds.has(prevScene)) {
      recommendations.push(prevScene);
    }
  }

  // 4. 다른 시나리오의 첫 장면들 (우선순위 4)
  for (let scenario = 1; scenario < current.scenarioNumber; scenario++) {
    const firstScene = generateSceneId(scenario, 1);
    if (!usedIds.has(firstScene)) {
      recommendations.push(firstScene);
    }
  }

  // 5. 기존 장면들 중에서 아직 추천되지 않은 것들 (우선순위 5)
  existingSceneIds.forEach((id) => {
    if (id !== currentSceneId && !recommendations.includes(id)) {
      recommendations.push(id);
    }
  });

  // 최대 추천 개수만큼 반환
  return recommendations.slice(0, maxRecommendations);
};
