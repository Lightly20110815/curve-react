/**
 * 花圃索引 — 栏目与全部标签。
 */
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { posts, getAllCategories, getAllTags } from "@/content/posts";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf } from "@/lib/as-of";
import { hanNumber } from "@/lib/han-date";

export default function TagsPage() {
  const { asOf } = useAsOf();
  const visiblePosts = filterByAsOf(posts, asOf);
  const categories = getAllCategories(visiblePosts);
  const tags = getAllTags(visiblePosts);

  return (
    <div>
      <PageHeader title="花圃" note="园子分成几块地，每块地里插着不同的标签。" />
      <div className="mx-auto max-w-5xl space-y-14 px-5 md:px-8">
        <section>
          <h2 className="mb-5 text-[15px] font-bold tracking-wide text-mist">几块地</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.name}
                to={`/categories/${encodeURIComponent(c.name)}`}
                className="group rounded-2xl border border-line bg-surface/60 p-5 transition-[border-color,background-color] duration-300 hover:border-firefly/40 hover:bg-surface"
              >
                <p className="text-[18px] text-ink-strong transition-colors group-hover:text-firefly">
                  {c.name}
                </p>
                <p className="mt-2 font-mono text-[11.5px] tracking-wider text-mist">
                  收着 {hanNumber(c.count)} 篇
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-[15px] font-bold tracking-wide text-mist">全部标签</h2>
          <div className="flex flex-wrap gap-2.5">
            {tags.map((t) => (
              <Link
                key={t.name}
                to={`/tags/${encodeURIComponent(t.name)}`}
                className="pressable rounded-full border border-line px-4 py-1.5 text-[14px] text-mist transition-colors duration-200 hover:border-firefly/50 hover:text-firefly"
              >
                {t.name} · {t.count}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
