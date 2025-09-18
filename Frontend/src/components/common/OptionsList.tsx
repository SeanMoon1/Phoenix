import type { ChoiceOption } from '@/types';

type Props = {
  options: ChoiceOption[];
  selected?: ChoiceOption | null;
  onSelect: (opt: ChoiceOption) => void;
  disabled?: boolean;
};

export default function OptionsList({
  options,
  selected,
  onSelect,
  disabled = false,
}: Props) {
  return (
    <section className="flex flex-col gap-3 mb-6">
      {options.map((opt, idx) => {
        // key는 가능하면 고유 id를 쓰고, 없으면 인덱스 포함한 안전한 키 사용
        const key = opt.id ?? `${opt.choiceCode ?? opt.choiceText}_${idx}`;

        // 선택 판별: id 우선, 없으면 choiceCode/choiceText 비교
        const isSelected = (() => {
          if (!selected) return false;
          if (selected.id !== undefined && opt.id !== undefined)
            return selected.id === opt.id;
          if (selected.choiceCode && opt.choiceCode)
            return selected.choiceCode === opt.choiceCode;
          return selected.choiceText === opt.choiceText;
        })();

        return (
          <button
            key={key}
            className={`w-full rounded-xl px-6 py-4 text-lg shadow-md transition
              ${isSelected ? 'ring-2 ring-amber-400' : ''}
              bg-rose-500 hover:bg-rose-400 text-white dark:bg-rose-600 dark:hover:bg-rose-500
              ${disabled ? 'cursor-default' : 'cursor-pointer'}
            `}
            onClick={() => !disabled && onSelect(opt)}
          >
            {opt.choiceText}
          </button>
        );
      })}
    </section>
  );
}
