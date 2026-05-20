import { Pin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Kicker, Ornament } from "@/components/editorial";
import { notes } from "@/content/notes";
import { formatArticleDateline } from "@/lib/han-date";

export default function NotesPage() {
  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        kicker="OPINION · 随笔"
        title="编者的便签本"
        description="没想清楚的、即时的、碎碎念。不打磨，不归类，写完就贴。"
      />

      <ol className="mx-auto mt-12 max-w-2xl space-y-12">
        {notes.map((n, i) => (
          <li key={n.slug}>
            <article className="relative">
              {n.top && (
                <Pin
                  className="absolute -left-7 top-2 h-3.5 w-3.5 text-stamp"
                  aria-label="置顶"
                />
              )}
              <div className="flex items-baseline justify-between border-b-2 border-rule pb-2">
                <div className="flex items-center gap-2">
                  <Kicker variant="stamp">№ {String(i + 1).padStart(2, "0")}</Kicker>
                  {n.mood && (
                    <span className="text-[18px] leading-none" aria-hidden>
                      {n.mood}
                    </span>
                  )}
                </div>
                <time className="font-ui text-[12px] font-medium uppercase text-ink-muted">
                  {formatArticleDateline(n.date)}
                </time>
              </div>
              <h2 className="mt-4 font-display text-[30px] font-bold leading-[1.25] text-ink-strong">
                {n.title}
              </h2>
              <div
                className="prose-news mt-4 text-[17px]"
                dangerouslySetInnerHTML={{ __html: n.html }}
              />
              {n.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {n.tags.map((t) => (
                    <Badge key={t} variant="soft" size="sm">
                      #{t}
                    </Badge>
                  ))}
                </div>
              )}
            </article>
            {i < notes.length - 1 && <Ornament className="mt-12" />}
          </li>
        ))}
        {notes.length === 0 && (
          <p className="text-center font-serif italic text-ink-muted">还没写过随笔。</p>
        )}
      </ol>
    </div>
  );
}
