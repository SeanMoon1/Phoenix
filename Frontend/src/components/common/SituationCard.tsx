import React from 'react';

type Props = { title: string; content: string; sceneScript: string };

const SituationCard = React.forwardRef<HTMLElement, Props>(
  ({ title, content, sceneScript }, ref) => {
    const paragraphs = (content ?? '').trim().split(/\n{2,}/);

    return (
      <>
        <section
          ref={ref}
          className="bg-white/80 dark:bg-black/40 rounded-2xl shadow-md p-4 mb-4"
        >
          <h1 id="scene-title" className="text-2xl font-bold text-center">
            {title}
          </h1>
        </section>

        <section className="bg-white/90 dark:bg-black/40 rounded-2xl shadow-md p-5 md:p-6 mb-6 leading-relaxed">
          <div className="max-w-[70ch]">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-lg mb-3 whitespace-pre-line leading-loose [text-wrap:pretty]"
              >
                {p}
              </p>
            ))}
          </div>

          <p className="text-base opacity-90 mt-4">{sceneScript}</p>
        </section>
      </>
    );
  }
);

export default SituationCard;
