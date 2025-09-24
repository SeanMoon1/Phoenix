import { forwardRef } from 'react';

type Props = { title: string; content: string; sceneScript: string };

const SituationCard = forwardRef<HTMLElement, Props>(
  ({ title, content, sceneScript }, ref) => {
    return (
      <>
        <section className="p-4 mb-4 shadow-md bg-white/80 dark:bg-black/40 rounded-2xl">
          <h1 className="text-2xl font-bold text-center">{title}</h1>
        </section>

        <section
          ref={ref}
          className="p-5 mb-6 leading-relaxed shadow-md bg-white/90 dark:bg-black/40 rounded-2xl md:p-6"
        >
          <p className="mb-3 text-lg leading-loose whitespace-pre-line">
            {content}
          </p>
          <p className="text-base opacity-90">{sceneScript}</p>
        </section>
      </>
    );
  }
);

SituationCard.displayName = 'SituationCard';

export default SituationCard;
