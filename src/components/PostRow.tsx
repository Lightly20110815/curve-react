/**
 * 文章行 — 列表里的一株植物。
 * 不用卡片；留白 + 极软的分隔线 + 生长标记。
 */
import { Link } from "react-router-dom";
import { GrowthGlyph } from "@/components/GrowthGlyph";
import { growthForWordCount } from "@/lib/growth";
import { formatDotDate } from "@/lib/han-date";
import type { Post } from "@/content/posts";
import { cn } from "@/lib/utils";

export function PostRow({
  post,
  compact = false,
  className,
}: {
  post: Post;
  compact?: boolean;
  className?: string;
}) {
  const growth = growthForWordCount(post.wordCount);

  return (
    <article className={cn("group", className)}>
      <Link to={`/posts/${post.slug}`} className="flex gap-4 py-5">
        <GrowthGlyph
          wordCount={post.wordCount}
          className="mt-1.5 shrink-0 opacity-80 transition-opacity group-hover:opacity-100"
        />
        <div className="min-w-0">
          <h3
            className={cn(
              "text-ink-strong transition-colors duration-200 group-hover:text-firefly",
              compact ? "text-[16.5px]" : "text-[18.5px]",
            )}
          >
            {post.title}
          </h3>
          {!compact && post.description && (
            <p className="mt-1.5 line-clamp-2 text-[14.5px] leading-relaxed text-mist">
              {post.description}
            </p>
          )}
          <p className="mt-2 font-mono text-[11px] tracking-wider text-mist">
            {formatDotDate(post.date)} · 约 {post.wordCount} 字 · {growth.label}
          </p>
        </div>
      </Link>
    </article>
  );
}
