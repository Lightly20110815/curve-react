import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Kicker, Ornament } from "@/components/Editorial";
import type { Post } from "@/content/posts";
import { formatArticleDateline } from "@/lib/han-date";
import { cn } from "@/lib/utils";

/**
 * layout: memorial 的文章：沿用站内纸面与正文排版，
 * 开头只留标题与导语，结尾落在名字与年份上。不挂评论区。
 */
export default function MemorialPostPage({ post }: { post: Post }) {
  const section = post.categories[0] ?? "随笔";
  const name = post.memorialName ?? post.title;
  const ripRef = useRef<HTMLDivElement>(null);
  const [ripShown, setRipShown] = useState(false);

  // 翻到最后才出现 RIP，只播一次
  useEffect(() => {
    const el = ripRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRipShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRipShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article className="container py-5 md:py-8">
      <div className="mx-auto max-w-[820px] overflow-hidden border-y-[3px] border-rule bg-paper/95 shadow-[0_1px_0_hsl(var(--rule-soft)/0.35)]">
        <div className="px-4 pt-4 md:px-6 md:pt-5 lg:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-2.5">
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
        </div>

        <header className="mx-auto max-w-[36em] px-4 pb-12 pt-16 text-center md:pb-14 md:pt-20">
          <Link to="/epheia" className="transition-opacity hover:opacity-70">
            <Kicker variant="stamp">In Memory · 纪念</Kicker>
          </Link>
          <h1 className="mt-3 font-display text-[clamp(34px,5vw,54px)] font-bold leading-[1.16] text-ink-strong">
            {post.title}
          </h1>
          {post.description && (
            <p className="mt-6 font-serif text-[17px] leading-[1.9] text-ink-body md:text-[18px]">
              {post.description}
            </p>
          )}
          <p className="mt-5 font-serif text-[14px] italic text-ink-muted">
            {formatArticleDateline(post.date)} · {post.author}
          </p>
        </header>

        <Ornament symbol="*" count={3} />

        <div className="px-4 pb-6 pt-10 md:px-6 lg:px-7">
          <div
            className="prose-news mx-auto"
            data-article-content="true"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </div>

        <footer className="px-4 pb-24 pt-16 text-center md:pb-28 md:pt-20">
          <p className="font-display text-[clamp(28px,3.6vw,38px)] font-bold leading-tight text-ink-strong">
            {name}
          </p>
          {post.memorialYears && (
            <p className="mt-2 font-serif text-[17px] tracking-[0.08em] text-ink-muted">
              {post.memorialYears}
            </p>
          )}

          <div ref={ripRef} className="mt-7" aria-label="RIP, Rest in Peace">
            <p className="font-display text-[22px] font-normal leading-none tracking-[0.3em] text-ink-strong [margin-right:-0.3em]">
              {["R", "I", "P"].map((letter, i) => (
                <span
                  key={letter}
                  aria-hidden="true"
                  className={cn(
                    "inline-block transition-[opacity,filter,transform] duration-[1600ms] ease-out motion-reduce:transition-none",
                    ripShown ? "translate-y-0 opacity-100 blur-0" : "translate-y-1 opacity-0 blur-sm",
                  )}
                  style={{ transitionDelay: ripShown ? `${600 + i * 550}ms` : "0ms" }}
                >
                  {letter}
                </span>
              ))}
            </p>
            <p
              aria-hidden="true"
              className={cn(
                "mt-2.5 font-serif text-[13px] italic tracking-[0.15em] text-ink-muted transition-opacity duration-[2000ms] ease-out motion-reduce:transition-none",
                ripShown ? "opacity-100" : "opacity-0",
              )}
              style={{ transitionDelay: ripShown ? "2600ms" : "0ms" }}
            >
              Rest in Peace
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}
