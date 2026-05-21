import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Kicker, Ornament } from "@/components/editorial";
import { TwikooComments } from "@/components/TwikooComments";
import { buttonVariants } from "@/components/ui/button";
import { getPostBySlug, posts } from "@/content/posts";
import { formatArticleDateline } from "@/lib/han-date";
import { cn } from "@/lib/utils";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

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

  const index = posts.findIndex((item) => item.slug === post.slug);
  const previousPost = posts[index + 1];
  const nextPost = index > 0 ? posts[index - 1] : undefined;
  const section = post.categories[0] ?? "随笔";

  return (
    <article className="container py-8 md:py-12">
      <div className="mx-auto max-w-[860px]">
        <div className="overflow-hidden border-y-[3px] border-rule bg-paper/95 shadow-[0_1px_0_hsl(var(--rule-soft)/0.35)]">
          <div className="px-5 py-4 md:px-10 md:py-6 lg:px-14">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
              <Link
                to={`/categories/${encodeURIComponent(section)}`}
                className="font-ui text-[12px] font-semibold uppercase text-stamp transition-colors hover:text-ink"
              >
                {section}
              </Link>
              <Link
                to="/archives"
                className="inline-flex items-center gap-1 font-ui text-[12px] font-medium uppercase text-ink-muted transition-colors hover:text-stamp"
              >
                <ArrowLeft className="h-3 w-3" />
                All issues
              </Link>
            </div>

            <header className="mt-7">
              <Kicker variant="stamp">Lead Story</Kicker>
              <h1 className="mt-3 font-display text-[clamp(34px,5vw,60px)] font-bold leading-[1.18] text-ink-strong">
                {post.title}
              </h1>
              {post.description && (
                <p className="mt-5 font-serif text-[18px] leading-[1.9] text-ink-strong/90 md:text-[20px]">
                  {post.description}
                </p>
              )}
            </header>

            <div className="mt-7 grid gap-4 border-y border-rule/70 bg-paper-soft/55 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
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
          </div>

          <div className="px-5 pb-12 pt-8 md:px-10 md:pb-16 lg:px-14">
            <div className="prose-news prose-news-article" dangerouslySetInnerHTML={{ __html: post.html }} />

            {post.tags.length > 0 && (
              <div className="mt-14 border-t border-rule pt-6">
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

            <TwikooComments key={post.slug} pageKey={`/posts/${post.slug}`} />
          </div>
        </div>
      </div>

      <nav className="mx-auto mt-8 grid max-w-[860px] gap-4 md:grid-cols-2">
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
    </article>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center border border-rule-soft/45 bg-paper px-2.5 py-1 font-ui text-[12px] font-medium text-ink-muted">
      {children}
    </span>
  );
}
