import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DailyPoetry } from "@/components/DailyPoetry";
import { PostCard } from "@/components/PostCard";
import { Kicker, Ornament } from "@/components/editorial";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { posts, getAllCategories, getAllTags } from "@/content/posts";
import { notes } from "@/content/notes";
import { formatArticleDateline, hanNumber } from "@/lib/han-date";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [lead, ...rest] = posts;
  const aboveFold = rest.slice(0, 4);
  const moreHeadlines = rest.slice(4, 10);
  const categories = getAllCategories();
  const tags = getAllTags().slice(0, 16);
  const [latestNote] = notes;
  const currentYear = new Date().getFullYear();
  const totalWords = posts.reduce((s, p) => s + p.wordCount, 0);
  const postsThisYear = posts.filter(
    (post) => new Date(post.date).getFullYear() === currentYear,
  ).length;

  return (
    <div className="container py-10 md:py-14">
      {/* LEAD STORY — front page hero */}
      {lead && <PostCard post={lead} variant="lead" />}

      <section className="mt-8">
        <DailyPoetry />
      </section>

      {/* ABOVE-THE-FOLD GRID — 3 columns of articles */}
      <section className="mt-12">
        <SectionTitle kicker="ABOVE THE FOLD · 头版要闻" />
        <div className="grid gap-x-8 gap-y-10 divide-y divide-rule-soft/40 md:grid-cols-3 md:divide-y-0 md:[&>article:not(:nth-child(3n+1))]:border-l md:[&>article:not(:nth-child(3n+1))]:border-rule-soft/40 md:[&>article:not(:nth-child(3n+1))]:pl-8">
          {aboveFold.map((p) => (
            <PostCard key={p.slug} post={p} className="pt-8 md:pt-0" />
          ))}
        </div>
      </section>

      <Ornament className="my-section" />

      {/* MORE HEADLINES + EDITOR'S DESK side-by-side */}
      <section className="grid gap-10 md:grid-cols-[1.5fr_1fr]">
        <div>
          <SectionTitle kicker="MORE HEADLINES · 其他要目" />
          <div className="divide-y divide-rule-soft/40">
            {moreHeadlines.length > 0 ? (
              moreHeadlines.map((p) => <PostCard key={p.slug} post={p} variant="compact" />)
            ) : (
              <p className="py-4 font-serif text-[15px] italic text-ink-muted">
                本期暂无更多要目。
              </p>
            )}
          </div>
          <Link
            to="/archives"
            className="mt-6 inline-flex items-center gap-2 border-b-2 border-ink pb-1 font-ui text-[12px] font-semibold uppercase text-ink transition-colors hover:border-stamp hover:text-stamp"
          >
            完整存档 · {posts.length} 篇
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* EDITOR'S DESK — sidebar */}
        <aside>
          <SectionTitle kicker="EDITOR'S DESK · 编者按" />
          <div className="border-l-2 border-stamp pl-5">
            <p className="font-serif text-[22px] leading-[1.55] text-ink-strong">
              "我总希望能给别人带来欢乐，但最终带来的几乎只是烦恼。"
            </p>
            <p className="mt-4 font-ui text-[12px] font-medium uppercase text-ink-muted">
              — Sy, somewhere
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-2 border-y-[3px] border-double border-rule py-4 text-center">
            <Stat label="累计" value={hanNumber(posts.length)} suffix="篇" />
            <Stat label="字数" value={fmtK(totalWords)} suffix="字" />
            <Stat label="今年" value={hanNumber(postsThisYear)} suffix="篇" />
          </dl>

          {/* Latest note as a small column */}
          {latestNote && (
            <div className="mt-8">
              <p className="font-ui text-[12px] font-semibold uppercase text-ink-muted">
                Latest note · 近期随笔
              </p>
              <Link to="/notes" className="group block pt-3">
                <p className="font-display text-[20px] leading-[1.35] text-ink-strong transition-colors group-hover:text-stamp">
                  {latestNote.mood ? `${latestNote.mood} ` : ""}{latestNote.title}
                </p>
                <p className="mt-2 line-clamp-3 font-serif text-[15px] leading-[1.75] text-ink-body">
                  {latestNote.description}
                </p>
                <p className="mt-3 font-ui text-[12px] font-medium uppercase text-ink-muted">
                  {formatArticleDateline(latestNote.date)} · 进入随笔 →
                </p>
              </Link>
            </div>
          )}
        </aside>
      </section>

      <Ornament className="my-section" />

      {/* SECTIONS INDEX — categories as a classifieds-style grid */}
      <section>
        <SectionTitle kicker="SECTIONS · 版块导航" />
        <div className="grid bg-paper sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/categories/${encodeURIComponent(c.name)}`}
              className="group flex items-baseline justify-between bg-paper p-5 outline outline-1 outline-offset-[-1px] outline-rule transition-colors hover:bg-paper-warm"
            >
              <span className="font-display text-[22px] font-semibold text-ink-strong transition-colors group-hover:text-stamp">
                {c.name}
              </span>
              <span className="font-ui text-[12px] font-medium uppercase text-ink-muted">
                {hanNumber(c.count)} 篇
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* TAG INDEX */}
      <section className="mt-section">
        <SectionTitle kicker="INDEX · 关键词索引" />
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <Link key={t.name} to={`/tags/${encodeURIComponent(t.name)}`}>
              <Badge variant="default" size="md">#{t.name}</Badge>
            </Link>
          ))}
          <Link
            to="/tags"
            className="ml-2 font-ui text-[12px] font-semibold uppercase text-ink-muted underline-offset-4 hover:text-stamp hover:underline"
          >
            完整索引 →
          </Link>
        </div>
      </section>

      <Ornament className="my-section" />

      {/* CLASSIFIEDS — CTA band styled as small classifieds */}
      <section className="grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
        <div className="bg-paper p-8">
          <Kicker variant="stamp">Wanted · 寻友</Kicker>
          <h3 className="mt-3 font-display text-[25px] font-bold leading-[1.25] text-ink-strong">
            一位愿意慢慢读的人
          </h3>
          <p className="mt-3 font-serif text-[16px] leading-[1.8] text-ink-body">
            不必是熟人，也不必有共同语言。<br />
            你愿意点开这里，就已经够了。
          </p>
        </div>
        <div className="bg-paper p-8">
          <Kicker variant="stamp">Notice · 启事</Kicker>
          <h3 className="mt-3 font-display text-[25px] font-bold leading-[1.25] text-ink-strong">
            本报不定期更新
          </h3>
          <p className="mt-3 font-serif text-[16px] leading-[1.8] text-ink-body">
            没有发刊周期。心情好就发，心情不好也发。<br />
            一切以"想写"为准。
          </p>
        </div>
        <div className="flex flex-col justify-between bg-stamp p-8 text-paper">
          <div>
            <p className="font-ui text-[12px] font-semibold uppercase text-paper">
              Reply · 回信
            </p>
            <h3 className="mt-3 font-display text-[25px] font-bold leading-[1.25]">
              想说点什么？
            </h3>
            <p className="mt-3 font-serif text-[16px] leading-[1.8] text-paper">
              邮箱、随笔评论、GitHub Issue 都行。
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/about"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-paper text-ink hover:bg-paper-warm hover:text-stamp",
              )}
            >
              联系编者
            </Link>
            <Link
              to="/notes"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-paper/90 text-stamp hover:bg-paper hover:text-ink-strong",
              )}
            >
              读读随笔
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ kicker }: { kicker: string }) {
  return (
    <div className="mb-6 border-y border-rule py-2">
      <div className="flex items-end justify-between gap-3">
        <Kicker className="text-ink">{kicker}</Kicker>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div>
      <p className="font-display text-[28px] font-bold leading-none text-ink-strong">
        {value}
        <span className="ml-1 font-ui text-[12px] font-medium uppercase text-ink-muted">
          {suffix}
        </span>
      </p>
      <p className="mt-1.5 font-ui text-[12px] font-medium uppercase text-ink-muted">
        {label}
      </p>
    </div>
  );
}

function fmtK(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
