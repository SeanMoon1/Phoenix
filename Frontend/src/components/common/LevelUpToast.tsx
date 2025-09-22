import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  bonus: number;
  level: number;
};

export default function LevelUpToast({ bonus, level }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none">
      <div
        className="px-5 py-3 rounded-2xl bg-amber-500 text-white shadow-xl animate-bounce select-none pointer-events-auto"
        role="status"
        aria-live="assertive"
      >
        <strong className="font-bold mr-2">LEVEL UP!</strong>
        Lv.{level} 도달 · +{bonus} EXP
      </div>
    </div>,
    document.body
  );
}
