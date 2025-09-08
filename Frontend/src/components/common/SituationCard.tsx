type Props = { title: string; content: string; sceneScript: string };

export default function SituationCard({ title, content, sceneScript }: Props) {
  return (
    <>
      <section className="bg-white/80 dark:bg-black/40 rounded-2xl shadow-md p-4 mb-4">
        <h1 className="text-2xl font-bold text-center">{title}</h1>
      </section>

      <section className="bg-white/90 dark:bg-black/40 rounded-2xl shadow-md p-5 md:p-6 mb-6 leading-relaxed">
        <p className="text-lg mb-3">
          <strong>상황:</strong> {content}
        </p>
        <p className="text-base opacity-90">{sceneScript}</p>
      </section>
    </>
  );
}
