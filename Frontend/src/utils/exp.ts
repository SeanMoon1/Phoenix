// 시나리오 UI와 무관한 순수 로직
export function getEXPForNextLevel(level: number) {
  return level * 100;
}

// 레벨업 당 보너스 EXP
export const LEVEL_UP_BONUS = 20;

export function getLevelUpBonus(_nextLevel: number) {
  // 향후 레벨별 보너스를 달리 주고 싶으면 여기서 분기
  return LEVEL_UP_BONUS;
}

export function animateValue(opts: {
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
