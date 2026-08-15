export function PageHeader({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.32em] text-os-dim">// {eyebrow}</div>
        <h1 className="text-[25px] font-bold uppercase tracking-[0.06em] text-os-text">{title}</h1>
      </div>
      {aside}
    </header>
  );
}
