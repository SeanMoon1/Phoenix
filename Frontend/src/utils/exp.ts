// 시나리오 UI와 무관한 순수 로직
export function getEXPForNextLevel(level: number) {
  return level * 100;
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
