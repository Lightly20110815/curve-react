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
 * 修复版 PostCard (已剔除伪编辑语、标签匹配金句与机械二元对比)
 *
 * 核心整改：
 * 1. 彻底删除 `getLeadEditorNote`（字典匹配伪编辑语）与「读前一眼」栏目；
 * 2. 彻底删除 `getLeadWhisper`（"有些文字会在今天失控" 等假深沉鸡汤）；
 * 3. 头条回归报刊头版的纯粹性：栏目、大字 headline、导语段、署名与阅读时间。
 */
export function PostCard({ post, variant = "default", className }: PostCardProps) {
  const section = post.categories[0] ?? "随笔";

  if (variant === "lead") {
    return (
      <article
        className={cn(
          "group relative isolate border-b border-rule-soft/40 pb-6 md:pb-8",
          className,
        )}
      >
        <Link to={`/posts/${post.slug}`} className="absolute inset-0 z-10" aria-label={post.title} />
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 font-ui text-[12px] font-medium">
            <span className="font-semibold text-stamp">{section}</span>
            <span className="text-ink-muted">· {formatArticleDateline(post.date)}</span>
          </div>

          <h2 className="mt-3.5 font-display text-[clamp(28px,5.2vw,48px)] font-bold leading-[1.18] text-balance text-ink-strong transition-colors group-hover:text-stamp">
            {post.title}
          </h2>

          {post.description && (
            <p className="mt-4 max-w-3xl font-serif text-[18px] leading-[1.8] text-ink-strong/90 md:text-[20px]">
              {post.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-[12.5px] text-ink-muted">
            <span>
              文 / <strong className="font-semibold text-ink-strong">{post.author}</strong>
            </span>
            <span>·</span>
            <span>约 {post.readingMinutes} 分钟</span>
            <span>·</span>
            <span>{post.wordCount} 字</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("group", className)}>
        <Link to={`/posts/${post.slug}`} className="block py-3.5">
          <div className="grid gap-1.5 md:grid-cols-[116px_minmax(0,1fr)_72px] md:items-baseline md:gap-4">
            <p className="font-mono text-[11px] tracking-[0.08em] text-ink-muted">
              {formatArticleDateline(post.date)}
            </p>
            <p className="font-display text-[19px] font-semibold leading-[1.4] text-ink-strong transition-colors group-hover:text-stamp">
              {post.title}
            </p>
            <p className="font-ui text-[11.5px] font-medium text-ink-muted transition-colors group-hover:text-stamp md:justify-self-end">
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
      <div className="flex items-center justify-between border-b border-rule pb-2">
        <span className="font-ui text-[12px] font-semibold text-stamp">
          {section}
        </span>
        <span className="font-ui text-[11.5px] text-ink-muted">
          {formatArticleDateline(post.date)}
        </span>
      </div>
      <h3 className="mt-3.5 font-display text-[21px] font-bold leading-[1.32] text-balance text-ink-strong transition-colors group-hover:text-stamp">
        {post.title}
      </h3>
      {post.description && (
        <p className="mt-2.5 line-clamp-3 font-serif text-[15px] leading-[1.78] text-ink-body">
          {post.description}
        </p>
      )}
      <p className="mt-4 font-ui text-[11.5px] font-medium text-ink-muted">
        约 {post.readingMinutes} 分钟 ·{" "}
        <span className="border-b border-ink/40 pb-px text-ink transition-colors group-hover:border-stamp group-hover:text-stamp">
          阅读全文 →
        </span>
      </p>
    </article>
  );
}
