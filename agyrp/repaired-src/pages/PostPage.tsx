import { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Focus, Minimize2 } from "lucide-react";
import { ArticleAiReader } from "@/components/ArticleAiReader";
import { ArticleToc } from "@/components/ArticleToc";
import { Badge } from "@/components/ui/badge";
import { ArticleAiSummary } from "@/components/ArticleAiSummary";
import { useArticleAi } from "@/components/ArticleAiProvider";
import { Kicker } from "@/components/Editorial";
import { ReadingProgress } from "@/components/ReadingProgress";
import MemorialPostPage from "@/pages/MemorialPostPage";
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

/**
 * 修复版 PostPage (已切断随笔与纪念文章上的不当 AI 挂载)
 *
 * 核心整改：
 * 1. 严格限制 AI 摘要与伴读助手范围：仅在真正需要步骤解析的技术文档/教程（开发教程、工具箱、部署）生效；
 * 2. 纪念、随笔、心理自白类文章彻底免于被 AI 摘要与问答侵入，还其安静质感；
 * 3. 头部去除冷冰冰的双语全大写眉标，保留正规报章版式。
 */
export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;
  const { asOf, exit } = useAsOf();
  const { isZen, toggleZen, exitZen } = useZenMode();
  const isHidden = !!(post && asOf && !isBeforeAsOf(post.date, asOf));
  const { setActiveArticle } = useArticleAi();

  // 关键去味逻辑：只允许真正的技术开发类文章挂载 AI 伴读
  const isTechnicalTutorial = useMemo(() => {
    if (!post) return false;
    const cats = post.categories || [];
    return cats.some((c) => ["开发教程", "工具箱", "部署", "教程"].includes(c));
  }, [post]);

  const shouldEnableAi = !!(post?.articleGPT && isTechnicalTutorial && !isHidden);

  const aiArticle = useMemo(
    () => (shouldEnableAi && post ? buildArticleAiDocument(post) : null),
    [post, shouldEnableAi],
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
      <div className="container py-16 text-center">
        <h1 className="font-display text-[36px] font-bold text-ink-strong">
          找不到这篇文章
        </h1>
        <p className="mt-4 font-serif text-[16px] text-ink-muted">
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
      <div className="container py-16 text-center">
        <h1 className="font-display text-[32px] font-bold text-ink-strong">
          这一篇还没排到这一期
        </h1>
        <p className="mt-5 font-serif text-[16px] text-ink-body">
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

  // 特殊版式：纪念页
  if (post.layout === "memorial") {
    return <MemorialPostPage post={post} />;
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

      {isZen && (
        <button
          type="button"
          onClick={exitZen}
          className="fixed right-4 top-4 z-50 inline-flex items-center gap-1.5 border border-rule bg-paper px-3 py-1.5 font-ui text-[12px] font-medium text-ink shadow-sm transition-colors hover:border-stamp hover:text-stamp"
          aria-label="退出禅模式"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          退出禅模式 (Esc)
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
                  : "border-y-2 border-rule shadow-[0_1px_0_hsl(var(--rule-soft)/0.25)]",
              )}
            >
              {!isZen && (
                <div className="px-4 py-5 md:px-7 md:py-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-2.5">
                    <Link
                      to={`/categories/${encodeURIComponent(section)}`}
                      className="font-ui text-[13px] font-semibold text-stamp transition-colors hover:text-ink"
                    >
                      {section}
                    </Link>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleZen}
                        className="inline-flex items-center gap-1 font-ui text-[12px] text-ink-muted transition-colors hover:text-stamp"
                        aria-label="进入禅模式"
                      >
                        <Focus className="h-3.5 w-3.5" />
                        禅模式
                      </button>
                      <Link
                        to="/archives"
                        className="inline-flex items-center gap-1 font-ui text-[12px] text-ink-muted transition-colors hover:text-stamp"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        全刊目录
                      </Link>
                    </div>
                  </div>

                  <header className="mt-6">
                    <h1 className="font-display text-[clamp(28px,4.5vw,46px)] font-bold leading-[1.2] text-ink-strong">
                      {post.title}
                    </h1>
                    {post.description && (
                      <p className="mt-3.5 font-serif text-[17px] leading-[1.8] text-ink-strong/90 md:text-[18.5px]">
                        {post.description}
                      </p>
                    )}
                  </header>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-rule/60 bg-paper-soft/40 py-2.5 px-3">
                    <div className="flex items-center gap-2 font-ui text-[12px] text-ink-muted">
                      <span>文 / <strong className="font-semibold text-ink-strong">{post.author}</strong></span>
                      <span>·</span>
                      <span>{formatArticleDateline(post.date)}</span>
                    </div>

                    <div className="flex items-center gap-2 font-ui text-[11.5px] text-ink-muted">
                      <span>约 {post.readingMinutes} 分钟</span>
                      <span>·</span>
                      <span>{post.wordCount} 字</span>
                    </div>
                  </div>

                  {/* 仅在技术文档上展现 AI 摘要，随笔与纪念文章绝对不渲染 */}
                  {shouldEnableAi ? <ArticleAiSummary post={post} /> : null}
                </div>
              )}

              {isZen && (
                <header className="px-4 pt-10 text-center md:px-6 lg:px-10">
                  <h1 className="font-display text-[clamp(28px,4vw,46px)] font-bold leading-[1.2] text-ink-strong">
                    {post.title}
                  </h1>
                  <p className="mt-3 font-serif text-[14px] italic text-ink-muted">
                    {formatArticleDateline(post.date)} · {post.author}
                  </p>
                </header>
              )}

              <div className="px-4 pb-10 pt-6 md:px-7 md:pb-14">
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
                      <span className="font-ui text-[12px] text-ink-muted">归入标签：</span>
                      {post.tags.map((tag) => (
                        <Link key={tag} to={`/tags/${encodeURIComponent(tag)}`}>
                          <Badge variant="default">#{tag}</Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {!isZen && (
                  <nav
                    className="mx-auto mt-10 grid max-w-[68ch] gap-4 border-t-2 border-rule pt-6 sm:grid-cols-2"
                    aria-label="前后文章"
                  >
                    {previousPost ? (
                      <Link
                        to={`/posts/${previousPost.slug}`}
                        className="group flex flex-col border border-rule-soft/50 p-4 transition-colors hover:border-stamp"
                      >
                        <span className="font-ui text-[11px] text-ink-muted">← 较早的一期</span>
                        <span className="mt-1 font-display text-[16px] font-semibold text-ink-strong transition-colors group-hover:text-stamp">
                          {previousPost.title}
                        </span>
                      </Link>
                    ) : <div />}

                    {nextPost ? (
                      <Link
                        to={`/posts/${nextPost.slug}`}
                        className="group flex flex-col items-end border border-rule-soft/50 p-4 text-right transition-colors hover:border-stamp"
                      >
                        <span className="font-ui text-[11px] text-ink-muted">较新的一期 →</span>
                        <span className="mt-1 font-display text-[16px] font-semibold text-ink-strong transition-colors group-hover:text-stamp">
                          {nextPost.title}
                        </span>
                      </Link>
                    ) : <div />}
                  </nav>
                )}

                <div className="mx-auto mt-12 max-w-[68ch]">
                  <TwikooComments pageKey={`/posts/${post.slug}`} />
                </div>
              </div>
            </div>
          </div>

          {/* 桌面端 AI 伴读仅在技术类教程展示 */}
          {aiArticle && !isZen ? (
            <aside className="hidden lg:block">
              <ArticleAiReader article={aiArticle} />
            </aside>
          ) : null}
        </div>
      </article>
    </>
  );
}
