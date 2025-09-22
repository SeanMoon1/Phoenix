import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { trainingApi, trainingResultApi } from '@/services/api';
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

  // 결과 저장 함수 - useCallback으로 메모이제이션하여 무한 루프 방지
  const saveTrainingResult = useCallback(async () => {
    console.log('🚀 saveTrainingResult 함수 호출됨!');
    console.log('🔍 saveTrainingResult 호출 시점 정보:', {
      hasUser: !!user,
      userId: user?.id,
      scenarioType,
      gameStateScenariosLength: gameState.scenarios.length,
      expSystemTotalCorrect: expSystem.totalCorrect,
      expSystemLevel: expSystem.level,
      currentTime: new Date().toISOString(),
    });

    console.log('🔍 saveTrainingResult 함수 스택 트레이스:', new Error().stack);

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

        // 훈련 세션 생성
        const sessionData = {
          sessionName: `${scenarioSetName} 훈련`,
          description: `${scenarioSetName} 시나리오 훈련 세션`,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          status: 'completed' as const,
          createdBy: user.id,
        };

        const session = await trainingApi.createSession(sessionData);
        console.log('훈련 세션 생성 완료:', session);

        // 훈련 결과 데이터 생성 (participantId는 userId와 동일하게 설정)
        const resultData = {
          participantId: user.id, // 사용자 ID를 participantId로 사용
          sessionId: session.data?.id, // 생성된 세션 ID 사용
          scenarioId: scenarioIdMap[scenarioType] || 1,
          userId: user.id,
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
        const result = await trainingResultApi.save(resultData);
        if (process.env.NODE_ENV !== 'production') {
          console.log('훈련 결과 저장 완료:', result);
        }
      }

      console.log('🔍 훈련 결과 저장 시작:', {
        userId: user.id,
        scenarioType,
        userTeamId: user.teamId,
        gameStateScenariosLength: gameState.scenarios.length,
        expSystemTotalCorrect: expSystem.totalCorrect,
        expSystemLevel: expSystem.level,
      });

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const scenarioIdMap: Record<string, number> = {
        fire: 1,
        emergency: 2,
        traffic: 3,
        earthquake: 4,
        flood: 5,
      };

      // 1. 먼저 훈련 세션 생성
      const sessionData = {
        sessionName: `${scenarioSetName} 훈련`,
        scenarioId: scenarioIdMap[scenarioType] || 1,
        teamId: user.teamId || undefined, // 팀이 없으면 undefined (선택사항)
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        status: 'completed' as const,
        createdBy: user.id,
      };

      const session = await trainingApi.createSession(sessionData);
      console.log('훈련 세션 생성 완료:', session);

      // 2. 훈련 결과 데이터 생성 (participantId는 userId와 동일하게 설정)
      // ApiResponse 구조에서 sessionId 추출
      const sessionId = (session.data as any)?.id;
      console.log('🔍 세션 ID:', sessionId);
      console.log('🔍 세션 응답 구조:', {
        success: session.success,
        hasData: !!session.data,
        dataId: (session.data as any)?.id,
        dataKeys: session.data ? Object.keys(session.data) : 'no data',
        fullResponse: session,
      });

      if (!sessionId) {
        console.error('❌ 세션 ID를 찾을 수 없습니다. 전체 응답:', session);
        throw new Error('세션 ID를 가져올 수 없습니다.');
      }

      const resultData = {
        // participantId는 백엔드에서 자동 생성됨
        sessionId: sessionId, // 생성된 세션 ID 사용
        scenarioId: scenarioIdMap[scenarioType] || 1,
        userId: user.id,
        resultCode: `RESULT${Date.now()}`, // 결과 코드 자동 생성
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

      console.log('📤 훈련 결과 저장 시도:', resultData);
      const result = await trainingResultApi.save(resultData);
      console.log('✅ 훈련 결과 저장 완료:', result);

      if (result.success) {
        console.log('🎉 훈련 결과가 성공적으로 저장되었습니다!');
      } else {
        console.warn('⚠️ 훈련 결과 저장에 문제가 있습니다:', result.error);
      }
    } catch (error: any) {
      console.error('❌ 훈련 결과 저장 실패:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
      });

      // 사용자에게 알림 (선택사항)
      alert('훈련 결과 저장에 실패했습니다. 다시 시도해주세요.');
    }
  }, [
    user,
    scenarioType,
    scenarioSetName,
    startTime,
    // gameState와 expSystem의 값들은 함수 내에서 직접 참조하므로 의존성에서 제거
    // 무한 루프 방지를 위해 의존성 배열을 최소화
  ]);

  // 마지막 씬인지 확인
  const isLastScene = gameState.current >= gameState.scenarios.length - 1;

  const modals = useModals({
    scenario: gameState.scenario,
    failedThisRun: gameState.failedThisRun,
    scenarioSetName,
    endModalAutoShown: gameState.endModalAutoShown,
    setEndModalAutoShown: gameState.setEndModalAutoShown,
    onSaveResult: saveTrainingResult,
    currentIndex: gameState.current,
    scenariosCount: gameState.scenarios.length,
  });

  // 선택 처리
  const handleChoice = (option: ChoiceOption) => {
    // 이전에 이미 답한 문제인지(ANSWERED 기준) 확인 -> 경험치 지급 방지
    if (gameState.answered?.includes(gameState.current)) {
      gameState.handleChoice(option); // 선택/피드백만 처리
      return;
    }

    const result = gameState.handleChoice(option);
    if (result?.shouldAwardExp) {
      expSystem.awardExp(BASE_EXP);
      expSystem.incrementTotalCorrect();
      // 지급한 것을 훅에도 알려 중복 지급 방지
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
    const normalizeToken = (v: any) =>
      typeof v === 'string' ? v.trim().replace(/^#+/, '').toUpperCase() : null;
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
      gameState.resetSceneFlags();
      gameState.setHistory((h: number[]) => [...h, gameState.current]);
      gameState.setCurrent(nextIndex);
      requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    // 순차 이동
    const seqNextIndex = gameState.current + 1;
    if (seqNextIndex < gameState.scenarios.length) {
      gameState.resetSceneFlags();
      gameState.setHistory((h: number[]) => [...h, gameState.current]);
      gameState.setCurrent(seqNextIndex);
      requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
  };

  const handlePrev = () => {
    if (!gameState.history.length) return;
    const prev = gameState.history[gameState.history.length - 1];
    gameState.setHistory((h: number[]) => h.slice(0, -1));
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
