import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Kicker } from "@/components/Editorial";
import { Pagination } from "@/components/Pagination";
import { usePageParam } from "@/hooks/usePageParam";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf } from "@/lib/as-of";
import { formatArticleDateline, hanDigits } from "@/lib/han-date";
import { getArchives, posts } from "@/content/posts";

function toAsOfParam(iso: string): string {
  return iso.slice(0, 10);
}

export default function ArchivesPage() {
  const { asOf } = useAsOf();
  const visiblePosts = filterByAsOf(posts, asOf);
  const archives = getArchives(visiblePosts);
  const total = visiblePosts.length;
  // Paginate by year — each "page" is one volume (calendar year)
  const [page, setPage] = usePageParam(archives.length || 1);
  const group = archives[page - 1];
  const volumeAsOfTarget = group?.posts[0]?.date;

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
          {volumeAsOfTarget ? (
            <p className="mt-3 flex flex-wrap items-center gap-3 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              <Link
                to={`/?as-of=${toAsOfParam(volumeAsOfTarget)}`}
                className="inline-flex items-center gap-1.5 border border-rule-soft/45 bg-paper/70 px-2.5 py-1 text-stamp transition-colors hover:bg-stamp hover:text-paper"
              >
                <Clock className="h-3 w-3" />
                以本卷末日的版本翻阅
              </Link>
              <span className="font-serif text-[12px] normal-case tracking-normal text-ink-faded">
                时间机器会把首页与各栏目都倒回那一天。
              </span>
            </p>
          ) : null}
          <ol>
            {group.posts.map((p, idx) => (
              <li
                key={p.slug}
                className="group grid grid-cols-[40px_80px_1fr_auto] items-baseline gap-4 border-b border-rule-soft/30 py-4 transition-colors hover:bg-paper-warm/40"
              >
                <span className="font-ui text-[12px] font-medium uppercase text-ink-faded">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-0.5">
                  <time className="font-ui text-[12px] font-medium uppercase text-ink-muted">
                    {formatArticleDateline(p.date)}
                  </time>
                  <Link
                    to={`/?as-of=${toAsOfParam(p.date)}`}
                    className="font-ui text-[10px] font-medium uppercase tracking-[0.12em] text-stamp opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  >
                    以那天翻阅 →
                  </Link>
                </div>
                <Link
                  to={`/posts/${p.slug}`}
                  className="font-display text-[22px] font-semibold leading-[1.35] text-ink-strong transition-colors hover:text-stamp"
                >
                  {p.title}
                </Link>
                {p.categories[0] && (
                  <Link
                    to={`/categories/${encodeURIComponent(p.categories[0])}`}
                    className="hidden font-ui text-[12px] font-semibold uppercase text-stamp transition-colors hover:text-ink md:inline"
                  >
                    {p.categories[0]}
                  </Link>
                )}
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
