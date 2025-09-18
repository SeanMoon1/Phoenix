import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { trainingResultApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type { ChoiceOption } from '@/types/index';

// 훅 import
import { useScenarioGame } from '@/hooks/useScenarioGame';
import { useExpSystem } from '@/hooks/useExpSystem';
import { useModals } from '@/hooks/useModals';

// 컴포넌트 imports
import CharacterPanel from '@/components/common/CharacterPanel';
import ProgressBar from '@/components/common/ProgressBar';
import SituationCard from '@/components/common/SituationCard';
import OptionsList from '@/components/common/OptionsList';
import FeedbackBanner from '@/components/common/FeedbackBanner';
import NavButtons from '@/components/common/NavButtons';
import ClearModal from '@/components/common/ClearModal';
import FailModal from '@/components/common/FailModal';
import ConfettiOverlay from '@/components/common/ConfettiOverlay';
import PlayMoreButton from '@/components/common/PlayMoreButton';
import LevelUpToast from '@/components/common/LevelUpToast';

import phoenixImg from '@/assets/images/phoenix.png';

interface ScenarioPageProps {
  scenarioSetName?: string;
  nextScenarioPath?: string;
  persistKey?: string;
}

const DEFAULT_PERSIST_KEY = 'phoenix_training_state';
const BASE_EXP = 10;
const TOKEN_REVIEW = '#REVIEW';
const TOKEN_SCENARIO_SELECT = '#SCENARIO_SELECT';

// 시나리오 타입별 이름 매핑
const getScenarioSetName = (type: string): string => {
  switch (type) {
    case 'fire':
      return '화재 대응';
    case 'emergency':
      return '응급처치';
    case 'traffic':
      return '교통사고 대응';
    case 'earthquake':
      return '지진 대응';
    case 'flood':
      return '홍수 대응';
    default:
      return '재난 대응';
  }
};

export default function ScenarioPage(props?: ScenarioPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // URL에서 시나리오 타입 추출
  const scenarioType = location.pathname.split('/').pop() || 'fire';
  const scenarioSetName =
    props?.scenarioSetName || getScenarioSetName(scenarioType);
  const nextScenarioPath = props?.nextScenarioPath || '/training';
  const persistKey = props?.persistKey || DEFAULT_PERSIST_KEY;

  // 시작 시간
  const startTime = useMemo(() => Date.now(), []);

  // 커스텀 훅들
  const gameState = useScenarioGame({ scenarioType });
  const expSystem = useExpSystem({ persistKey });

  // 결과 저장 함수
  const saveTrainingResult = async () => {
    try {
      if (user) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const scenarioIdMap: Record<string, number> = {
          fire: 1,
          emergency: 2,
          traffic: 3,
          earthquake: 4,
          flood: 5,
        };

        const resultData = {
          participantId: user.id,
          sessionId: Date.now(),
          scenarioId: scenarioIdMap[scenarioType] || 1,
          userId: user.id,
          resultCode: gameState.failedThisRun ? 'FAILED' : 'COMPLETED',
          accuracyScore:
            gameState.scenarios.length > 0
              ? Math.round(
                  (expSystem.totalCorrect / gameState.scenarios.length) * 100
                )
              : 0,
          speedScore: Math.max(0, 100 - Math.floor(timeSpent / 10)),
          totalScore:
            gameState.scenarios.length > 0
              ? Math.round(
                  ((expSystem.totalCorrect / gameState.scenarios.length) * 100 +
                    Math.max(0, 100 - Math.floor(timeSpent / 10))) /
                    2
                )
              : 0,
          completionTime: timeSpent,
          feedback: `${scenarioSetName} 완료 - 레벨 ${expSystem.level}, 정답 ${expSystem.totalCorrect}/${gameState.scenarios.length}`,
          completedAt: new Date().toISOString(),
        };

        await trainingResultApi.save(resultData);
        console.log('Training result saved:', resultData);
      }
    } catch (error) {
      console.error('Failed to save training result:', error);
    }
  };

  // 모달 훅
  const modals = useModals({
    scenario: gameState.scenario,
    failedThisRun: gameState.failedThisRun,
    scenarioSetName,
    endModalAutoShown: gameState.endModalAutoShown,
    setEndModalAutoShown: gameState.setEndModalAutoShown,
    onSaveResult: saveTrainingResult,
  });

  // 선택 처리
  const handleChoice = (option: ChoiceOption) => {
    // 이미 푼 문제라면 경험치 지급하지 않음
    if (gameState.history.includes(gameState.current)) {
      gameState.handleChoice(option); // 선택은 처리
      return;
    }
    const result = gameState.handleChoice(option);
    if (result?.shouldAwardExp) {
      expSystem.awardExp(BASE_EXP);
      expSystem.incrementTotalCorrect();
    }
  };

  // 네비게이션 처리
  const handleNext = () => {
    if (!gameState.selected || !gameState.scenario) return;

    // 다음 버튼을 눌렀을 때 마지막 선택이 정답이었는지 확인하고 EXP 지급
    const isCorrect = (gameState.selected.accuracyPoints || 0) > 0;
    const shouldAwardExp = !gameState.awardedExpThisScene && isCorrect;

    console.log(`[네비게이션] 선택된 옵션:`, gameState.selected);
    console.log(`[네비게이션] 정답 여부:`, isCorrect);
    console.log(`[네비게이션] EXP 지급 여부:`, shouldAwardExp);

    if (shouldAwardExp) {
      expSystem.awardExp(BASE_EXP);
      expSystem.incrementTotalCorrect();
      gameState.setAwardedExpThisScene(true);
    }

    const nextId = gameState.selected.nextEventId ?? null;
    console.log(`[네비게이션] nextId:`, nextId);

    if (nextId && nextId === TOKEN_REVIEW) {
      gameState.resetGame();
      modals.setClearMsg(null);
      modals.setFailMsg(null);
      modals.setShowConfetti(false);
      return;
    }
    if (nextId && nextId === TOKEN_SCENARIO_SELECT) {
      navigate(nextScenarioPath);
      return;
    }

    const nextIndex = nextId
      ? gameState.scenarios.findIndex(s => s.scenarioCode === nextId)
      : -1;

    console.log(`[네비게이션] 다음 인덱스:`, nextIndex);

    if (nextIndex !== -1) {
      gameState.resetSceneFlags();
      gameState.setHistory(h => [...h, gameState.current]);
      gameState.setCurrent(nextIndex);
    } else {
      // 다음 시나리오가 없으면 순차적으로 다음으로 이동
      const nextIndex = gameState.current + 1;
      if (nextIndex < gameState.scenarios.length) {
        gameState.resetSceneFlags();
        gameState.setHistory(h => [...h, gameState.current]);
        gameState.setCurrent(nextIndex);
      } else {
        // 마지막 시나리오인 경우 완료 처리
        console.log(`[네비게이션] 마지막 시나리오 완료`);
        // 여기서 완료 모달을 표시하거나 다음 액션을 수행
      }
    }
  };

  const handlePrev = () => {
    if (!gameState.history.length) return;
    const prev = gameState.history[gameState.history.length - 1];
    gameState.setHistory(h => h.slice(0, -1));
    gameState.setCurrent(prev);
    gameState.resetSceneFlags();
  };

  // 로딩/에러 처리
  if (gameState.loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 text-neutral-900 dark:bg-[#111827] dark:text-white">
        <div className="text-center">
          <img
            src={phoenixImg}
            alt="Phoenix"
            className="w-auto h-24 mx-auto mb-4 animate-pulse"
          />
          <p className="text-xl">시나리오 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!gameState.scenarios.length || !gameState.scenario) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 text-neutral-900 dark:bg-[#111827] dark:text-white">
        <div className="text-center">
          <img
            src={phoenixImg}
            alt="Phoenix"
            className="w-auto h-24 mx-auto mb-4"
          />
          <p className="text-xl">시나리오를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const acc = gameState.selected?.accuracyPoints ?? 0;
  const tone: 'good' | 'ok' | 'bad' =
    acc >= 10 ? 'good' : acc > 0 ? 'ok' : 'bad';

  console.log(`[피드백] 선택된 옵션:`, gameState.selected);
  console.log(`[피드백] 정확도 포인트:`, acc, `톤:`, tone);

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden py-8 md:py-10 bg-white text-neutral-900 dark:bg-[#111827] dark:text-white">
        <div className="w-full md:max-w-screen-lg mx-auto px-3 md:px-4 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6">
          <CharacterPanel
            level={expSystem.level}
            expDisplay={expSystem.EXPDisplay}
            neededExp={expSystem.neededEXP}
            progressPct={expSystem.progressPct}
            highlight={expSystem.showLevelUp}
            hideExpFill={expSystem.hideExpFill}
          />
          <main>
            <ProgressBar
              currentIndex={gameState.current}
              total={gameState.scenarios.length}
              level={expSystem.level}
              progressPct={expSystem.progressPct}
              expDisplay={expSystem.EXPDisplay}
              neededExp={expSystem.neededEXP}
              hideExpFill={expSystem.hideExpFill}
            />
            <SituationCard
              title={gameState.scenario.title ?? ''}
              content={gameState.scenario.content ?? ''}
              sceneScript={gameState.scenario.sceneScript ?? ''}
            />
            <OptionsList
              options={gameState.scenario.options ?? []}
              selected={gameState.selected}
              onSelect={handleChoice}
              disabled={false}
            />
            {gameState.feedback && (
              <FeedbackBanner text={gameState.feedback} tone={tone} />
            )}
            <NavButtons
              canGoPrev={gameState.history.length > 0}
              canGoNext={!!gameState.selected}
              onPrev={handlePrev}
              onNext={handleNext}
            />
            <div className="w-full px-3 mx-auto md:max-w-screen-lg md:px-4">
              <PlayMoreButton to="/training" />
            </div>
          </main>
        </div>

        {/* 모달들 */}
        {expSystem.showLevelUp && (
          <LevelUpToast
            bonus={expSystem.levelUpBonus}
            level={expSystem.level}
          />
        )}
        <ConfettiOverlay
          show={modals.showConfetti}
          vw={modals.vw}
          vh={modals.vh}
        />
        {modals.clearMsg && (
          <ClearModal
            message={modals.clearMsg}
            onClose={() => {
              modals.setClearMsg(null);
              modals.setShowConfetti(false);
            }}
          />
        )}
        {modals.failMsg && (
          <FailModal
            message={modals.failMsg}
            onClose={() => modals.setFailMsg(null)}
            onRetry={() => {
              modals.setFailMsg(null);
              gameState.resetGame();
            }}
          />
        )}
      </div>
    </Layout>
  );
}
