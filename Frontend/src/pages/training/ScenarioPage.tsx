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
import PlayMoreButton from '@/components/common/PlayMoreButton';

import phoenixImg from '@/assets/images/phoenix.png';
import LevelUpToast from '@/components/common/LevelUpToast';
import { getEXPForNextLevel, animateValue, getLevelUpBonus } from '@/utils/exp';
import { useNavigate } from 'react-router-dom';

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

const SCENARIO_SELECT_PATH = '/training';
const TOKEN_REVIEW = '#REVIEW';
const TOKEN_SCENARIO_SELECT = '#SCENARIO_SELECT';

// 마지막 토큰 집합
const TERMINAL_TOKENS = new Set([TOKEN_REVIEW, TOKEN_SCENARIO_SELECT]);

// 선택지가 '복습하기'인지 판별
const isReviewChoice = (opt: ScenarioOption) =>
  opt.nextId === TOKEN_REVIEW || (opt.answer ?? '').includes('복습');

// 선택지가 '다음 시나리오 선택하기'인지 판별
const isScenarioSelectChoice = (opt: ScenarioOption) =>
  opt.nextId === TOKEN_SCENARIO_SELECT ||
  (opt.answer ?? '').includes('다음 시나리오');

// 현재 장면이 '마지막 장면'인지 판별
function isTerminalScene(scn: Scenario | undefined, all: Scenario[]): boolean {
  if (!scn) return false;
  const idSet = new Set(all.map(s => s.sceneId));
  // 다음으로 갈 수 있는 정상 장면이 하나도 없고, 전부 특수 토큰/없음/미존재 ID면 '종단'
  return (
    scn.options?.every(opt => {
      const nextId = opt.nextId;
      if (!nextId) return true;
      if (TERMINAL_TOKENS.has(nextId as string)) return true;
      return !idSet.has(nextId as string);
    }) ?? false
  );
}

export default function ScenarioPage() {
  // 훅은 컴포넌트 내부에서 호출
  const navigate = useNavigate();

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

  // 성공, 실패 모달 & 컨페티
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

  // 레벨업 연출
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpBonus, setLevelUpBonus] = useState(0);

  // 모달 자동 1회 노출 방지 플래그
  const [endModalAutoShown, setEndModalAutoShown] = useState(false);

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

  // 마지막 장면 도달 시 자동으로 클리어/실패 모달 노출
  useEffect(() => {
    if (!scenario) return;
    if (isTerminalScene(scenario, scenarios) && !endModalAutoShown) {
      setEndModalAutoShown(true);

      if (!failedThisRun) {
        // 성공 모달 + 컨페티
        setClearMsg(
          `축하합니다! ${scenarioSetName} 시나리오를 모두 클리어하였습니다.`
        );
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4500);
      } else {
        // 실패 모달
        setFailMsg(
          `${scenarioSetName} 시나리오를 클리어하지 못했습니다. 다시 도전해보세요!`
        );
      }
    }
  }, [scenario, scenarios, failedThisRun, endModalAutoShown]);

  // 선택 핸들러(특수 선택지는 '즉시' 동작)
  const handleChoice = (option: ScenarioOption) => {
    setSelected(option);
    setFeedback(option.reaction);

    // 특수 선택지 즉시 처리
    if (isReviewChoice(option)) {
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
      setEndModalAutoShown(false); //
      return;
    }
    if (isScenarioSelectChoice(option)) {
      navigate(SCENARIO_SELECT_PATH);
      return;
    }

    // 정답, 오답 처리
    const isCorrect = (option.points?.accuracy ?? 0) > 0;
    if (!isCorrect) {
      setWrongTriedInThisScene(true);
      setFailedThisRun(true);
    }

    // 같은 문제에서 오답 이력 없고 정답 첫 시도일 때만 EXP 지급
    if (!awardedExpThisScene && isCorrect && !wrongTriedInThisScene) {
      const gained = BASE_EXP;

      // 1) 현재 레벨의 목표치
      const oldLevel = level;
      const oldNeeded = getEXPForNextLevel(oldLevel);

      // 2) 누적, 보너스 계산
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
        // (A) 레벨업 없음 → 잔여치까지 자연스럽게
        animateValue({
          from: EXPDisplay,
          to: nextEXP,
          duration: 600,
          onUpdate: setEXPDisplay,
        });
        setEXP(nextEXP);
        setLevel(nextLevel);
      } else {
        // (B) 레벨업 있음 → 2단계 애니메이션
        // 1단계: 현재 레벨 바를 100%까지 채우기
        animateValue({
          from: EXPDisplay,
          to: oldNeeded,
          duration: 350,
          onUpdate: setEXPDisplay,
          onComplete: () => {
            // 레벨/EXP 커밋 + 레벨업 이펙트
            setLevel(nextLevel);
            setEXP(nextEXP);

            setLevelUpBonus(totalBonus);
            setShowLevelUp(true);
            window.setTimeout(() => setShowLevelUp(false), 1400);

            // 2단계: 새 레벨에서 0 → 잔여 EXP(nextEXP)까지
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

      // 공통 후처리
      setTotalCorrect(c => c + 1);
      setAwardedExpThisScene(true);
    }
  };

  // 다음/이전
  const handleNext = () => {
    if (!selected || !scenario) return; // 널가드

    const nextId = selected.nextId;

    // "훈련 내용을 복습하기" → 처음 장면으로 리셋
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

    // "다음 시나리오 훈련하기" → 선택 탭으로 이동
    if (nextId === TOKEN_SCENARIO_SELECT) {
      navigate(SCENARIO_SELECT_PATH);
      return;
    }

    // nextId로 다음 장면 이동 or 종료 판단
    const nextIndex =
      typeof nextId === 'string'
        ? scenarios.findIndex(s => s.sceneId === nextId)
        : -1;

    // 현재 장면 플래그 리셋은 '전환/종료' 직전에 수행
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

    // 종료 분기(성공/실패)
    resetSceneFlags();
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

  // 이전 장면
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
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 text-neutral-900 dark:bg-[#111827] dark:text-white">
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
              title={scenario.title}
              content={scenario.content || ''}
              sceneScript={scenario.sceneScript || ''}
            />

            <OptionsList
              options={scenario.options || []}
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

            <div className="w-full md:max-w-screen-lg mx-auto px-3 md:px-4">
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
