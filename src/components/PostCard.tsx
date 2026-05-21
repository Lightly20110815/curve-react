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
  const marginNote = post.tags.slice(0, 3).join(" · ") || section;
  const editorNote = getLeadEditorNote(post);
  const leadWhisper = getLeadWhisper(post);

  if (variant === "lead") {
    return (
      <article
        className={cn(
          "group relative isolate border-b border-rule-soft/35 pb-7 md:pb-8",
          className,
        )}
      >
        <Link to={`/posts/${post.slug}`} className="absolute inset-0 z-10" aria-label={post.title} />
        <div className="grid gap-8 md:grid-cols-[minmax(0,2.15fr)_minmax(240px,0.95fr)] md:gap-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 font-ui text-[12px] font-medium">
              <span className="font-semibold text-stamp">{section}</span>
              <span className="text-ink-muted">· {formatArticleDateline(post.date)}</span>
            </div>
            <h2 className="mt-4 font-display text-[clamp(36px,5vw,58px)] font-bold leading-[1.12] text-balance text-ink-strong transition-colors group-hover:text-stamp">
              {post.title}
            </h2>
            {post.description && (
              <p className="mt-4 max-w-3xl font-serif text-[19px] leading-[1.9] text-ink-strong/95 md:text-[21px]">
                {post.description}
              </p>
            )}
            <p className="mt-5 font-ui text-[13px] font-medium text-ink-body">
              <span className="uppercase text-ink-muted">By</span>{" "}
              <span className="font-semibold text-ink-strong">{post.author}</span>
              <span className="mx-2 text-ink-muted">·</span>
              <span>约 {post.readingMinutes} 分钟 · {post.wordCount} 字</span>
            </p>
            <p className="mt-3 max-w-2xl pl-1 font-serif text-[14px] italic leading-[1.8] text-stamp/85">
              {leadWhisper}
            </p>
          </div>
          <aside className="hidden md:block md:pt-2">
            <p className="font-ui text-[11px] font-medium tracking-[0.12em] text-ink-muted">
              读前一眼
            </p>
            <p className="mt-2 max-w-[18rem] font-serif text-[17px] leading-[1.8] text-ink-strong/95">
              {editorNote}
            </p>
            <p className="mt-3 max-w-[18rem] font-serif text-[15px] leading-[1.85] text-ink-body">
              {marginNote}
            </p>
            <p className="mt-3 font-ui text-[11px] text-ink-muted">
              约 {post.readingMinutes} 分钟 · {post.wordCount} 字
            </p>
            <p className="mt-1.5 font-ui text-[11px] text-ink-muted">
              写于 {formatArticleDateline(post.date)}
            </p>
          </aside>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("group", className)}>
        <Link to={`/posts/${post.slug}`} className="block py-4">
          <div className="grid gap-1.5 md:grid-cols-[116px_minmax(0,1fr)_72px] md:items-start md:gap-4">
            <p className="font-mono text-[10px] tracking-[0.12em] text-ink-muted md:pt-1">
              {formatArticleDateline(post.date)}
            </p>
            <p className="font-display text-[20px] leading-[1.38] text-ink-strong transition-colors group-hover:text-stamp">
              {post.title}
            </p>
            <p className="font-ui text-[10px] font-medium tracking-[0.14em] text-ink-muted transition-colors group-hover:text-stamp md:justify-self-end md:pt-1">
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
      <p className="mt-4 font-ui text-[12px] font-medium uppercase text-ink-muted">
        约 {post.readingMinutes} 分钟 ·{" "}
        <span className="border-b border-ink pb-px text-ink transition-colors group-hover:border-stamp group-hover:text-stamp">
          Read →
        </span>
      </p>
    </article>
  );
}

function getLeadEditorNote(post: Post): string {
  const tags = new Set(post.tags);
  const categories = new Set(post.categories);

  if (tags.has("依恋") || tags.has("心理") || tags.has("自我剖析")) {
    return "一份关于亲密、恐惧与自我解释的私人档案。";
  }

  if (categories.has("权益维护") || tags.has("报告")) {
    return "像存档，也像替当时的自己补上的一份证词。";
  }

  if (categories.has("开发教程") || tags.has("开发")) {
    return "写给后来的人，也写给总会忘记步骤的自己。";
  }

  if (categories.has("工具箱") || tags.has("工具") || tags.has("教程")) {
    return "把麻烦事折成一张随手可翻的备忘录。";
  }

  if (tags.has("建站") || tags.has("你好世界")) {
    return "像门牌，也像一句试探着递出去的自我介绍。";
  }

  return "先读标题，再看看这篇文字究竟想替谁解释自己。";
}

function getLeadWhisper(post: Post): string {
  const tags = new Set(post.tags);
  const categories = new Set(post.categories);

  if (tags.has("依恋") || tags.has("心理") || tags.has("自我剖析")) {
    return "写到这里时，其实已经不太想替自己圆场了。";
  }

  if (categories.has("权益维护") || tags.has("报告")) {
    return "有些东西查完不会轻松，只会更想留下证据。";
  }

  if (categories.has("开发教程") || tags.has("开发")) {
    return "本来只是记步骤，写着写着又像在给自己留路标。";
  }

  if (categories.has("工具箱") || tags.has("工具") || tags.has("教程")) {
    return "能少折腾一次命令行，也算替明天的自己省点力气。";
  }

  if (tags.has("建站") || tags.has("你好世界")) {
    return "有时候首页写的不是欢迎词，只是试着证明自己来过。";
  }

  return "像一条正式刊出的标题，也像临时写给自己的备忘。";
}
