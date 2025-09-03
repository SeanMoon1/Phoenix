import { useEffect, useMemo, useState } from "react";
import { fireBasicSteps } from "../../mocks/scenarios/fire-basic";
import type { ScenarioStep } from "../../types/scenario";
import Confetti from "react-confetti";
import phoenixImg from "../../assets/images/phoenix.png";

type PersistState = {
  EXP: number;
  level: number;
  streak: number;
  totalCorrect: number;
};

const PERSIST_KEY = "phoenix_training_state";
const BASE_EXP = 10; // ✅ 정답 기본 경험치
const STREAK_BONUS_PER = 2; // ✅ 연속정답(스트릭) 보너스: newStreak * 2

function getEXPForNextLevel(level: number) {
  // ✅ 레벨업 필요 경험치 공식 (원하면 난이도 곡선으로 변경 가능)
  return level * 100;
}

/**
 * 숫자 애니메이션 유틸 (EXP 게이지가 부드럽게 차오르도록)
 * - easeOutCubic으로 0.5s 동안 from → to
 */
function animateValue(opts: {
  from: number;
  to: number;
  duration: number; // ms
  onUpdate: (v: number) => void;
  onComplete?: () => void;
}) {
  const { from, to, duration, onUpdate, onComplete } = opts;
  const start = performance.now();
  function tick(now: number) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = from + (to - from) * eased;
    onUpdate(v);
    if (t < 1) requestAnimationFrame(tick);
    else onComplete?.();
  }
  requestAnimationFrame(tick);
}

export default function ScenarioPage() {
  const scenarios: ScenarioStep[] = fireBasicSteps;
  const scenarioSetName = "화재 대응 기초"; // ✅ 시나리오 묶음 이름(모달/메시지에 사용)

  // 진행 상태
  const [current, setCurrent] = useState(0);
  const scenario = scenarios[current];

  // 게임화(게이미피케이션) 상태
  const [EXP, setEXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  // 게이지 표시용 애니메이션 값 (실제 EXP와 분리)
  const [EXPDisplay, setEXPDisplay] = useState(0);

  // 시나리오 결과 모달/컨페티
  const [showConfetti, setShowConfetti] = useState(false);
  const [clearMsg, setClearMsg] = useState<string | null>(null);
  const [failMsg, setFailMsg] = useState<string | null>(null);

  // 이번 시나리오에서 오답 여부(한 번이라도 틀리면 클리어 불가)
  const [failedThisRun, setFailedThisRun] = useState(false);

  // Confetti 캔버스 크기 (고정 포지션 + 1px 여유로 가로 스크롤 방지)
  const [vw, setVw] = useState<number>(window.innerWidth);
  const [vh, setVh] = useState<number>(window.innerHeight);

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 로컬 스토리지 복구
  useEffect(() => {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (raw) {
      try {
        const s: PersistState = JSON.parse(raw);
        setEXP(s.EXP ?? 0);
        setLevel(s.level ?? 1);
        setStreak(s.streak ?? 0);
        setTotalCorrect(s.totalCorrect ?? 0);
        setEXPDisplay(s.EXP ?? 0);
      } catch {
        // 복구 실패 시 무시
        console.warn("Failed to restore training state from localStorage");
      }
    }
  }, []);

  // 로컬 스토리지 저장
  useEffect(() => {
    const s: PersistState = { EXP, level, streak, totalCorrect };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(s));
  }, [EXP, level, streak, totalCorrect]);

  // 파생 값: 현재 레벨의 필요 EXP, 게이지 퍼센트
  const neededEXP = useMemo(() => getEXPForNextLevel(level), [level]);
  const progressPct = useMemo(() => {
    const pct = Math.min(100, Math.round((EXPDisplay / neededEXP) * 100));
    return Number.isFinite(pct) ? pct : 0;
  }, [EXPDisplay, neededEXP]);

  /**
   * 선택 처리:
   * - 정답: 스트릭 +1, EXP 계산/레벨업, 게이지 애니메이션
   * - 오답: 스트릭 0, 실패 플래그 ON
   * - 마지막 문제: 이번 선택까지 반영한 실패 여부(nextFailed)로 클리어/실패 분기
   */
  const handleChoice = (pickedIndex: number) => {
    const isCorrect = pickedIndex === scenario.correctIndex;

    // 이번 선택까지 포함한 실패 여부를 즉시 계산(상태 비동기 보완)
    const nextFailed = failedThisRun || !isCorrect;

    if (isCorrect) {
      const newStreak = streak + 1;
      const gained = BASE_EXP + newStreak * STREAK_BONUS_PER;

      let tempEXP = EXP + gained;
      let tempLevel = level;

      // 게이지 애니메이션: EXPDisplay -> tempEXP
      animateValue({
        from: EXPDisplay,
        to: tempEXP,
        duration: 500,
        onUpdate: setEXPDisplay,
      });

      // 연쇄 레벨업 처리
      while (tempEXP >= getEXPForNextLevel(tempLevel)) {
        tempEXP -= getEXPForNextLevel(tempLevel);
        tempLevel += 1;
      }

      setEXP(tempEXP);
      setLevel(tempLevel);
      setStreak(newStreak);
      setTotalCorrect((c) => c + 1);
    } else {
      setStreak(0);
      // 오답 시 게이지 변화 없음(필요 시 진동/빨간 깜빡임 등 UI 연출 추가 가능)
    }

    // 이번 선택 결과를 상태에 반영
    setFailedThisRun(nextFailed);

    const isLast = current >= scenarios.length - 1;
    if (!isLast) {
      // 다음 문제로 진행
      setCurrent((c) => c + 1);
    } else {
      // 마지막 문제: 실패 여부에 따라 분기
      if (!nextFailed) {
        setClearMsg(
          `축하합니다! ${scenarioSetName} 시나리오를 모두 클리어하였습니다.`
        );
        setShowConfetti(true);
        // confetti는 4.5초 뒤 자동 종료
        setTimeout(() => setShowConfetti(false), 4500);
      } else {
        setFailMsg(
          `${scenarioSetName} 시나리오를 클리어하지 못했습니다. 다시 도전해보세요!`
        );
      }
    }
  };

  // 클리어 메시지 닫기
  const closeClearMsg = () => {
    setClearMsg(null);
    setShowConfetti(false);
  };

  // 재도전 핸들러
  const handleRetry = () => {
    setFailMsg(null);
    setCurrent(0);
    setFailedThisRun(false);
  };

  /*
   * 모달/컨페티 표시 시 스크롤 잠금
   * - 가로 스크롤도 강제 차단하여 레이아웃 흔들림 방지
   */
  useEffect(() => {
    const lock = clearMsg || showConfetti;
    const { body, documentElement: html } = document;

    if (lock) {
      const prevBodyOverflow = body.style.overflow;
      const prevHtmlOverflowX = html.style.overflowX;

      body.style.overflow = "hidden";
      html.style.overflowX = "hidden";

      return () => {
        body.style.overflow = prevBodyOverflow;
        html.style.overflowX = prevHtmlOverflowX;
      };
    }
  }, [clearMsg, showConfetti]);

  // 공통 섹션 스타일
  const sectionBaseClasses =
    "w-full mx-0 md:max-w-screen-md md:mx-auto md:px-4 max-[770px]:px-2.5";

  return (
    // 전체 래퍼: 가로 스크롤 숨김 + 상대 포지션
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[linear-gradient(135deg,#232526_0%,#414345_100%)] text-white py-10 relative items-center md:items-center max-[770px]:items-stretch">
      {/* 헤더: 팀 마스코트 */}
      <header className={`${sectionBaseClasses} flex items-center mb-8`}>
        <img
          src={phoenixImg}
          alt="Phoenix Mascot"
          className="h-16 w-auto object-contain"
        />
      </header>

      {/* 시나리오 종료시에 중앙 분출 confetti */}
      {showConfetti && (
        <Confetti
          width={Math.max(0, vw - 1)}
          height={vh}
          recycle={false}
          numberOfPieces={320}
          gravity={0.25}
          wind={0}
          tweenDuration={4800}
          confettiSource={{ x: vw / 2 - 10, y: vh / 2 - 10, w: 20, h: 20 }}
          style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
        />
      )}

      {/* 상단 상태바 */}
      <section className={`${sectionBaseClasses} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-black/50 rounded-xl p-4 shadow-md">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">레벨</h2>
              <span className="text-2xl font-bold">Lv.{level}</span>
            </div>
            <div className="mt-3">
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                {/* 게이지는 EXPDisplay 기준 + transition 으로 부드럽게 */}
                <div
                  className="h-full bg-emerald-400 transition-[width] duration-500"
                  style={{ width: `${progressPct}%` }}
                  aria-label="EXP-progress"
                />
              </div>
              <p className="mt-2 text-sm text-white/80">
                EXP {Math.round(EXPDisplay)} / {neededEXP} ({progressPct}%)
              </p>
            </div>
          </div>

          <div className="bg-black/50 rounded-xl p-4 shadow-md">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">진행</h2>
              <span className="text-2xl font-bold">
                {current + 1} / {scenarios.length}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/80">
              연속 정답: <strong>{streak}</strong> • 정답 수:{" "}
              <strong>{totalCorrect}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* 상황 설명 */}
      <section className={`${sectionBaseClasses} mb-8`}>
        <div className="bg-black/60 rounded-xl p-4 md:p-6 shadow-xl leading-relaxed">
          <p className="text-[1.5rem]">
            <strong>상황:</strong> {scenario.description}
          </p>
        </div>
      </section>

      {/* 선택지 */}
      <section className={`${sectionBaseClasses} flex flex-col gap-4 mb-10`}>
        {scenario.choices.map((choice, idx) => (
          <button
            key={idx}
            className="w-full bg-red-500 text-white px-8 py-4 text-xl shadow-md transition-colors hover:bg-orange-400 hover:cursor-pointer rounded-lg"
            onClick={() => handleChoice(idx)}
          >
            {String.fromCharCode(65 + idx)}. {choice}
          </button>
        ))}
      </section>

      {/* 클리어 모달 */}
      {clearMsg && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70"
          aria-live="assertive"
        >
          <div className="relative flex flex-col items-center">
            <div className="relative flex flex-col items-center">
              <img
                src={phoenixImg}
                alt="Phoenix Mascot"
                className="h-56 w-auto animate-bounce"
              />
              {/* 말풍선 */}
              <div className="absolute -top-28 left-1/2 -translate-x-1/2 bg-white text-black rounded-2xl p-4 shadow-lg w-72 text-center">
                <p className="text-base font-semibold leading-relaxed">
                  {clearMsg}
                </p>
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0
                       border-l-8 border-r-8 border-t-8 border-transparent border-t-white"
                />
              </div>
            </div>

            {/* 확인 버튼 */}
            <button
              className="-mt-5 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              onClick={closeClearMsg}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 실패 모달 */}
      {failMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white text-black rounded-2xl p-8 shadow-2xl w-[90%] max-w-[480px] text-center">
            <h2 className="text-3xl font-bold mb-3 text-red-700">실패</h2>
            <p className="text-lg mb-6">{failMsg}</p>
            <div className="flex gap-3 justify-center">
              <button
                className="px-5 py-3 rounded-lg bg-neutral-700 text-white hover:bg-neutral-800 transition-colors hover:cursor-pointer font-semibold"
                onClick={() => setFailMsg(null)}
              >
                닫기
              </button>
              <button
                className="px-5 py-3 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors hover:cursor-pointer font-semibold"
                onClick={handleRetry}
              >
                다시 도전
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
