/**
 * 文章页 — 安静的阅读体验。
 *
 * 窄栏正文（~68ch），xl 屏右侧挂目录；顶部萤火色阅读进度线；
 * 文末落款、标签、园中小径（上一株/下一株）、访客留言。
 */
import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ArticleToc } from "@/components/ArticleToc";
import { TwikooComments } from "@/components/TwikooComments";
import { GrowthGlyph } from "@/components/GrowthGlyph";
import { useCodeBlockEnhancements } from "@/hooks/useCodeBlockEnhancements";
import { posts, getPostBySlug } from "@/content/posts";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf, isBeforeAsOf } from "@/lib/as-of";
import { formatArticleDateline } from "@/lib/han-date";
import { growthForWordCount } from "@/lib/growth";
import NotFoundPage from "@/pages/NotFoundPage";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { asOf } = useAsOf();
  const bodyRef = useRef<HTMLDivElement>(null);

  const post = slug ? getPostBySlug(slug) : undefined;
  useCodeBlockEnhancements(bodyRef, post?.slug ?? "");

  if (!post) return <NotFoundPage />;

  // 时光机：这篇还没种下
  if (asOf && !isBeforeAsOf(post.date, asOf)) {
    return (
      <div className="mx-auto max-w-2xl px-5 pt-40 pb-24 text-center md:px-8">
        <p className="text-[22px] text-ink-strong">这一天，这篇文字还没种下。</p>
        <p className="mt-3 text-[15px] text-mist">
          它属于 {formatArticleDateline(post.date)}。回到现在就能看到了。
        </p>
      </div>
    );
  }

  const visiblePosts = filterByAsOf(posts, asOf);
  const index = visiblePosts.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? visiblePosts[index - 1] : null;
  const older = index >= 0 && index < visiblePosts.length - 1 ? visiblePosts[index + 1] : null;
  const growth = growthForWordCount(post.wordCount);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-28 md:px-8 md:pt-32">
      <ReadingProgress />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-14">
        <div className="mx-auto w-full max-w-[42rem]">
          {/* 文章头 */}
          <header className="rise-in">
            <p className="font-mono text-[12px] tracking-wider text-mist">
              {formatArticleDateline(post.date)} · 约 {post.wordCount} 字 ·{" "}
              {post.readingMinutes} 分钟 · {growth.label}
            </p>
            <h1 className="mt-4 text-[30px] font-bold leading-[1.45] text-ink-strong md:text-[36px]">
              {post.title}
            </h1>
            {post.description && (
              <p className="mt-4 border-l-2 border-firefly/50 pl-4 text-[15.5px] leading-loose text-mist">
                {post.description}
              </p>
            )}
          </header>

          {/* 正文 */}
          <div
            ref={bodyRef}
            className="prose rise-in-late mt-10"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {/* 落款 */}
          <footer className="mt-14 border-t border-line pt-8">
            <div className="flex items-center gap-2.5 text-[14.5px] text-mist">
              <GrowthGlyph wordCount={post.wordCount} size={17} />
              <span>
                种于 {formatArticleDateline(post.date)}，{post.author} 记
              </span>
            </div>
            {(post.categories.length > 0 || post.tags.length > 0) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.categories.map((c) => (
                  <Link
                    key={c}
                    to={`/categories/${encodeURIComponent(c)}`}
                    className="pressable rounded-full border border-firefly/40 px-3 py-1 text-[13px] text-firefly transition-colors hover:bg-firefly hover:text-page"
                  >
                    {c}
                  </Link>
                ))}
                {post.tags.map((t) => (
                  <Link
                    key={t}
                    to={`/tags/${encodeURIComponent(t)}`}
                    className="pressable rounded-full border border-line px-3 py-1 text-[13px] text-mist transition-colors hover:border-firefly/50 hover:text-firefly"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}
          </footer>

          {/* 园中小径 */}
          {(newer || older) && (
            <nav
              aria-label="上一篇与下一篇"
              className="mt-10 grid gap-3 sm:grid-cols-2"
            >
              {older ? (
                <PathCard post={older} direction="older" />
              ) : (
                <span aria-hidden className="hidden sm:block" />
              )}
              {newer && <PathCard post={newer} direction="newer" />}
            </nav>
          )}

          <TwikooComments pageKey={`/posts/${post.slug}`} />
          <div className="pb-8" />
        </div>

        {/* 目录（xl+） */}
        <aside className="hidden xl:block">
          <div className="sticky top-28">
            <ArticleToc containerRef={bodyRef} contentKey={post.slug} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function PathCard({
  post,
  direction,
}: {
  post: { slug: string; title: string };
  direction: "older" | "newer";
}) {
  const older = direction === "older";
  return (
    <Link
      to={`/posts/${post.slug}`}
      className={`group rounded-2xl border border-line bg-surface/60 p-4 transition-[border-color,background-color] duration-300 hover:border-firefly/40 hover:bg-surface ${
        older ? "" : "sm:text-right"
      }`}
    >
      <p
        className={`flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-mist ${
          older ? "" : "sm:justify-end"
        }`}
      >
        {older && <ArrowLeft size={12} weight="bold" />}
        {older ? "更早一株" : "更新一株"}
        {!older && <ArrowRight size={12} weight="bold" />}
      </p>
      <p className="mt-2 line-clamp-1 text-[15px] text-ink-strong transition-colors group-hover:text-firefly">
        {post.title}
      </p>
    </Link>
  );
}
