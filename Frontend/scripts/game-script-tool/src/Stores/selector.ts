import { useBlockListStore } from "./atom";
import { useScenarioStore } from "./atom";

// 기존 ScriptBlock 기반 selector (하위 호환성)
export const useBlockListSelector = () => {
  const { blockList, setBlockList } = useBlockListStore();

  const sortedBlockList = [...blockList].sort((a, b) => a.order - b.order);
  const approvedBlocks = sortedBlockList.filter(
    (block) => block.approvalStatus === "APPROVED"
  );
  const pendingBlocks = sortedBlockList.filter(
    (block) => block.approvalStatus === "PENDING"
  );

  return {
    blockList: sortedBlockList,
    approvedBlocks,
    pendingBlocks,
    setBlockList,
  };
};

// 새로운 시나리오 기반 selector
export const useScenarioSelector = () => {
  const { scenarios, setScenarios } = useScenarioStore();

  const sortedScenarios = [...scenarios].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const activeScenarios = sortedScenarios.filter(
    (scenario) => scenario.isActive && scenario.status === "활성화"
  );

  const draftScenarios = sortedScenarios.filter(
    (scenario) => scenario.status === "임시저장"
  );

  const pendingScenarios = sortedScenarios.filter(
    (scenario) => scenario.status === "승인대기"
  );

  // 시나리오별 이벤트 정렬
  const getSortedEvents = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.scenarioId === scenarioId);
    if (!scenario) return [];
    return [...scenario.events].sort((a, b) => a.eventOrder - b.eventOrder);
  };

  // 이벤트별 선택지 정렬
  const getSortedChoices = (scenarioId: string, eventId: string) => {
    const scenario = scenarios.find((s) => s.scenarioId === scenarioId);
    if (!scenario) return [];
    const event = scenario.events.find((e) => e.eventId === eventId);
    if (!event) return [];
    return [...event.choices].sort((a, b) => a.scoreWeight - b.scoreWeight);
  };

  // 시나리오 통계
  const getScenarioStats = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.scenarioId === scenarioId);
    if (!scenario) return null;

    return {
      totalEvents: scenario.events.length,
      totalChoices: scenario.events.reduce(
        (sum, event) => sum + event.choices.length,
        0
      ),
      averageChoicesPerEvent:
        scenario.events.length > 0
          ? scenario.events.reduce(
              (sum, event) => sum + event.choices.length,
              0
            ) / scenario.events.length
          : 0,
      correctChoices: scenario.events.reduce(
        (sum, event) =>
          sum + event.choices.filter((choice) => choice.isCorrect).length,
        0
      ),
    };
  };

  return {
    scenarios: sortedScenarios,
    activeScenarios,
    draftScenarios,
    pendingScenarios,
    setScenarios,
    getSortedEvents,
    getSortedChoices,
    getScenarioStats,
  };
};
