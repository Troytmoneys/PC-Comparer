export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <p className="text-xs font-black uppercase tracking-wide text-ember">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
        {description}
      </p>
    </section>
  );
}
