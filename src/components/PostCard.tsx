import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
          "group relative isolate border-y-[3px] border-rule py-8 md:py-10",
          className,
        )}
      >
        <Link to={`/posts/${post.slug}`} className="absolute inset-0 z-10" aria-label={post.title} />
        <div className="grid gap-8 md:grid-cols-[2.2fr_1fr] md:gap-12">
          <div>
            <div className="flex flex-wrap items-center gap-3 font-ui text-[12px] font-medium">
              <span className="bg-stamp px-2 py-0.5 font-semibold uppercase text-paper">
                LEAD STORY
              </span>
              <span className="text-stamp">{section}</span>
              <span className="text-ink-muted">{formatArticleDateline(post.date)}</span>
            </div>
            <h2 className="mt-5 font-display text-[clamp(36px,5.5vw,62px)] font-bold leading-[1.15] text-balance text-ink-strong transition-colors group-hover:text-stamp">
              {post.title}
            </h2>
            {post.description && (
              <p className="mt-5 max-w-2xl font-serif text-[18px] leading-[1.8] text-ink-body">
                {post.description}
              </p>
            )}
            <p className="mt-6 font-ui text-[12px] font-medium uppercase text-ink-muted">
              <span>by</span>{" "}
              <span className="font-semibold text-ink">{post.author}</span>
              <span className="mx-2 text-ink-muted">·</span>
              <span>约 {post.readingMinutes} 分钟 · {post.wordCount} 字</span>
            </p>
          </div>
          <aside className="hidden border-l border-rule pl-8 md:block">
            <p className="font-ui text-[12px] font-semibold uppercase text-ink-muted">
              In brief
            </p>
            <p className="mt-3 font-serif text-[17px] leading-[1.75] text-ink-body">
              {post.description || post.title}
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="default" size="sm">#{t}</Badge>
              ))}
            </div>
            <p className="mt-6 inline-block border-b-2 border-ink pb-0.5 font-ui text-[12px] font-semibold uppercase text-ink">
              Read full story →
            </p>
          </aside>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("group", className)}>
        <Link to={`/posts/${post.slug}`} className="block py-3">
          <div className="flex items-baseline gap-3">
            <span className="hidden font-ui text-[12px] font-medium uppercase text-ink-muted md:inline">
              {formatArticleDateline(post.date)}
            </span>
            <span className="flex-1 font-display text-[18px] leading-[1.35] text-ink-strong transition-colors group-hover:text-stamp">
              {post.title}
            </span>
            <span className="font-ui text-[12px] font-medium uppercase text-ink-muted">
              {section}
            </span>
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
      <h3 className="mt-4 font-display text-[25px] font-bold leading-[1.25] text-balance text-ink-strong transition-colors group-hover:text-stamp">
        {post.title}
      </h3>
      {post.description && (
        <p className="mt-3 line-clamp-3 font-serif text-[16px] leading-[1.75] text-ink-body">
          {post.description}
        </p>
      )}
      <p className="mt-4 font-ui text-[12px] font-medium uppercase text-ink-muted">
        约 {post.readingMinutes} 分钟 ·{" "}
        <span className="border-b border-ink pb-px text-ink transition-colors group-hover:border-stamp group-hover:text-stamp">
          Read →
        </span>
      </p>
    </article>
  );
}
