import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import phoenixImg from '@/assets/images/phoenix.png';

type Props = {
  currentIndex: number;
  total: number;
  level: number;
  progressPct: number; // EXP 진행도(모바일표시)
  expDisplay: number; // EXP 수치(모바일표시)
  neededExp: number; // 다음 레벨 필요치(모바일표시)
  hideExpFill?: boolean; // 레벨업 리셋 연출 시 초록바 잠깐 숨김
  // ScenarioPage가 트리거해서 모달로 띄울지 제어
  mobilePanelModalOpen?: boolean;
  onCloseMobilePanel?: () => void;
};

export default function ProgressBar({
  currentIndex,
  total,
  level,
  progressPct,
  expDisplay,
  neededExp,
  hideExpFill = false,
  mobilePanelModalOpen = false,
  onCloseMobilePanel,
}: Props) {
  const percentAll = Math.round(((currentIndex + 1) / total) * 100);

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 767 : false
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // modal 애니메이션용 상태: 모달이 열릴 때 0%에서 목표(progressPct)로 애니메이션
  const [animatePct, setAnimatePct] = useState<number>(0);
  useEffect(() => {
    if (!mobilePanelModalOpen) {
      setAnimatePct(0);
      return;
    }
    // 모달 열릴 때 애니메이션 트리거 (double RAF으로 레이아웃 적용 후 transition 실행)
    let raf1: number | null = null;
    let raf2: number | null = null;
    setAnimatePct(0);
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setAnimatePct(progressPct);
      });
    });
    return () => {
      if (raf1 != null) cancelAnimationFrame(raf1);
      if (raf2 != null) cancelAnimationFrame(raf2);
      setAnimatePct(0);
    };
  }, [mobilePanelModalOpen, progressPct]);

  // 모달 전용 블록 — 인라인 블록(mobileBlock)과 거의 동일하지만 width가 animatePct로 움직임
  const modalMobileBlock = (
    <div className="mt-4 grid grid-cols-1 gap-4">
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
                className={
                  'h-full bg-emerald-500 dark:bg-emerald-400 ' +
                  (hideExpFill
                    ? 'opacity-0 w-0 transition-none'
                    : 'transition-[width] duration-700')
                }
                style={{ width: hideExpFill ? 0 : `${animatePct}%` }}
              />
            </div>
            <p className="mt-1 text-xs opacity-80">
              EXP {Math.round(expDisplay)} / {neededExp} (
              {Math.round(animatePct)}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // modal 애니메이션용 상태: 모달이 열릴 때 0%에서 목표(progressPct)로 애니메이션
  const [animatePct, setAnimatePct] = useState<number>(0);
  useEffect(() => {
    if (!mobilePanelModalOpen) {
      setAnimatePct(0);
      return;
    }
    // 모달 열릴 때 애니메이션 트리거 (double RAF으로 레이아웃 적용 후 transition 실행)
    let raf1: number | null = null;
    let raf2: number | null = null;
    setAnimatePct(0);
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setAnimatePct(progressPct);
      });
    });
    return () => {
      if (raf1 != null) cancelAnimationFrame(raf1);
      if (raf2 != null) cancelAnimationFrame(raf2);
      setAnimatePct(0);
    };
  }, [mobilePanelModalOpen, progressPct]);

  // 모달 전용 블록 — 인라인 블록(mobileBlock)과 거의 동일하지만 width가 animatePct로 움직임
  const modalMobileBlock = (
    <div className="mt-4 grid grid-cols-1 gap-4">
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
                className={
                  'h-full bg-emerald-500 dark:bg-emerald-400 ' +
                  (hideExpFill
                    ? 'opacity-0 w-0 transition-none'
                    : 'transition-[width] duration-700')
                }
                style={{ width: hideExpFill ? 0 : `${animatePct}%` }}
              />
            </div>
            <p className="mt-1 text-xs opacity-80">
              EXP {Math.round(expDisplay)} / {neededExp} (
              {Math.round(animatePct)}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="bg-white/80 dark:bg-black/40 rounded-2xl shadow-md p-4 mb-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">진행</h2>
        <span className="text-2xl font-bold">
          {currentIndex + 1} / {total}
        </span>
      </div>
      <div className="h-3 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-3">
        <div
          className="h-full bg-emerald-500 dark:bg-emerald-400 transition-[width] duration-300"
          style={{ width: `${percentAll}%` }}
        />
      </div>

      {/* 모바일 전용 캐릭터+EXP 블록 */}
      {isMobile && mobilePanelModalOpen
        ? typeof document !== 'undefined' &&
          createPortal(
            <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 pointer-events-auto overflow-hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => onCloseMobilePanel?.()}
              />
              <div className="w-full max-w-lg relative pointer-events-auto">
                <div className="bg-white/90 dark:bg-black/40 rounded-2xl shadow p-4 overflow-hidden">
                  {modalMobileBlock}
                  <div className="flex justify-end mt-4">
                    <button
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
                      onClick={() => onCloseMobilePanel?.()}
                    >
                      확인
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
