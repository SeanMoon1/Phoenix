import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import phoenixImg from '@/assets/images/phoenix.png';
import magicianImg from '@/assets/images/magician.png';
import level2Img from '@/assets/images/level2.png';
import level3Img from '@/assets/images/level3.png';
import level4Img from '@/assets/images/level4.png';
import level5Img from '@/assets/images/level5.png';
import { useAuthStore } from '@/stores/authStore';

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

  // auth for admin check
  const { user } = useAuthStore();
  const isAdminUser = useMemo(() => {
    if (!user) return false;
    if ((user as any).isAdmin === true) return true;
    if ((user as any).is_admin === true) return true;
    if ((user as any).user_type === 'ADMIN') return true;
    if ((user as any).admin_level) return true;
    const role = (user as any).role ?? '';
    return typeof role === 'string' && role.toLowerCase() === 'admin';
  }, [user]);

  // effectiveLevel: prop > store fallback
  const effectiveLevel = useMemo(() => {
    const lvFromProp = typeof level === 'number' ? level : Number(level || 0);
    const lvFromUser = (user as any)?.level ? Number((user as any).level) : 0;
    return lvFromProp > 0 ? lvFromProp : lvFromUser > 0 ? lvFromUser : 1;
  }, [level, user]);

  // 모바일 블록에서 사용할 아바타 결정(오로지 level 우선). level prop이 숫자인지 보장.
  const avatarSrc = useMemo(() => {
    const lv =
      typeof effectiveLevel === 'number'
        ? effectiveLevel
        : Number(effectiveLevel || 0);
    if (lv >= 5) return level5Img;
    if (lv >= 4) return level4Img;
    if (lv >= 3) return level3Img;
    if (lv >= 2) return level2Img;
    // 레벨1(또는 0)일 경우에는 admin 여부로 대체 이미지 사용
    return isAdminUser ? magicianImg : phoenixImg;
  }, [effectiveLevel, isAdminUser]);

  // 디버그 로그(배포 전 제거)
  // 확인: 모바일에서 level이 무엇으로 들어오는지, avatarSrc가 어떤 파일로 결정되는지 확인
  // eslint-disable-next-line no-console
  console.log(
    '[ProgressBar] level=',
    level,
    'isAdmin=',
    isAdminUser,
    'avatar=',
    avatarSrc
  );

  // 중복 제거: 모바일용 캐릭터+EXP 블록 렌더러
  const MobileExpBlock = ({
    pct,
    displayPct,
    anim,
  }: {
    pct: number;
    displayPct?: number;
    anim?: boolean;
  }) => (
    <div className="mt-4 grid grid-cols-1 gap-4">
      <div className="bg-white/90 dark:bg-black/40 rounded-2xl shadow p-4">
        <img src={avatarSrc} alt="Mascot" className="h-24 w-auto mx-auto" />
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
                    : `transition-[width] duration-${anim ? '700' : '500'}`)
                }
                style={{ width: hideExpFill ? 0 : `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-xs opacity-80">
              EXP {Math.round(expDisplay)} / {neededExp} (
              {displayPct ?? Math.round(pct)}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="p-4 mb-4 shadow-md bg-white/80 dark:bg-black/40 rounded-2xl">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">진행</h2>
        <span className="text-2xl font-bold">
          {currentIndex + 1} / {total}
        </span>
      </div>
      <div className="w-full h-3 mt-3 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
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
                  {/* 모달에서는 애니메이션용 animatePct 사용 */}
                  <MobileExpBlock
                    pct={animatePct}
                    displayPct={Math.round(animatePct)}
                    anim
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      className="px-4 py-2 text-white rounded-lg bg-emerald-500"
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
      {!mobilePanelModalOpen && !isMobile ? null : null}
    </section>
  );
}
