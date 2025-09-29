// src/components/common/CharacterPanel.tsx
import phoenixImg from '@/assets/images/phoenix.png';
import magicianImg from '@/assets/images/magician.png';
import level2Img from '@/assets/images/level2.png';
import level3Img from '@/assets/images/level3.png';
import level4Img from '@/assets/images/level4.png';
import level5Img from '@/assets/images/level5.png';
import { useAuthStore } from '@/stores/authStore';

type Props = {
  level: number;
  expDisplay: number;
  neededExp: number;
  progressPct: number;
  highlight?: boolean;
  hideExpFill?: boolean;
  playerName?: string;
};

export default function CharacterPanel({
  level,
  expDisplay,
  neededExp,
  progressPct,
  highlight = false,
  hideExpFill = false,
  playerName = '플레이어 이름',
}: Props) {
  const { user } = useAuthStore();
  // 관리자 플래그 안전 체크
  const isAdminUser = (() => {
    if (!user) return false;
    if ((user as any).isAdmin === true) return true;
    if ((user as any).is_admin === true) return true;
    if ((user as any).user_type === 'ADMIN') return true;
    if ((user as any).admin_level) return true;
    const role = (user as any).role ?? '';
    if (typeof role === 'string' && role.toLowerCase() === 'admin') return true;
    return false;
  })();

  // 레벨 우선 이미지 매핑: 높은 레벨 우선 적용
  let avatarSrc = phoenixImg;
  if (level >= 5) avatarSrc = level5Img;
  else if (level >= 4) avatarSrc = level4Img;
  else if (level >= 3) avatarSrc = level3Img;
  else if (level >= 2) avatarSrc = level2Img;
  else avatarSrc = isAdminUser ? magicianImg : phoenixImg;

  return (
    <aside className="hidden md:flex md:flex-col md:gap-4">
      <div className="bg-white/80 dark:bg-black/40 rounded-2xl shadow-md p-4">
        <img
          src={avatarSrc}
          alt="Mascot"
          className="w-full max-w-[240px] object-contain"
        />
      </div>

      <div className="bg-white/90 dark:bg-black/40 rounded-2xl shadow-md p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">{playerName}</h2>
          <span
            className={`text-2xl font-bold inline-flex items-center px-2 rounded-lg transition-shadow ${
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
              className={
                'h-full bg-emerald-500 dark:bg-emerald-400 ' +
                (hideExpFill
                  ? 'opacity-0 w-0 transition-none'
                  : 'transition-[width] duration-500')
              }
              style={{ width: hideExpFill ? 0 : `${progressPct}%` }}
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
