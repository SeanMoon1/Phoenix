// src/hooks/useScenarioGame.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { fetchScenarioByType } from '@/services/scenarioService';
import type { Scenario, ChoiceOption } from '@/types';

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
  selected: ChoiceOption | null;
  feedback: string | null;

  // 게임 상태
  failedThisRun: boolean;
  wrongTriedInThisScene: boolean;
  awardedExpThisScene: boolean;
  endModalAutoShown: boolean;

  // 액션
  handleChoice: (
    option: ChoiceOption
  ) => { shouldAwardExp: boolean; isCorrect: boolean } | null;
  resetGame: () => void;
  resetSceneFlags: () => void;

  // 세터들
  setCurrent: (value: number) => void;
  setHistory: (updater: (prev: number[]) => number[]) => void;
  setSelected: (value: ChoiceOption | null) => void;
  setFeedback: (value: string | null) => void;
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
  const [selected, setSelected] = useState<ChoiceOption | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // 게임 진행 상태
  const [failedThisRun, setFailedThisRun] = useState(false);
  const [wrongTriedInThisScene, setWrongTriedInThisScene] = useState(false);
  const [awardedExpThisScene, setAwardedExpThisScene] = useState(false);
  const [endModalAutoShown, setEndModalAutoShown] = useState(false);

  // 이미 푼 문제 상태
  const [answered, setAnswered] = useState<number[]>([]);

  // 현재 시나리오
  const scenario = useMemo(
    () => scenarios[current] || null,
    [scenarios, current]
  );

  // 초기 데이터 로드
  useEffect(() => {
    console.log(`[useScenarioGame] 시나리오 타입: ${scenarioType}`);
    setLoading(true);
    fetchScenarioByType(scenarioType)
      .then(data => {
        console.log(
          `[useScenarioGame] 로드된 시나리오 수: ${data.length}`,
          data.slice(0, 2)
        );
        setScenarios(data);
      })
      .catch(error => {
        console.error(`[useScenarioGame] 시나리오 로드 실패:`, error);
      })
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
    setAnswered([]);
  }, []);

  // 씬 플래그 리셋
  const resetSceneFlags = useCallback(() => {
    setSelected(null);
    setFeedback(null);
    setWrongTriedInThisScene(false);
    setAwardedExpThisScene(false);
  }, []);

  // 선택 처리
  const handleChoice = useCallback(
    (option: ScenarioOption) => {
      // 이미 선택한 문제라면 경험치 지급하지 않음
      if (answered.includes(current)) {
        setSelected(option);
        return { shouldAwardExp: false, isCorrect: false };
      }
      setAnswered([...answered, current]);
      setSelected(option);
      setFeedback(option.reactionText || null);

      const isCorrect = (option.accuracyPoints || 0) > 0;
      console.log(
        `[handleChoice] 정답 여부:`,
        isCorrect,
        `정확도 포인트:`,
        option.accuracyPoints
      );

      // 오답을 선택해도 실패 상태를 즉시 업데이트하지 않음
      // 마지막 선택이 정답이면 경험치를 지급하도록 함

      // EXP 지급은 다음 버튼에서 처리하므로 여기서는 제거
      return { shouldAwardExp: false, isCorrect };
    },
    [
      answered,
      current,
      choiceDisabled,
      scenario,
      awardedExpThisScene,
      wrongTriedInThisScene,
    ]
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
    setFailedThisRun,
    setWrongTriedInThisScene,
    setAwardedExpThisScene,
    setEndModalAutoShown,
  };
}
