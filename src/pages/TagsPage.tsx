import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { getAllTags } from "@/content/posts";

export default function TagsPage() {
  const tags = getAllTags();
  const max = Math.max(1, ...tags.map((t) => t.count));

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        kicker="INDEX · 关键词索引"
        title="标签云"
        description="散落在文章里的关键词。越大越常出现 — 也大概就是我最近在想的事。"
      />

      <div className="mt-16 flex flex-wrap items-baseline gap-x-6 gap-y-4 border-y-[3px] border-double border-rule py-10">
        {tags.map((t) => {
          const ratio = t.count / max;
          const size = 16 + ratio * 28;
          return (
            <Link
              key={t.name}
              to={`/tags/${encodeURIComponent(t.name)}`}
              className="group inline-flex items-baseline gap-1 text-ink-body transition-colors hover:text-stamp"
            >
              <span
                className="font-display font-semibold leading-tight"
                style={{ fontSize: `${size}px` }}
              >
                {t.name}
              </span>
              <span className="font-ui text-[12px] font-medium uppercase text-ink-faded">
                {t.count}
              </span>
            </Link>
          );
        })}
        {tags.length === 0 && (
          <p className="font-serif italic text-ink-muted">还没有任何标签。</p>
        )}
      </div>
    </div>
  );
}
