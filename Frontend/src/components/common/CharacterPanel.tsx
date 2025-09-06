import phoenixImg from '@/assets/images/phoenix.png';

type Props = {
  level: number;
  expDisplay: number;
  neededExp: number;
  progressPct: number;
  highlight?: boolean; // 레벨업 순간 하이라이트
};

export default function CharacterPanel({
  level,
  expDisplay,
  neededExp,
  progressPct,
  highlight = false,
}: Props) {
  return (
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
          <h2 className="text-lg font-semibold">플레이어 이름</h2>
          <span
            className={`text-2xl font-bold inline-flex items-center px-2 rounded-lg transition-shadow
              ${
                highlight
                  ? 'ring-2 ring-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.6)] animate-pulse'
                  : ''
              }`}
          >
            Lv.{level}
          </span>
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
            EXP {Math.round(expDisplay)} / {neededExp} ({progressPct}%)
          </p>
        </div>
      </div>
    </aside>
  );
}
