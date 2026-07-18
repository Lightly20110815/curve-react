import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Kicker } from "@/components/Editorial";
import { getAllCategories, posts } from "@/content/posts";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf } from "@/lib/as-of";
import { hanNumber } from "@/lib/han-date";

export default function CategoriesPage() {
  const { asOf } = useAsOf();
  const visiblePosts = filterByAsOf(posts, asOf);
  const cats = getAllCategories(visiblePosts);
  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        kicker="SECTIONS · 版块"
        title="按主题分类"
        description="一份目录，把零散的文章按主题归到几个抽屉里。"
      />

      <div className="mt-12 grid bg-paper sm:grid-cols-2 md:grid-cols-3">
        {cats.map((c) => (
          <Link
            key={c.name}
            to={`/categories/${encodeURIComponent(c.name)}`}
            className="group flex items-center justify-between bg-paper p-6 outline outline-1 outline-offset-[-1px] outline-rule transition-colors hover:bg-paper-warm"
          >
            <div>
              <Kicker>Section</Kicker>
              <p className="mt-2 font-display text-[28px] font-bold leading-[1.25] text-ink-strong transition-colors group-hover:text-stamp">
                {c.name}
              </p>
              <p className="mt-1 font-ui text-[12px] font-medium uppercase text-ink-muted">
                {hanNumber(c.count)} 篇 · {c.count} entries
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-ink-muted transition-all group-hover:translate-x-1 group-hover:text-stamp" />
          </Link>
        ))}
        {cats.length === 0 && (
          <p className="col-span-full bg-paper p-12 text-center font-serif italic text-ink-muted">
            还没有任何版块。
          </p>
        )}
      </div>
    </div>
  );
}
