import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Kicker } from "@/components/Editorial";
import { Pagination } from "@/components/Pagination";
import { usePageParam } from "@/hooks/usePageParam";
import { formatArticleDateline, hanDigits } from "@/lib/han-date";
import { getArchives } from "@/content/posts";

export default function ArchivesPage() {
  const archives = getArchives();
  const total = archives.reduce((s, g) => s + g.posts.length, 0);
  // Paginate by year — each "page" is one volume (calendar year)
  const [page, setPage] = usePageParam(archives.length || 1);
  const group = archives[page - 1];

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        kicker="ARCHIVES · 完整存档"
        title="过往各卷"
        description={`共 ${total} 篇，分 ${archives.length} 卷。一卷一年，按时间倒序排列。`}
      />

      {group ? (
        <section className="mt-12">
          <header className="flex items-baseline justify-between border-b-[3px] border-rule pb-3">
            <h2 className="font-masthead text-[clamp(40px,5vw,64px)] font-black leading-none text-ink-strong">
              {hanDigits(Number(group.year))}
              <span className="ml-2 font-display text-[20px] italic font-normal text-stamp">
                {group.year}
              </span>
            </h2>
            <Kicker>
              {group.posts.length} 篇 · Volume {archives.length - (page - 1)} of {archives.length}
            </Kicker>
          </header>
          <ol>
            {group.posts.map((p, idx) => (
              <li key={p.slug}>
                <Link
                  to={`/posts/${p.slug}`}
                  className="group grid grid-cols-[40px_80px_1fr_auto] items-baseline gap-4 border-b border-rule-soft/30 py-4 transition-colors hover:bg-paper-warm/40"
                >
                  <span className="font-ui text-[12px] font-medium uppercase text-ink-faded">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <time className="font-ui text-[12px] font-medium uppercase text-ink-muted">
                    {formatArticleDateline(p.date)}
                  </time>
                  <span className="font-display text-[22px] font-semibold leading-[1.35] text-ink-strong transition-colors group-hover:text-stamp">
                    {p.title}
                  </span>
                  {p.categories[0] && (
                    <span className="hidden font-ui text-[12px] font-semibold uppercase text-stamp md:inline">
                      {p.categories[0]}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <p className="mt-12 text-center font-serif italic text-ink-muted">本报尚无往期。</p>
      )}

      <Pagination
        page={page}
        totalPages={archives.length}
        onChange={setPage}
        unitLabel="卷"
      />
    </div>
  );
}
