import type { ScenarioOption } from '@/types/scenario';

type Props = {
  options: ScenarioOption[];
  selected?: ScenarioOption | null;
  onSelect: (opt: ScenarioOption) => void;
};

export default function OptionsList({ options, selected, onSelect }: Props) {
  return (
    <section className="flex flex-col gap-3 mb-6">
      {options.map(opt => {
        const isSelected = selected?.answerId === opt.answerId;
        return (
          <button
            key={opt.answerId}
            className={`w-full rounded-xl px-6 py-4 text-lg shadow-md transition
              ${isSelected ? 'ring-2 ring-amber-400' : ''}
              bg-rose-500 hover:bg-rose-400 text-white
              dark:bg-rose-600 dark:hover:bg-rose-500`}
            onClick={() => onSelect(opt)}
          >
            {opt.answer}
          </button>
        );
      })}
    </section>
  );
}
