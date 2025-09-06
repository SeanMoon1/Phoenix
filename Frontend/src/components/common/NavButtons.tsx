type Props = {
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function NavButtons({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: Props) {
  return (
    <section className="flex items-center justify-between gap-3">
      <button
        className="px-5 py-3 rounded-xl bg-neutral-300 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600 disabled:opacity-50"
        onClick={onPrev}
        disabled={!canGoPrev}
      >
        ← 이전
      </button>

      <button
        className="px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
        onClick={onNext}
        disabled={!canGoNext}
      >
        다음 →
      </button>
    </section>
  );
}
