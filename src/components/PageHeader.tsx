/**
 * 内页页头 — 安静的标题区，给固定导航留出呼吸。
 */
export function PageHeader({ title, note }: { title: string; note?: string }) {
  return (
    <header className="rise-in mx-auto max-w-5xl px-5 pb-10 pt-28 md:px-8 md:pt-32">
      <h1 className="text-[30px] font-bold leading-snug text-ink-strong md:text-[36px]">
        {title}
      </h1>
      {note && <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-mist">{note}</p>}
    </header>
  );
}
