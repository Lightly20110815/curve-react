/**
 * 文字 — 全部文章，按年轮分层。
 */
import { PageHeader } from "@/components/PageHeader";
import { PostRow } from "@/components/PostRow";
import { posts, getArchives } from "@/content/posts";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf } from "@/lib/as-of";
import { hanDigits, hanNumber } from "@/lib/han-date";

export default function ArchivesPage() {
  const { asOf } = useAsOf();
  const visiblePosts = filterByAsOf(posts, asOf);
  const archives = getArchives(visiblePosts);

  return (
    <div>
      <PageHeader
        title="文字"
        note={`一圈一圈的年轮。到目前为止，园子里种下了 ${visiblePosts.length} 篇。`}
      />
      <div className="mx-auto max-w-5xl space-y-14 px-5 md:px-8">
        {archives.map(({ year, posts: yearPosts }) => (
          <section key={year} className="md:grid md:grid-cols-[140px_1fr] md:gap-10">
            <div className="mb-4 md:mb-0">
              <p className="text-[22px] font-bold text-ink-strong">{hanDigits(Number(year))}</p>
              <p className="mt-1 font-mono text-[11.5px] tracking-wider text-mist">
                {hanNumber(yearPosts.length)} 篇
              </p>
            </div>
            <div className="divide-y divide-line border-t border-line md:border-t-0">
              {yearPosts.map((p) => (
                <PostRow key={p.slug} post={p} compact />
              ))}
            </div>
          </section>
        ))}
        {archives.length === 0 && (
          <p className="text-[15px] text-mist">这一天之前，园子里还什么都没有。</p>
        )}
      </div>
    </div>
  );
}
