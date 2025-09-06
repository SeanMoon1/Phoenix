type Props = { text: string; tone: 'good' | 'ok' | 'bad' };

export default function FeedbackBanner({ text, tone }: Props) {
  const bg =
    tone === 'good'
      ? 'bg-emerald-500 dark:bg-emerald-600'
      : tone === 'ok'
      ? 'bg-amber-500 dark:bg-amber-600'
      : 'bg-rose-600 dark:bg-rose-700';

  return (
    <div
      className={`rounded-2xl shadow-md px-5 py-4 mb-6 text-white ${bg}`}
      role="status"
      aria-live="polite"
    >
      <p className="text-base md:text-lg font-medium text-center">{text}</p>
    </div>
  );
}
