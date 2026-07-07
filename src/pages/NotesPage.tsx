/**
 * 随笔 — 苗圃。碎片、草稿、深夜写下的一两句。
 */
import { Plant } from "@phosphor-icons/react";
import { PageHeader } from "@/components/PageHeader";
import { TwikooComments } from "@/components/TwikooComments";
import { notes } from "@/content/notes";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf } from "@/lib/as-of";
import { formatDotDate } from "@/lib/han-date";

export default function NotesPage() {
  const { asOf } = useAsOf();
  const visibleNotes = filterByAsOf(notes, asOf);

  return (
    <div>
      <PageHeader
        title="随笔"
        note="苗圃。还没长成文章的碎片，想到什么就随手插一株。"
      />
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="space-y-10">
          {visibleNotes.map((note) => (
            <article
              key={note.slug}
              className="rounded-2xl border border-line bg-surface/60 p-6 md:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[19px] leading-relaxed text-ink-strong">
                  {note.mood ? `${note.mood} ` : ""}
                  {note.title}
                </h2>
                <Plant size={18} weight="light" className="mt-1.5 shrink-0 text-firefly" aria-hidden />
              </div>
              <p className="mt-2 font-mono text-[11px] tracking-wider text-mist">
                {formatDotDate(note.date)}
                {note.top ? " · 置顶" : ""}
              </p>
              <div
                className="prose mt-5 !text-[15.5px]"
                dangerouslySetInnerHTML={{ __html: note.html }}
              />
            </article>
          ))}
          {visibleNotes.length === 0 && (
            <p className="text-[15px] text-mist">苗圃暂时是空的。</p>
          )}
        </div>

        <TwikooComments pageKey="/notes" variant="article" />
        <div className="pb-8" />
      </div>
    </div>
  );
}
