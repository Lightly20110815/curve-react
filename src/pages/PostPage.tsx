import { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Focus, Minimize2 } from "lucide-react";
import { ArticleAiReader } from "@/components/ArticleAiReader";
import { ArticleToc } from "@/components/ArticleToc";
import { Badge } from "@/components/ui/badge";
import { ArticleAiSummary } from "@/components/ArticleAiSummary";
import { useArticleAi } from "@/components/ArticleAiProvider";
import { Kicker, Ornament } from "@/components/Editorial";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TwikooComments } from "@/components/TwikooComments";
import { useZenMode } from "@/components/ZenModeProvider";
import { buttonVariants } from "@/components/ui/button";
import { getPostBySlug, posts } from "@/content/posts";
import { useAsOf } from "@/hooks/useAsOf";
import { useCodeBlockEnhancements } from "@/hooks/useCodeBlockEnhancements";
import { filterByAsOf, isBeforeAsOf } from "@/lib/as-of";
import { buildArticleAiDocument } from "@/lib/article-ai";
import { formatArticleDateline } from "@/lib/han-date";
import { cn } from "@/lib/utils";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;
  const { asOf, exit } = useAsOf();
  const { isZen, toggleZen, exitZen } = useZenMode();
  const isHidden = !!(post && asOf && !isBeforeAsOf(post.date, asOf));
  const { setActiveArticle } = useArticleAi();
  const aiArticle = useMemo(
    () => (post?.articleGPT && !isHidden ? buildArticleAiDocument(post) : null),
    [post, isHidden],
  );
  const articleBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveArticle(aiArticle);
    return () => {
      setActiveArticle(null);
    };
  }, [aiArticle, setActiveArticle]);

  useCodeBlockEnhancements(articleBodyRef, post?.slug ?? "");

  if (!post) {
    return (
      <div className="container py-section text-center">
        <Kicker variant="stamp">Missing Issue · 缺失刊号</Kicker>
        <h1 className="mt-4 font-display text-[clamp(42px,7vw,88px)] font-bold leading-[1.12] text-ink-strong">
          找不到这篇文章
        </h1>
        <p className="mt-4 font-serif text-[17px] leading-[1.8] text-ink-body">
          这条小径已经走到了尽头。
        </p>
        <Link to="/archives" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          <ArrowLeft className="h-4 w-4" />
          回到存档
        </Link>
      </div>
    );
  }

  if (isHidden && asOf) {
    return (
      <div className="container py-section text-center">
        <Kicker variant="stamp">Not Yet In Print · 本期尚未刊登</Kicker>
        <h1 className="mt-4 font-display text-[clamp(36px,6vw,72px)] font-bold leading-[1.15] text-ink-strong">
          这一篇还没排到这一期
        </h1>
        <p className="mt-5 font-serif text-[17px] leading-[1.85] text-ink-body">
          你正在翻阅 {formatArticleDateline(`${asOf}T00:00:00`)} 的版本，
          <br />
          《{post.title}》要等到 {formatArticleDateline(post.date)} 才会刊出。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={exit}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            回到现在
          </button>
          <Link
            to="/archives"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
          >
            <ArrowLeft className="h-4 w-4" />
            翻回存档
          </Link>
        </div>
      </div>
    );
  }

  const navPool = asOf ? filterByAsOf(posts, asOf) : posts;
  const index = navPool.findIndex((item) => item.slug === post.slug);
  const previousPost = index >= 0 ? navPool[index + 1] : undefined;
  const nextPost = index > 0 ? navPool[index - 1] : undefined;
  const section = post.categories[0] ?? "随笔";
  const showAside = aiArticle && !isZen;

  return (
    <>
      <ReadingProgress targetRef={articleBodyRef} />
      <ArticleToc containerRef={articleBodyRef} contentKey={post.slug} />

      {/* Zen-mode exit button — floats top-right while zen is active */}
      {isZen && (
        <button
          type="button"
          onClick={exitZen}
          className="fixed right-4 top-4 z-50 inline-flex items-center gap-1.5 border border-rule-soft/60 bg-paper/95 px-3 py-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted shadow-sm transition-colors hover:border-stamp hover:text-stamp"
          aria-label="退出禅模式"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          退出禅模式 · Esc
        </button>
      )}

      <article className={cn("container", isZen ? "py-8 md:py-12" : "py-5 md:py-8")}>
        <div
          className={cn(
            "mx-auto",
            showAside
              ? "max-w-[1120px] lg:grid lg:grid-cols-[minmax(0,720px)_300px] lg:items-start lg:justify-center lg:gap-8"
              : isZen
              ? "max-w-[760px]"
              : "max-w-[820px]",
          )}
        >
          <div className="min-w-0">
            <div
              className={cn(
                "overflow-hidden bg-paper/95",
                isZen
                  ? "border-y border-rule-soft/40"
                  : "border-y-[3px] border-rule shadow-[0_1px_0_hsl(var(--rule-soft)/0.35)]",
              )}
            >
              {!isZen && (
                <div className="px-4 py-4 md:px-6 md:py-5 lg:px-7">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-2.5">
                    <Link
                      to={`/categories/${encodeURIComponent(section)}`}
                      className="font-ui text-[12px] font-semibold uppercase text-stamp transition-colors hover:text-ink"
                    >
                      {section}
                    </Link>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleZen}
                        className="inline-flex items-center gap-1 font-ui text-[12px] font-medium uppercase text-ink-muted transition-colors hover:text-stamp"
                        aria-label="进入禅模式"
                      >
                        <Focus className="h-3 w-3" />
                        禅模式
                      </button>
                      <Link
                        to="/archives"
                        className="inline-flex items-center gap-1 font-ui text-[12px] font-medium uppercase text-ink-muted transition-colors hover:text-stamp"
                      >
                        <ArrowLeft className="h-3 w-3" />
                        All issues
                      </Link>
                    </div>
                  </div>

                  <header className="mt-5">
                    <Kicker variant="stamp">Lead Story</Kicker>
                    <h1 className="mt-2.5 font-display text-[clamp(32px,4.4vw,52px)] font-bold leading-[1.16] text-ink-strong">
                      {post.title}
                    </h1>
                    {post.description && (
                      <p className="mt-3 font-serif text-[17px] leading-[1.75] text-ink-strong/90 md:text-[19px]">
                        {post.description}
                      </p>
                    )}
                  </header>

                  <div className="mt-5 grid gap-3 border-y border-rule/70 bg-paper-soft/55 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <div className="space-y-1">
                      <p className="font-ui text-[12px] font-semibold uppercase text-ink-muted">
                        By <span className="text-ink-strong">{post.author}</span>
                      </p>
                      <p className="font-serif text-[15px] leading-[1.7] text-ink-body">
                        {formatArticleDateline(post.date)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <MetaChip>约 {post.readingMinutes} 分钟</MetaChip>
                      <MetaChip>{post.wordCount} 字</MetaChip>
                    </div>
                  </div>

                  {post.articleGPT ? <ArticleAiSummary post={post} /> : null}
                </div>
              )}

              {isZen && (
                <header className="px-4 pt-10 text-center md:px-6 lg:px-10">
                  <h1 className="font-display text-[clamp(30px,4.4vw,52px)] font-bold leading-[1.2] text-ink-strong">
                    {post.title}
                  </h1>
                  <p className="mt-3 font-serif text-[14px] italic text-ink-muted">
                    {formatArticleDateline(post.date)} · {post.author}
                  </p>
                </header>
              )}

              <div className="px-4 pb-10 pt-6 md:px-6 md:pb-14 lg:px-7">
                {aiArticle && !isZen ? (
                  <div className="mb-6 lg:hidden">
                    <ArticleAiReader article={aiArticle} />
                  </div>
                ) : null}

                <div
                  ref={articleBodyRef}
                  className="prose-news prose-news-article mx-auto"
                  data-article-content="true"
                  dangerouslySetInnerHTML={{ __html: post.html }}
                />

                {post.tags.length > 0 && !isZen && (
                  <div className="mx-auto mt-12 max-w-[68ch] border-t border-rule pt-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Kicker>Filed Under</Kicker>
                      {post.tags.map((tag) => (
                        <Link key={tag} to={`/tags/${encodeURIComponent(tag)}`}>
                          <Badge variant="default">#{tag}</Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <Ornament className="mt-12" symbol="*" count={3} />
                <p className="mt-4 text-center font-ui text-[12px] font-medium uppercase text-ink-faded">
                  End of Article · 完
                </p>

                {!isZen && <TwikooComments key={post.slug} pageKey={`/posts/${post.slug}`} />}
              </div>
            </div>
          </div>

          {showAside ? (
            <aside className="hidden min-w-0 lg:block">
              <ArticleAiReader article={aiArticle} />
            </aside>
          ) : null}
        </div>

        {!isZen && (
          <nav
            className={cn(
              "mx-auto mt-8 grid gap-4 md:grid-cols-2",
              aiArticle ? "max-w-[1120px]" : "max-w-[820px]",
            )}
          >
            {previousPost ? (
              <Link
                to={`/posts/${previousPost.slug}`}
                className="group flex min-h-[152px] flex-col justify-between border border-rule bg-paper/92 p-5 transition-colors hover:bg-paper-soft"
              >
                <span className="inline-flex items-center gap-1 font-ui text-[12px] font-medium uppercase text-ink-muted">
                  <ArrowLeft className="h-3 w-3" />
                  Previous
                </span>
                <span className="mt-4 font-display text-[22px] font-semibold leading-[1.35] text-ink-strong transition-colors group-hover:text-stamp">
                  {previousPost.title}
                </span>
              </Link>
            ) : (
              <div className="hidden md:block" />
            )}

            {nextPost ? (
              <Link
                to={`/posts/${nextPost.slug}`}
                className="group flex min-h-[152px] flex-col justify-between border border-rule bg-paper/92 p-5 text-left transition-colors hover:bg-paper-soft md:text-right"
              >
                <span className="inline-flex items-center gap-1 font-ui text-[12px] font-medium uppercase text-ink-muted md:justify-end">
                  Next
                  <ArrowRight className="h-3 w-3" />
                </span>
                <span className="mt-4 font-display text-[22px] font-semibold leading-[1.35] text-ink-strong transition-colors group-hover:text-stamp">
                  {nextPost.title}
                </span>
              </Link>
            ) : (
              <div className="hidden md:block" />
            )}
          </nav>
        )}
      </article>
    </>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center border border-rule-soft/45 bg-paper px-2.5 py-1 font-ui text-[12px] font-medium text-ink-muted">
      {children}
    </span>
  );
}
