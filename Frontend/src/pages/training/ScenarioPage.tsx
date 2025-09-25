import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import /* trainingApi, trainingResultApi */ '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type { ChoiceOption } from '@/types/index';

// 훅 import
import { useScenarioGame } from '@/hooks/useScenarioGame';
import { useExpSystem } from '@/hooks/useExpSystem';
import { useModals } from '@/hooks/useModals';
import { useTrainingResult } from '@/hooks/useTrainingResult';

// 컴포넌트 imports
import CharacterPanel from '@/components/common/CharacterPanel';
import ProgressBar from '@/components/common/ProgressBar';
import SituationCard from '@/components/common/SituationCard';
import OptionsList from '@/components/common/OptionsList';
import FeedbackBanner from '@/components/common/FeedbackBanner';
import NavButtons from '@/components/common/NavButtons';
import ClearModal from '@/components/common/ClearModal';
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

// 시나리오 타입별 이름 매핑
const getScenarioSetName = (type: string): string => {
  switch (type) {
    case 'fire':
      return '화재 대응';
    case 'first-aid':
      return '응급처치';
    case 'traffic-accident':
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
  const topRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const [showMobilePanelModal, setShowMobilePanelModal] = useState(false);

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
  const expSystem = useExpSystem({ persistKey, userId: user?.id });

  const normalizeToken = (v: any) =>
    typeof v === 'string' ? v.trim().replace(/^#+/, '').toUpperCase() : null;

  const goToIndex = (index: number) => {
    gameState.resetSceneFlags();
    gameState.setHistory((h: number[]) => [...h, gameState.current]);
    gameState.setCurrent(index);

    requestAnimationFrame(() => {
      // 데스크탑 화면에서 다음버튼 누르고 스크롤 맨 위에서 시작하도록 수정
      requestAnimationFrame(() => {
        const isWide =
          typeof window !== 'undefined' && window.innerWidth >= 768;
        const targetEl = isWide
          ? topRef.current
          : contentRef.current ?? topRef.current;
        if (!targetEl) return;

        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const rect = targetEl.getBoundingClientRect();
        const top = window.scrollY + rect.top - headerHeight - 8; // small margin

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };

  const { saveTrainingResult } = useTrainingResult();

  const modals = useModals({
    scenario: gameState.scenario,
    failedThisRun: gameState.failedThisRun,
    scenarioSetName,
    endModalAutoShown: gameState.endModalAutoShown,
    setEndModalAutoShown: gameState.setEndModalAutoShown,
    onSaveResult: async () => {
      await saveTrainingResult({
        scenarioSetName,
        scenarioType,
        expSystemState: {
          level: expSystem.level,
          totalCorrect: gameState.currentCorrect,
        },
        gameStateSummary: {
          scenariosCount: gameState.actualQuestionCount, // 실제 문제 수 사용
          startTimeMs: startTime,
          failedThisRun: gameState.failedThisRun,
        },
      });
    },
    currentIndex: gameState.current,
    scenariosCount: gameState.scenarios.length,
  });

  // 선택 처리
  const handleChoice = (option: ChoiceOption) => {
    // 이전에 이미 답한 문제인지(ANSWERED 기준) 확인 -> 경험치 지급 방지
    if (gameState.answered?.includes(gameState.current)) {
      gameState.handleChoice(option); // 선택, 피드백만 처리
      return;
    }

    const result = gameState.handleChoice(option);
    if (result?.shouldAwardExp) {
      expSystem.awardExp(BASE_EXP);
      expSystem.incrementTotalCorrect();
      gameState.setAwardedExpThisScene(true);
    }
  };

  // 네비게이션 처리
  const handleNext = () => {
    if (!gameState.selected || !gameState.scenario) return;

    // nextId 추출 (여러 필드 지원 + trim)
    const rawNext =
      (gameState.selected as any)?.nextId ??
      (gameState.selected as any)?.nextSceneCode ??
      (gameState.selected as any)?.next_scene_code ??
      (gameState.selected as any)?.nextEventId ??
      (gameState.selected as any)?.next_event_id ??
      null;

    const nextId = typeof rawNext === 'string' ? rawNext.trim() : rawNext;

    // 특수 토큰 처리
    const token = normalizeToken(nextId);
    if (token === 'REVIEW') {
      gameState.resetGame();
      modals.setClearMsg(null);
      modals.setFailMsg(null);
      modals.setShowConfetti(false);
      return;
    }
    if (token === 'SCENARIO_SELECT') {
      navigate(nextScenarioPath);
      return;
    }

    // 명시적 nextId가 있으면 해당 씬으로
    const nextIndex = nextId
      ? gameState.scenarios.findIndex((s: any) => s.sceneId === nextId)
      : -1;

    if (nextIndex !== -1) {
      goToIndex(nextIndex);
      return;
    }

    // 순차 이동
    const seqNextIndex = gameState.current + 1;
    if (seqNextIndex < gameState.scenarios.length) {
      goToIndex(seqNextIndex);
      return;
    }
  };

  const handlePrev = () => {
    if (!gameState.history.length) return;
    const prev = gameState.history[gameState.history.length - 1];
    gameState.setHistory((h: number[]) => h.slice(0, -1));
    gameState.setCurrent(prev);
    gameState.resetSceneFlags();

    // 스크롤 위치 조정
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const isWide =
          typeof window !== 'undefined' && window.innerWidth >= 768;
        const targetEl = isWide
          ? topRef.current
          : contentRef.current ?? topRef.current;
        if (!targetEl) return;

        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const rect = targetEl.getBoundingClientRect();
        const top = window.scrollY + rect.top - headerHeight - 8;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };

  // 로딩, 에러 처리
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

  // 시나리오가 없거나 현재 시나리오를 찾을 수 없는 경우
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
            playerName={user?.name ?? user?.loginId ?? '플레이어 이름'}
          />
          <main ref={topRef}>
            <ProgressBar
              currentIndex={gameState.current}
              total={gameState.scenarios.length}
              level={expSystem.level}
              progressPct={expSystem.progressPct}
              expDisplay={expSystem.EXPDisplay}
              neededExp={expSystem.neededEXP}
              hideExpFill={expSystem.hideExpFill}
              mobilePanelModalOpen={showMobilePanelModal}
              onCloseMobilePanel={() => setShowMobilePanelModal(false)}
            />
            <SituationCard
              ref={contentRef}
              title={gameState.scenario.title ?? ''}
              content={gameState.scenario.content ?? ''}
              sceneScript={gameState.scenario.sceneScript ?? ''}
            />
            <OptionsList
              options={gameState.scenario.options ?? []}
              selected={gameState.selected}
              onSelect={handleChoice}
              disabled={gameState.choiceDisabled ?? false}
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
              // 모바일이면 축하 모달 닫은 뒤 캐릭터+EXP 패널을 모달로 띄움
              if (typeof modals.vw === 'number' && modals.vw < 768) {
                setShowMobilePanelModal(true);
              }
            }}
          />
        )}
      </div>
    </Layout>
  );
}
