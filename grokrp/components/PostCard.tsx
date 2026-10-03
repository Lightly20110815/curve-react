import { Link } from "react-router-dom";
import { formatArticleDateline } from "@/lib/han-date";
import type { Post } from "@/content/posts";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  variant?: "default" | "lead" | "compact";
  className?: string;
}

/**
 * Newspaper-style article preview.
 *
 * - lead    → front-page lead story: huge serif headline, lede paragraph, byline
 * - default → mid-column article: section kicker, headline, snippet, dateline
 * - compact → text-only headline row (used in "more headlines" lists)
 */
export function PostCard({ post, variant = "default", className }: PostCardProps) {
  const section = post.categories[0] ?? "随笔";

  if (variant === "lead") {
    return (
      <article
        className={cn(
          "group relative isolate border-b border-rule-soft/35 pb-5 md:pb-6",
          className,
        )}
      >
        <Link to={`/posts/${post.slug}`} className="absolute inset-0 z-10" aria-label={post.title} />
        <div>
          <div className="flex flex-wrap items-center gap-3 font-ui text-[13px]">
            <span className="font-semibold text-stamp">{section}</span>
            <span className="text-ink-muted">· {formatArticleDateline(post.date)}</span>
          </div>
          <h2 className="mt-3 font-display text-[clamp(30px,6vw,52px)] font-bold leading-[1.14] text-balance text-ink-strong transition-colors group-hover:text-stamp">
            {post.title}
          </h2>
          {post.description && (
            <p className="mt-3 max-w-3xl font-serif text-[18px] leading-[1.78] text-ink-strong/95 md:text-[20px]">
              {post.description}
            </p>
          )}
          <p className="mt-4 font-ui text-[13px] text-ink-body">
            <span className="text-ink-muted">作者</span>{" "}
            <span className="font-semibold text-ink-strong">{post.author}</span>
            <span className="mx-2 text-ink-muted">·</span>
            <span>约 {post.readingMinutes} 分钟 · {post.wordCount} 字</span>
          </p>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("group", className)}>
        <Link to={`/posts/${post.slug}`} className="block py-4">
          <div className="grid gap-1.5 md:grid-cols-[116px_minmax(0,1fr)_72px] md:items-start md:gap-4">
            <p className="font-mono text-[11px] tracking-[0.12em] text-ink-muted md:pt-1">
              {formatArticleDateline(post.date)}
            </p>
            <p className="font-display text-[20px] leading-[1.38] text-ink-strong transition-colors group-hover:text-stamp">
              {post.title}
            </p>
            <p className="font-ui text-[11px] font-medium tracking-[0.12em] text-ink-muted transition-colors group-hover:text-stamp md:justify-self-end md:pt-1">
              {section}
            </p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className={cn("group relative isolate flex flex-col", className)}>
      <Link to={`/posts/${post.slug}`} className="absolute inset-0 z-10" aria-label={post.title} />
      <div className="flex items-center justify-between border-b-2 border-rule pb-2">
        <span className="font-ui text-[12px] font-semibold uppercase text-stamp">
          {section}
        </span>
        <span className="font-ui text-[12px] font-medium uppercase text-ink-muted">
          {formatArticleDateline(post.date)}
        </span>
      </div>
      <h3 className="mt-4 font-display text-[23px] font-bold leading-[1.3] text-balance text-ink-strong transition-colors group-hover:text-stamp">
        {post.title}
      </h3>
      {post.description && (
        <p className="mt-3 line-clamp-3 font-serif text-[16px] leading-[1.8] text-ink-body/95">
          {post.description}
        </p>
      )}
      <p className="mt-4 font-ui text-[13px] text-ink-muted">
        约 {post.readingMinutes} 分钟 ·{" "}
        <span className="border-b border-ink pb-px text-ink transition-colors group-hover:border-stamp group-hover:text-stamp">
          阅读
        </span>
      </p>
    </article>
  );
}

