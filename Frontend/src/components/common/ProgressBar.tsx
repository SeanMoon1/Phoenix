import phoenixImg from '@/assets/images/phoenix.png';

type Props = {
  currentIndex: number;
  total: number;
  level: number;
  progressPct: number;
  expDisplay: number;
  neededExp: number;
};

export default function ProgressBar({
  currentIndex,
  total,
  level,
  progressPct,
  expDisplay,
  neededExp,
}: Props) {
  const percentAll = Math.round(((currentIndex + 1) / total) * 100);

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

      {/* 모바일 전용 캐릭터 + 레벨 */}
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
                EXP {Math.round(expDisplay)} / {neededExp} ({progressPct}%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
