import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { fetchScenarioByType } from '@/services/scenarioService';
import { trainingResultApi, trainingApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type { Scenario, ScenarioOption } from '@/types/scenario';
import { useLocation } from 'react-router-dom';

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
import { getEXPForNextLevel, animateValue, getLevelUpBonus } from '@/utils/exp';
import { useNavigate } from 'react-router-dom';

// ✅ PersistState 타입 직접 정의
interface PersistState {
  EXP: number;
  level: number;
  streak: number;
  totalCorrect: number;
}

interface ScenarioPageProps {
  scenarioSetName?: string;
  fetchScenarios?: () => Promise<Scenario[]>;
  nextScenarioPath?: string;
  persistKey?: string;
}

const DEFAULT_PERSIST_KEY = 'phoenix_training_state';
const BASE_EXP = 10; // 고정 EXP

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

const TOKEN_REVIEW = '#REVIEW';
const TOKEN_SCENARIO_SELECT = '#SCENARIO_SELECT';
const END_SCENE_ID = '#END';

export default function ScenarioPage(props?: ScenarioPageProps) {
  // URL에서 시나리오 타입 추출 (기본 방식 유지)
  const location = useLocation();
  const scenarioType = location.pathname.split('/').pop() || 'fire';

  // props가 있으면 사용, 없으면 기본값 사용
  const scenarioSetName =
    props?.scenarioSetName || getScenarioSetName(scenarioType);
  const nextScenarioPath = props?.nextScenarioPath || '/training';
  const persistKey = props?.persistKey || DEFAULT_PERSIST_KEY;

  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 데이터 & 진행
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const startTime = useMemo(() => Date.now(), []); // 컴포넌트 마운트 시 한 번만 설정
  const scenario = scenarios[current];

  // 경과 시간 계산 (사용하지 않지만 오류 방지용 유지)
  const timeSpent = Math.floor((Date.now() - startTime) / 1000); // 초 단위
  console.log('timeSpent:', timeSpent); // 사용되지 않는 변수 경고 방지

  // 선택/피드백
  const [selected, setSelected] = useState<ScenarioOption | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // 게임화 상태
  const [EXP, setEXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [EXPDisplay, setEXPDisplay] = useState(0);
  const neededEXP = useMemo(() => getEXPForNextLevel(level), [level]);
  const progressPct = useMemo(() => {
    const pct = Math.min(100, Math.round((EXPDisplay / neededEXP) * 100));
    return Number.isFinite(pct) ? pct : 0;
  }, [EXPDisplay, neededEXP]);

  // 연출/모달
  const [showConfetti, setShowConfetti] = useState(false);
  const [clearMsg, setClearMsg] = useState<string | null>(null);
  const [failMsg, setFailMsg] = useState<string | null>(null);
  const [vw, setVw] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [vh, setVh] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );

  // 장면 제어 플래그
  const [failedThisRun, setFailedThisRun] = useState(false);
  const [wrongTriedInThisScene, setWrongTriedInThisScene] = useState(false);
  const [awardedExpThisScene, setAwardedExpThisScene] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpBonus, setLevelUpBonus] = useState(0);
  const [endModalAutoShown, setEndModalAutoShown] = useState(false);

  // ✅ 추가: 선택 완료 상태
  const [choiceDisabled, setChoiceDisabled] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    fetchScenarioByType(scenarioType)
      .then(data => setScenarios(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [scenarioType]);

  // 리사이즈
  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ✅ 로컬 스토리지 복구/저장 수정 - persistKey 사용
  useEffect(() => {
    const raw = localStorage.getItem(persistKey); // ✅ PERSIST_KEY → persistKey
    if (raw) {
      try {
        const s: PersistState = JSON.parse(raw);
        setEXP(s.EXP ?? 0);
        setLevel(s.level ?? 1);
        setTotalCorrect(s.totalCorrect ?? 0);
        setEXPDisplay(s.EXP ?? 0);
      } catch {
        /* ignore */
      }
    }
  }, [persistKey]);

  useEffect(() => {
    const s: PersistState = { EXP, level, streak: 0, totalCorrect };
    localStorage.setItem(persistKey, JSON.stringify(s)); // ✅ PERSIST_KEY → persistKey
  }, [EXP, level, totalCorrect, persistKey]);

  const saveTrainingResult = async () => {
    try {
      if (user) {
        // 시나리오 타입을 ID로 매핑
        const scenarioIdMap: Record<string, number> = {
          fire: 1,
          emergency: 2,
          traffic: 3,
          earthquake: 4,
          flood: 5,
        };

        const scenarioId = scenarioIdMap[scenarioType] || 1;

        const resultData = {
          participantId: user.id,
          sessionId: Date.now(), // 현재 시간을 세션 ID로 사용
          scenarioId,
          userId: user.id,
          resultCode: failedThisRun ? 'FAILED' : 'COMPLETED',
          accuracyScore:
            scenarios.length > 0
              ? Math.round((totalCorrect / scenarios.length) * 100)
              : 0,
          speedScore: Math.max(0, 100 - Math.floor(timeSpent / 10)),
          totalScore:
            scenarios.length > 0
              ? Math.round(
                  ((totalCorrect / scenarios.length) * 100 +
                    Math.max(0, 100 - Math.floor(timeSpent / 10))) /
                    2
                )
              : 0,
          completionTime: timeSpent,
          feedback: `${scenarioSetName} 완료 - 레벨 ${level}, 정답 ${totalCorrect}/${scenarios.length}`,
          completedAt: new Date().toISOString(),
        };

        // ✅ trainingResultApi.saveResult 사용
        await trainingResultApi.saveResult(resultData);
        console.log('Training result saved:', resultData);
      }
    } catch (error) {
      console.error('Failed to save training result:', error);

      // 실패 시 로컬 스토리지에 백업 저장
      if (user) {
        const backupData = {
          scenarioType,
          userId: user.id,
          timeSpent,
          totalCorrect,
          level,
          EXP,
          failedThisRun,
          completedAt: new Date().toISOString(),
        };
        localStorage.setItem(
          `training_result_backup_${user.id}_${Date.now()}`,
          JSON.stringify(backupData)
        );
        console.log('Training result saved to localStorage as backup');
      }
    }
  };

  // 엔딩(#END) 씬이 렌더된 뒤 모달 자동 오픈 → 진행바 표시
  useEffect(() => {
    if (!scenario || endModalAutoShown) return;
    if (scenario.sceneId === END_SCENE_ID) {
      setEndModalAutoShown(true);

      // 훈련 결과 서버에 저장
      saveTrainingResult();

      if (!failedThisRun) {
        setClearMsg(
          `축하합니다! ${scenarioSetName} 시나리오를 모두 클리어하였습니다.`
        );
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4500);
      } else {
        setFailMsg(
          `${scenarioSetName} 시나리오를 클리어하지 못했습니다. 다시 도전해보세요!`
        );
      }
    }
  }, [scenario, endModalAutoShown, failedThisRun, scenarioSetName]);

  // 선택
  // 상단 상태에 추가
  const [hideExpFill, setHideExpFill] = useState(false);

  // handleChoice 함수
  const handleChoice = (option: ScenarioOption) => {
    // ✅ 이미 선택했으면 무시
    if (choiceDisabled || !scenario) return;

    // ✅ 선택 즉시 비활성화
    setChoiceDisabled(true);

    setSelected(option);
    setFeedback(option.reaction || null);

    const isCorrect = (option.points?.accuracy || 0) > 0;
    if (!isCorrect) {
      setWrongTriedInThisScene(true);
      setFailedThisRun(true);
    }

    if (!awardedExpThisScene && isCorrect && !wrongTriedInThisScene) {
      const gained = BASE_EXP;

      const oldLevel = level;
      const oldNeeded = getEXPForNextLevel(oldLevel);

      let nextEXP = EXP + gained;
      let nextLevel = level;
      let totalBonus = 0;
      let leveled = false;

      // 연쇄 레벨업 포함 계산
      while (nextEXP >= getEXPForNextLevel(nextLevel)) {
        nextEXP -= getEXPForNextLevel(nextLevel);
        nextLevel += 1;
        const bonus = getLevelUpBonus(nextLevel);
        totalBonus += bonus;
        nextEXP += bonus;
        leveled = true;
      }

      if (!leveled) {
        animateValue({
          from: EXPDisplay,
          to: nextEXP,
          duration: 600,
          onUpdate: setEXPDisplay,
        });
        setEXP(nextEXP);
        setLevel(nextLevel);
      } else {
        animateValue({
          from: EXPDisplay,
          to: oldNeeded,
          duration: 500,
          onUpdate: setEXPDisplay,
          onComplete: () => {
            setLevelUpBonus(totalBonus);
            setShowLevelUp(true);

            window.setTimeout(() => {
              setShowLevelUp(false);
              setLevel(nextLevel);
              setEXP(nextEXP);
              setHideExpFill(true);
              setEXPDisplay(0);

              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  setHideExpFill(false);
                  animateValue({
                    from: 0,
                    to: nextEXP,
                    duration: 600,
                    onUpdate: setEXPDisplay,
                  });
                });
              });
            }, 500);
          },
        });
      }

      setTotalCorrect(c => c + 1);
      setAwardedExpThisScene(true);
    }
  };

  // 다음/이전
  const handleNext = () => {
    if (!selected || !scenario) return;
    const nextId = selected.nextId ?? null;

    if (nextId === TOKEN_REVIEW) {
      setCurrent(0);
      setHistory([]);
      setSelected(null);
      setFeedback(null);
      setWrongTriedInThisScene(false);
      setAwardedExpThisScene(false);
      setFailedThisRun(false);
      setShowConfetti(false);
      setClearMsg(null);
      setFailMsg(null);
      setEndModalAutoShown(false);
      setChoiceDisabled(false);
      return;
    }
    if (nextId === TOKEN_SCENARIO_SELECT) {
      navigate(nextScenarioPath);
      return;
    }

    const nextIndex =
      typeof nextId === 'string'
        ? scenarios.findIndex(s => s.sceneId === nextId)
        : -1;

    const resetSceneFlags = () => {
      setSelected(null);
      setFeedback(null);
      setWrongTriedInThisScene(false);
      setAwardedExpThisScene(false);
      setChoiceDisabled(false);
    };

    if (nextIndex !== -1) {
      resetSceneFlags();
      setHistory(h => [...h, current]);
      setCurrent(nextIndex);
      return;
    }
  };

  const handlePrev = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrent(prev);
    setSelected(null);
    setFeedback(null);
    setWrongTriedInThisScene(false);
    setAwardedExpThisScene(false);
    setChoiceDisabled(false);
  };

  // 모달 시 스크롤 잠금
  useEffect(() => {
    const lock = clearMsg || failMsg || showConfetti;
    const { body, documentElement: html } = document;
    if (lock) {
      const prevBodyOverflow = body.style.overflow;
      const prevHtmlOverflowX = html.style.overflowX;
      body.style.overflow = 'hidden';
      html.style.overflowX = 'hidden';
      return () => {
        body.style.overflow = prevBodyOverflow;
        html.style.overflowX = prevHtmlOverflowX;
      };
    }
  }, [clearMsg, failMsg, showConfetti]);

  // 로딩/에러
  if (loading) {
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
  if (!scenarios.length || !scenario) {
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

  const acc = selected?.points?.accuracy ?? 0;
  const tone: 'good' | 'ok' | 'bad' =
    acc >= 10 ? 'good' : acc > 0 ? 'ok' : 'bad';

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden py-8 md:py-10 bg-white text-neutral-900 dark:bg-[#111827] dark:text-white">
        <div className="w-full md:max-w-screen-lg mx-auto px-3 md:px-4 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6">
          <CharacterPanel
            level={level}
            expDisplay={EXPDisplay}
            neededExp={neededEXP}
            progressPct={progressPct}
            highlight={showLevelUp}
            hideExpFill={hideExpFill}
          />
          <main>
            <ProgressBar
              currentIndex={current}
              total={scenarios.length}
              level={level}
              progressPct={progressPct}
              expDisplay={EXPDisplay}
              neededExp={neededEXP}
              hideExpFill={hideExpFill}
            />
            <SituationCard
              title={scenario.title ?? ''}
              content={scenario.content ?? ''}
              sceneScript={scenario.sceneScript ?? ''}
            />
            <OptionsList
              options={scenario.options ?? []}
              selected={selected}
              onSelect={handleChoice}
              disabled={choiceDisabled}
            />
            {feedback && <FeedbackBanner text={feedback} tone={tone} />}
            <NavButtons
              canGoPrev={history.length > 0}
              canGoNext={!!selected}
              onPrev={handlePrev}
              onNext={handleNext}
            />
            <div className="w-full px-3 mx-auto md:max-w-screen-lg md:px-4">
              <PlayMoreButton to="/training" />
            </div>
          </main>
        </div>
        {showLevelUp && <LevelUpToast bonus={levelUpBonus} level={level} />}
        <ConfettiOverlay show={showConfetti} vw={vw} vh={vh} />
        {clearMsg && (
          <ClearModal
            message={clearMsg}
            onClose={() => {
              setClearMsg(null);
              setShowConfetti(false);
            }}
          />
        )}
        {failMsg && (
          <FailModal
            message={failMsg}
            onClose={() => setFailMsg(null)}
            onRetry={() => {
              setFailMsg(null);
              setCurrent(0);
              setHistory([]);
              setFailedThisRun(false);
              setSelected(null);
              setFeedback(null);
              setWrongTriedInThisScene(false);
              setAwardedExpThisScene(false);
              setEndModalAutoShown(false);
              setChoiceDisabled(false);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
