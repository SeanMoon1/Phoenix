import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { fetchFireScenario } from '@/services/scenarioService';
import type { Scenario, ScenarioOption } from '@/types/scenario';
import CharacterPanel from '@/components/common/CharacterPanel';
import ProgressBar from '@/components/common/ProgressBar';
import SituationCard from '@/components/common/SituationCard';
import OptionsList from '@/components/common/OptionsList';
import FeedbackBanner from '@/components/common/FeedbackBanner';
import NavButtons from '@/components/common/NavButtons';
import ClearModal from '@/components/common/ClearModal';
import FailModal from '@/components/common/FailModal';
import ConfettiOverlay from '@/components/common/ConfettiOverlay';
import phoenixImg from '@/assets/images/phoenix.png';
import { getEXPForNextLevel, animateValue } from '@/utils/exp';

// ---- 경험치/레벨 상태 ----
type PersistState = {
  EXP: number;
  level: number;
  streak: number; // 호환용
  totalCorrect: number;
};

const PERSIST_KEY = 'phoenix_training_state';
const BASE_EXP = 10; // 고정 EXP
const scenarioSetName = '화재 대응';

export default function ScenarioPage() {
  // 데이터 & 진행
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  const scenario = scenarios[current];

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

  // 성공/실패 모달 & 컨페티
  const [showConfetti, setShowConfetti] = useState(false);
  const [clearMsg, setClearMsg] = useState<string | null>(null);
  const [failMsg, setFailMsg] = useState<string | null>(null);
  const [vw, setVw] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [vh, setVh] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );

  // 장면 단위 제어
  const [failedThisRun, setFailedThisRun] = useState(false);
  const [wrongTriedInThisScene, setWrongTriedInThisScene] = useState(false);
  const [awardedExpThisScene, setAwardedExpThisScene] = useState(false);

  // 초기 로드
  useEffect(() => {
    fetchFireScenario()
      .then(data => setScenarios(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
    const raw = localStorage.getItem(PERSIST_KEY);
    if (raw) {
      try {
        const s: PersistState = JSON.parse(raw);
        setEXP(s.EXP ?? 0);
        setLevel(s.level ?? 1);
        setTotalCorrect(s.totalCorrect ?? 0);
        setEXPDisplay(s.EXP ?? 0);
      } catch {
        console.warn('Failed to restore training state');
      }
    }
  }, []);
  useEffect(() => {
    const s: PersistState = { EXP, level, streak: 0, totalCorrect };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(s));
  }, [EXP, level, totalCorrect]);

  // 선택 핸들러
  const handleChoice = (option: ScenarioOption) => {
    const isCorrect = (option.points?.accuracy ?? 0) > 0;
    setSelected(option);
    setFeedback(option.reaction);

    if (!isCorrect) {
      setWrongTriedInThisScene(true);
      setFailedThisRun(true);
    }

    if (!awardedExpThisScene && isCorrect && !wrongTriedInThisScene) {
      const gained = BASE_EXP;

      let nextEXP = EXP + gained;
      let nextLevel = level;

      animateValue({
        from: EXPDisplay,
        to: nextEXP,
        duration: 500,
        onUpdate: setEXPDisplay,
      });

      while (nextEXP >= getEXPForNextLevel(nextLevel)) {
        nextEXP -= getEXPForNextLevel(nextLevel);
        nextLevel += 1;
      }

      setEXP(nextEXP);
      setLevel(nextLevel);
      setTotalCorrect(c => c + 1);
      setAwardedExpThisScene(true);
    }
  };

  // 다음/이전
  const handleNext = () => {
    if (!selected || !scenario) return;
    const nextId = selected.nextId;
    const nextIndex =
      typeof nextId === 'string'
        ? scenarios.findIndex(s => s.sceneId === nextId)
        : -1;

    // 현재 장면 플래그 리셋
    setSelected(null);
    setFeedback(null);
    setWrongTriedInThisScene(false);
    setAwardedExpThisScene(false);

    if (nextIndex !== -1) {
      setHistory(h => [...h, current]);
      setCurrent(nextIndex);
      return;
    }

    // 종료 분기
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
  };

  const handlePrev = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrent(prev);
    setSelected(null);
    setFeedback(null);
    setWrongTriedInThisScene(false);
    setAwardedExpThisScene(false);
  };

  // 모달 열릴 때 스크롤 잠금
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
      <div
        className="min-h-screen w-full flex items-center justify-center bg-neutral-100 text-neutral-900 dark:bg-[#111827]
] dark:text-white"
      >
        <div className="text-center">
          <img
            src={phoenixImg}
            alt="Phoenix"
            className="h-24 w-auto mx-auto mb-4 animate-pulse"
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
            className="h-24 w-auto mx-auto mb-4"
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
      <div
        className="min-h-screen w-full overflow-x-hidden py-8 md:py-10 bg-white text-neutral-900 dark:bg-[#111827]
 dark:text-white"
      >
        <div className="w-full md:max-w-screen-lg mx-auto px-3 md:px-4 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6">
          <CharacterPanel
            level={level}
            expDisplay={EXPDisplay}
            neededExp={neededEXP}
            progressPct={progressPct}
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
              title={scenario.title}
              content={scenario.content}
              sceneScript={scenario.sceneScript}
            />

            <OptionsList
              options={scenario.options}
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
          </main>
        </div>

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
            }}
          />
        )}
      </div>
    </Layout>
  );
}
