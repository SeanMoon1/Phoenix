// src/hooks/useScenarioGame.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { fetchScenarioByType } from '@/services/scenarioService';
import type { Scenario, ScenarioOption } from '@/types/scenario';

interface UseScenarioGameProps {
  scenarioType: string;
}

interface UseScenarioGameReturn {
  // 데이터 상태
  scenarios: Scenario[];
  scenario: Scenario | null;
  loading: boolean;

  // 진행 상태
  current: number;
  history: number[];

  // 선택 상태
  selected: ScenarioOption | null;
  feedback: string | null;
  choiceDisabled: boolean;

  // 게임 상태
  failedThisRun: boolean;
  wrongTriedInThisScene: boolean;
  awardedExpThisScene: boolean;
  endModalAutoShown: boolean;

  // 액션
  handleChoice: (
    option: ScenarioOption
  ) => { shouldAwardExp: boolean; isCorrect: boolean } | null;
  resetGame: () => void;
  resetSceneFlags: () => void;

  // 세터들
  setCurrent: (value: number) => void;
  setHistory: (updater: (prev: number[]) => number[]) => void;
  setSelected: (value: ScenarioOption | null) => void;
  setFeedback: (value: string | null) => void;
  setChoiceDisabled: (value: boolean) => void;
  setFailedThisRun: (value: boolean) => void;
  setWrongTriedInThisScene: (value: boolean) => void;
  setAwardedExpThisScene: (value: boolean) => void;
  setEndModalAutoShown: (value: boolean) => void;
}

export function useScenarioGame({
  scenarioType,
}: UseScenarioGameProps): UseScenarioGameReturn {
  // 데이터 & 진행
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  // 선택/피드백
  const [selected, setSelected] = useState<ScenarioOption | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [choiceDisabled, setChoiceDisabled] = useState(false);

  // 게임 진행 상태
  const [failedThisRun, setFailedThisRun] = useState(false);
  const [wrongTriedInThisScene, setWrongTriedInThisScene] = useState(false);
  const [awardedExpThisScene, setAwardedExpThisScene] = useState(false);
  const [endModalAutoShown, setEndModalAutoShown] = useState(false);

  // 현재 시나리오
  const scenario = useMemo(
    () => scenarios[current] || null,
    [scenarios, current]
  );

  // 초기 데이터 로드
  useEffect(() => {
    setLoading(true);
    fetchScenarioByType(scenarioType)
      .then(data => setScenarios(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [scenarioType]);

  // 게임 리셋
  const resetGame = useCallback(() => {
    setCurrent(0);
    setHistory([]);
    setFailedThisRun(false);
    setSelected(null);
    setFeedback(null);
    setWrongTriedInThisScene(false);
    setAwardedExpThisScene(false);
    setEndModalAutoShown(false);
    setChoiceDisabled(false);
  }, []);

  // 씬 플래그 리셋
  const resetSceneFlags = useCallback(() => {
    setSelected(null);
    setFeedback(null);
    setWrongTriedInThisScene(false);
    setAwardedExpThisScene(false);
    setChoiceDisabled(false);
  }, []);

  // 선택 처리
  const handleChoice = useCallback(
    (option: ScenarioOption) => {
      if (choiceDisabled || !scenario) return null;

      setChoiceDisabled(true);
      setSelected(option);
      setFeedback(option.reaction || null);

      const isCorrect = (option.points?.accuracy || 0) > 0;
      if (!isCorrect) {
        setWrongTriedInThisScene(true);
        setFailedThisRun(true);
      }

      // EXP 지급 여부 결정
      const shouldAwardExp =
        !awardedExpThisScene && isCorrect && !wrongTriedInThisScene;
      if (shouldAwardExp) {
        setAwardedExpThisScene(true);
      }

      return { shouldAwardExp, isCorrect };
    },
    [choiceDisabled, scenario, awardedExpThisScene, wrongTriedInThisScene]
  );

  return {
    // 데이터 상태
    scenarios,
    scenario,
    loading,

    // 진행 상태
    current,
    history,

    // 선택 상태
    selected,
    feedback,
    choiceDisabled,

    // 게임 상태
    failedThisRun,
    wrongTriedInThisScene,
    awardedExpThisScene,
    endModalAutoShown,

    // 액션
    handleChoice,
    resetGame,
    resetSceneFlags,

    // 세터들
    setCurrent,
    setHistory,
    setSelected,
    setFeedback,
    setChoiceDisabled,
    setFailedThisRun,
    setWrongTriedInThisScene,
    setAwardedExpThisScene,
    setEndModalAutoShown,
  };
}
