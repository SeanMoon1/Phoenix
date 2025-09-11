import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { fetchScenarioByType } from '@/services/scenarioService';
import { trainingResultApi } from '@/services/api';
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

type PersistState = {
  EXP: number;
  level: number;
  streak: number;
  totalCorrect: number;
};

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

interface ScenarioPageProps {
  scenarioSetName?: string;
  fetchScenarios?: () => Promise<Scenario[]>;
  nextScenarioPath?: string;
  persistKey?: string;
}

export default function ScenarioPage(props: ScenarioPageProps = {}) {
  // URL에서 시나리오 타입 추출
  const location = useLocation();
  const scenarioType = location.pathname.split('/').pop() || 'fire';
  const scenarioSetName =
    props.scenarioSetName || getScenarioSetName(scenarioType);
  const nextScenarioPath = props.nextScenarioPath || '/training';
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const persistKey = props.persistKey || DEFAULT_PERSIST_KEY;

  // 데이터 & 진행
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const startTime = useMemo(() => Date.now(), []); // 컴포넌트 마운트 시 한 번만 설정
  const scenario = scenarios[current];

  // 경과 시간 계산
  const timeSpent = Math.floor((Date.now() - startTime) / 1000); // 초 단위

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

  // 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (props.fetchScenarios) {
          const data = await props.fetchScenarios();
          setScenarios(data);
        } else {
          const data = await fetchScenarioByType(scenarioType);
          setScenarios(data);
        }
      } catch (error) {
        console.error('시나리오 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [scenarioType, props.fetchScenarios]);

  // 리사이즈
  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 로컬 스토리지 복구/저장
  useEffect(() => {
    const raw = localStorage.getItem(persistKey);
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
    localStorage.setItem(persistKey, JSON.stringify(s));
  }, [EXP, level, totalCorrect, persistKey]);

  // 훈련 결과 서버 전송
  const saveTrainingResult = async () => {
    if (!user?.id) return;

    try {
      const totalScore = Math.floor((totalCorrect / scenarios.length) * 100);
      const accuracyScore = Math.floor((totalCorrect / scenarios.length) * 100);
      const speedScore = Math.floor(Math.max(0, 100 - timeSpent / 60)); // 시간 기반 속도 점수

      const resultData = {
        participantId: 0, // 임시값, 실제로는 훈련 세션 참가자 ID
        sessionId: 0, // 임시값, 실제로는 훈련 세션 ID
        scenarioId: 1, // 임시값, 실제로는 시나리오 ID
        userId: user.id,
        resultCode: `RESULT_${Date.now()}`,
        accuracyScore,
        speedScore,
        totalScore,
        completionTime: timeSpent,
        feedback: failedThisRun ? '훈련 실패' : '훈련 완료',
        completedAt: new Date().toISOString(),
      };

      await trainingResultApi.saveResult(resultData);
      console.log('훈련 결과가 서버에 저장되었습니다.');
    } catch (error) {
      console.error('훈련 결과 저장 실패:', error);
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
  const handleChoice = (option: ScenarioOption) => {
    if (!scenario) return;
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
          duration: 350,
          onUpdate: setEXPDisplay,
          onComplete: () => {
            setLevel(nextLevel);
            setEXP(nextEXP);
            setLevelUpBonus(totalBonus);
            setShowLevelUp(true);
            window.setTimeout(() => setShowLevelUp(false), 1400);
            setEXPDisplay(0);
            animateValue({
              from: 0,
              to: nextEXP,
              duration: 600,
              onUpdate: setEXPDisplay,
            });
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
          />
          <main>
            <ProgressBar
              currentIndex={current}
              total={scenarios.length}
              level={level}
              progressPct={progressPct}
              expDisplay={EXPDisplay}
              neededExp={neededEXP}
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
            }}
          />
        )}
      </div>
    </Layout>
  );
}
