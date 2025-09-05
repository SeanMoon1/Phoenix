import { useEffect, useMemo, useState } from 'react';
import { fetchFireScenario } from '@/services/scenarioService';
import type { Scenario, ScenarioOption } from '@/types/scenario';
import Confetti from 'react-confetti';
import phoenixImg from '@/assets/images/phoenix.png';
import Layout from '@/components/layout/Layout';

// ---- 경험치/레벨 상태 ----
type PersistState = {
  EXP: number;
  level: number;
  // streak는 더 이상 사용하지 않지만 기존 로컬스토리지 호환을 위해 타입만 유지
  streak: number;
  totalCorrect: number;
};

const PERSIST_KEY = 'phoenix_training_state';
const BASE_EXP = 10; // 스트릭 보너스 제거 → 고정 EXP
const scenarioSetName = '화재 대응';

function getEXPForNextLevel(level: number) {
  return level * 100;
}

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
  // 데이터 & 진행
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [history, setHistory] = useState<number[]>([]); // 이전으로 돌아가기용 스택

  const scenario = scenarios[current];

  // 선택/피드백
  const [selected, setSelected] = useState<ScenarioOption | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // 게임화 상태 (스트릭 제거)
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

  // 시나리오 단위 제어:
  // - 한 문제에서 오답이 단 한 번이라도 나오면 true (러닝 전체 실패 판정에 사용)
  const [failedThisRun, setFailedThisRun] = useState(false);
  // - 현재 문제에서 오답을 시도했는지 (정답 눌러도 EXP 지급 방지용)
  const [wrongTriedInThisScene, setWrongTriedInThisScene] = useState(false);
  // - 현재 문제에서 EXP가 이미 지급되었는지(중복 EXP 방지)
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
    // streak는 더 이상 사용하지 않으므로 0으로 고정 저장
    const s: PersistState = { EXP, level, streak: 0, totalCorrect };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(s));
  }, [EXP, level, totalCorrect]);

  // 선택 핸들러: 피드백 표시, EXP/레벨 처리 (진행은 버튼으로 수동)
  const handleChoice = (option: ScenarioOption) => {
    const isCorrect = (option.points?.accuracy ?? 0) > 0;

    // 피드백과 현재 선택은 항상 갱신 (UI 반응)
    setSelected(option);
    setFeedback(option.reaction);

    // 오답이 한 번이라도 나오면 러닝 실패 플래그 ON
    if (!isCorrect) {
      setWrongTriedInThisScene(true);
      setFailedThisRun(true);
    }

    // EXP 지급 규칙:
    // 1) 현재 문제에서 아직 EXP를 지급하지 않았고,
    // 2) 첫 시도가 정답(= 오답 시도 기록이 없음)일 때만,
    // 3) 단 한 번만 BASE_EXP 지급
    if (!awardedExpThisScene && isCorrect && !wrongTriedInThisScene) {
      const gained = BASE_EXP; // 스트릭 보너스 제거 → 고정 EXP

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
      setAwardedExpThisScene(true); // 같은 문제에서 추가 지급 방지
    }
  };

  // 다음/이전
  const handleNext = () => {
    if (!selected || !scenario) return;

    // 다음 인덱스 찾기 (nextId 기반)
    const nextId = selected.nextId;
    const nextIndex =
      typeof nextId === 'string'
        ? scenarios.findIndex(s => s.sceneId === nextId)
        : -1;

    // 다음 문제로 넘어가기 전, 현재 문제 상태 초기화(다음 문제에서 다시 첫 시도 판단)
    setSelected(null);
    setFeedback(null);
    setWrongTriedInThisScene(false);
    setAwardedExpThisScene(false);

    if (nextIndex !== -1) {
      setHistory(h => [...h, current]);
      setCurrent(nextIndex);
      return;
    }

    // nextId 매칭 없거나 "#END" 등: 종료 분기
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
    // 이전 문제로 돌아가면 시도 플래그 초기화
    setWrongTriedInThisScene(false);
    setAwardedExpThisScene(false);
    // failedThisRun은 유지 (러닝 전체 판정)
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

  // 로딩/에러 처리
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 text-neutral-900 dark:bg-[linear-gradient(135deg,#232526_0%,#414345_100%)] dark:text-white">
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
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 text-neutral-900 dark:bg-[linear-gradient(135deg,#232526_0%,#414345_100%)] dark:text-white">
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

  // 진행 퍼센트 (UI)
  const percentAll = Math.round(((current + 1) / scenarios.length) * 100);

  // 피드백 색상
  const acc = selected?.points?.accuracy ?? 0;
  const feedbackBg =
    acc >= 10
      ? 'bg-emerald-500 dark:bg-emerald-600'
      : acc > 0
      ? 'bg-amber-500 dark:bg-amber-600'
      : 'bg-rose-600 dark:bg-rose-700';

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden py-8 md:py-10 bg-neutral-100 text-neutral-900 dark:bg-[linear-gradient(135deg,#232526_0%,#414345_100%)] dark:text-white">
        {/* 메인 그리드: md(>=768/770px)에서 좌측 패널 + 우측 컨텐츠 */}
        <div className="w-full md:max-w-screen-lg mx-auto px-3 md:px-4 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6">
          {/* 좌측 패널: 캐릭터 + 레벨 (>=770px에서만 보이기) */}
          <aside className="hidden md:flex md:flex-col md:gap-4">
            <div className="bg-white/80 dark:bg-black/40 rounded-2xl shadow-md p-4">
              <img
                src={phoenixImg}
                alt="Phoenix Mascot"
                className="w-full max-w-[240px] object-contain"
              />
            </div>

            <div className="bg-white/90 dark:bg-black/40 rounded-2xl shadow-md p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">
                  플레이어 이름{/* 회원 닉네임으로 수정할 것 */}
                </h2>
                <span className="text-2xl font-bold">Lv.{level}</span>
              </div>
              <div className="mt-3">
                <div className="h-3 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 dark:bg-emerald-400 transition-[width] duration-500"
                    style={{ width: `${progressPct}%` }}
                    aria-label="EXP-progress"
                  />
                </div>
                <p className="mt-2 text-sm opacity-80">
                  EXP {Math.round(EXPDisplay)} / {neededEXP} ({progressPct}%)
                </p>
              </div>
            </div>
          </aside>

          {/* 우측(모바일에서는 전체) 컨텐츠 */}
          <main>
            {/* 상단 진행바 카드 */}
            <section className="bg-white/80 dark:bg-black/40 rounded-2xl shadow-md p-4 mb-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">진행</h2>
                <span className="text-2xl font-bold">
                  {current + 1} / {scenarios.length}
                </span>
              </div>
              <div className="h-3 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-emerald-500 dark:bg-emerald-400 transition-[width] duration-300"
                  style={{ width: `${percentAll}%` }}
                />
              </div>

              {/* 모바일(<770px)에서는 캐릭터+레벨을 상단에 표시 */}
              <div className="md:hidden mt-4 grid grid-cols-1 gap-4">
                <div className="bg-white/90 dark:bg-black/40 rounded-2xl shadow p-4">
                  <img
                    src={phoenixImg}
                    alt="Phoenix Mascot"
                    className="h-24 w-auto mx-auto"
                  />
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between">
                      <h2 className="text-base font-semibold">레벨</h2>
                      <span className="text-xl font-bold">Lv.{level}</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-2.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 dark:bg-emerald-400 transition-[width] duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs opacity-80">
                        EXP {Math.round(EXPDisplay)} / {neededEXP} (
                        {progressPct}
                        %)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 제목 */}
            <section className="bg-white/80 dark:bg-black/40 rounded-2xl shadow-md p-4 mb-4">
              <h1 className="text-2xl font-bold text-center">
                {scenario.title}
              </h1>
            </section>

            {/* 상황 설명 */}
            <section className="bg-white/90 dark:bg-black/40 rounded-2xl shadow-md p-5 md:p-6 mb-6 leading-relaxed">
              <p className="text-lg mb-3">
                <strong>상황:</strong> {scenario.content}
              </p>
              <p className="text-base opacity-90">{scenario.sceneScript}</p>
            </section>

            {/* 선택지 */}
            <section className="flex flex-col gap-3 mb-6">
              {scenario.options.map(option => {
                const isSelected = selected?.answerId === option.answerId;
                return (
                  <button
                    key={option.answerId}
                    className={`w-full rounded-xl px-6 py-4 text-lg shadow-md transition
                      ${isSelected ? 'ring-2 ring-amber-400' : ''}
                      bg-rose-500 hover:bg-rose-400 text-white
                      dark:bg-rose-600 dark:hover:bg-rose-500`}
                    onClick={() => handleChoice(option)}
                  >
                    {option.answer}
                  </button>
                );
              })}
            </section>

            {/* 피드백 */}
            {feedback && (
              <div
                className={`rounded-2xl shadow-md px-5 py-4 mb-6 text-white ${feedbackBg}`}
                role="status"
                aria-live="polite"
              >
                <p className="text-base md:text-lg font-medium text-center">
                  {feedback}
                </p>
              </div>
            )}

            {/* 이전/다음 버튼 */}
            <section className="flex items-center justify-between gap-3">
              <button
                className="px-5 py-3 rounded-xl bg-neutral-300 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600 disabled:opacity-50"
                onClick={handlePrev}
                disabled={history.length === 0}
              >
                ← 이전
              </button>

              <button
                className="px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                onClick={handleNext}
                disabled={!selected}
              >
                다음 →
              </button>
            </section>
          </main>
        </div>

        {/* 컨페티 */}
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
            style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
          />
        )}

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
                onClick={() => {
                  setClearMsg(null);
                  setShowConfetti(false);
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 실패 모달 */}
        {failMsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-white text-black rounded-2xl p-8 shadow-2xl w-[90%] max-w-[520px] text-center">
              <h2 className="text-3xl font-bold mb-3 text-red-700">실패</h2>
              <p className="text-lg mb-6">{failMsg}</p>
              <div className="flex gap-3 justify-center">
                <button
                  className="px-5 py-3 rounded-lg bg-neutral-700 text-white hover:bg-neutral-800"
                  onClick={() => setFailMsg(null)}
                >
                  닫기
                </button>
                <button
                  className="px-5 py-3 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                  onClick={() => {
                    setFailMsg(null);
                    setCurrent(0);
                    setHistory([]);
                    setFailedThisRun(false);
                    setSelected(null);
                    setFeedback(null);
                    // 장면 단위 플래그 초기화
                    setWrongTriedInThisScene(false);
                    setAwardedExpThisScene(false);
                  }}
                >
                  다시 도전
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
