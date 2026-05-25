import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DailyPoetry } from "@/components/DailyPoetry";
import { PostCard } from "@/components/PostCard";
import { Kicker, Ornament } from "@/components/Editorial";
import { Badge } from "@/components/ui/badge";
import { NowPlaying } from "@/components/NowPlaying";
import { posts, getAllCategories, getAllTags } from "@/content/posts";
import { notes } from "@/content/notes";
import { formatArticleDateline, hanNumber } from "@/lib/han-date";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [lead, ...rest] = posts;
  const aboveFold = rest.slice(0, 4);
  const moreHeadlines = rest.slice(4, 10);
  const categories = getAllCategories();
  const allTags = getAllTags();
  const tags = allTags.slice(0, 16);
  const [latestNote] = notes;
  const leadTags = new Set(lead?.tags ?? []);
  const highlightedTagNames = new Set(
    tags
      .filter((tag) => leadTags.has(tag.name))
      .slice(0, 2)
      .map((tag) => tag.name),
  );
  const currentYear = new Date().getFullYear();
  const totalWords = posts.reduce((s, p) => s + p.wordCount, 0);
  const postsThisYear = posts.filter(
    (post) => new Date(post.date).getFullYear() === currentYear,
  ).length;
  const replyLinkClass =
    "inline-flex h-7 items-center justify-center border border-dashed px-3 font-ui text-[11px] font-medium tracking-[0.14em] uppercase transition-colors";
  const quickRoutes = [
    {
      to: "/archives",
      eyebrow: "Archive",
      title: "Read by year",
      summary: `Browse all ${posts.length} posts from the full archive shelf.`,
      meta: `${posts.length} posts`,
    },
    {
      to: "/notes",
      eyebrow: "Desk Note",
      title: latestNote ? `${latestNote.mood ? `${latestNote.mood} ` : ""}${latestNote.title}` : "Open the notebook",
      summary: latestNote?.description ?? "Fragments, drafts, and short notes from the desk.",
      meta: latestNote ? formatArticleDateline(latestNote.date) : "Notes",
    },
    {
      to: "/tags",
      eyebrow: "Index",
      title: "Take the lighter route",
      summary: `Start with ${allTags.length} tags instead of jumping straight into long reads.`,
      meta: `${allTags.length} tags`,
    },
  ] as const;

  return (
    <div className="container py-7 md:py-9">
      {/* LEAD STORY — front page hero */}
      {lead && <PostCard post={lead} variant="lead" />}

      <section className="mt-6">
        <DailyPoetry />
      </section>

      {/* ABOVE-THE-FOLD GRID — 3 columns of articles */}
      <section className="mt-7 border-y border-rule-soft/35 py-3 md:py-4">
        <div className="grid gap-px bg-rule-soft/20 md:grid-cols-3">
          {quickRoutes.map((route) => (
            <QuickRouteCard key={route.to} {...route} />
          ))}
        </div>
      </section>

      <section className="mt-10 md:mt-12">
        <SectionTitle title="头版要闻" note="继续往下读" />
        <div className="grid gap-x-8 gap-y-10 divide-y divide-rule-soft/25 md:grid-cols-3 md:divide-y-0 md:[&>article:not(:nth-child(3n+1))]:border-l md:[&>article:not(:nth-child(3n+1))]:border-rule-soft/25 md:[&>article:not(:nth-child(3n+1))]:pl-8">
          {aboveFold.map((p) => (
            <PostCard key={p.slug} post={p} className="pt-8 md:pt-0" />
          ))}
        </div>
      </section>

      {/* MORE HEADLINES + EDITOR'S DESK side-by-side */}
      <section className="mt-16 grid items-start gap-14 md:grid-cols-[1.45fr_0.95fr] md:gap-16">
        <div>
          <SectionTitle title="更多文章" note="这里还有几条值得翻看的短讯" />
          <div className="divide-y divide-rule-soft/30">
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
        <aside className="pt-1 md:border-l md:border-rule-soft/25 md:pl-10">
          <SectionTitle title="编辑台" note="编者边角" />
          <div className="mt-2 border-l border-stamp/45 pl-5">
            <p className="font-serif text-[22px] leading-[1.55] text-ink-strong">
              "我总希望能给别人带来欢乐，但最终带来的几乎只是烦恼。"
            </p>
            <p className="mt-4 font-ui text-[11px] text-ink-muted">
              —— Sy，偶尔把这里当草稿纸。
            </p>
            <p className="mt-3 max-w-sm font-serif text-[15px] italic leading-[1.8] text-stamp/80">
              有些段落文字，会在今天失控。
            </p>
          </div>

          <dl className="mt-9 grid grid-cols-3 gap-6 py-2 text-center">
            <Stat label="累计" value={hanNumber(posts.length)} suffix="篇" />
            <Stat label="字数" value={fmtK(totalWords)} suffix="字" />
            <Stat label="今年" value={hanNumber(postsThisYear)} suffix="篇" />
          </dl>

          {/* Latest note as a small column */}
          {latestNote && (
            <div className="mt-10">
              <p className="font-ui text-[11px] font-medium tracking-[0.12em] text-ink-muted">
                刚写下的
              </p>
              <Link to="/notes" className="group block pt-3">
                <p className="font-display text-[20px] leading-[1.35] text-ink-strong transition-colors group-hover:text-stamp">
                  {latestNote.mood ? `${latestNote.mood} ` : ""}{latestNote.title}
                </p>
                <p className="mt-2 line-clamp-3 font-serif text-[15px] leading-[1.75] text-ink-body">
                  {latestNote.description}
                </p>
                <p className="mt-3 font-ui text-[11px] text-ink-muted">
                  {formatArticleDateline(latestNote.date)} · 进入随笔 →
                </p>
              </Link>
            </div>
          )}
        </aside>
      </section>

      <Ornament className="my-section" />

      {/* SECTIONS INDEX — categories as a classifieds-style grid */}
      <section className="mt-16 md:mt-20">
        <SectionTitle title="版块导航" note="栏目目录" />
        <div className="grid bg-paper sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, index) => (
            <Link
              key={c.name}
              to={`/categories/${encodeURIComponent(c.name)}`}
              className="group flex min-h-[142px] flex-col justify-between bg-paper p-5 outline outline-1 outline-offset-[-1px] outline-rule transition-colors hover:bg-paper-warm"
            >
              <div className="flex items-center justify-between font-ui text-[11px] font-medium tracking-[0.12em] text-ink-muted">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span className="h-px w-8 bg-rule-soft/45 transition-colors group-hover:bg-stamp/45" />
              </div>
              <div className="pt-6">
                <span className="font-display text-[22px] font-semibold text-ink-strong transition-colors group-hover:text-stamp">
                  {c.name}
                </span>
              </div>
              <div className="flex items-center justify-between font-ui text-[11px] font-medium tracking-[0.12em] text-ink-muted">
                <span>本栏收录</span>
                <span>{hanNumber(c.count)} 篇</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TAG INDEX */}
      <section className="mt-20 md:mt-24">
        <SectionTitle title="关键词索引" note="轻一点地翻标签" />
        <div className="flex flex-wrap items-center gap-2 py-1">
          {tags.map((t) => (
            <Link key={t.name} to={`/tags/${encodeURIComponent(t.name)}`}>
              <Badge
                variant={highlightedTagNames.has(t.name) ? "stamp" : "soft"}
                size="sm"
                className={
                  highlightedTagNames.has(t.name)
                    ? "border-stamp/22 bg-[hsl(var(--stamp-soft))] px-2.5 py-1 font-serif normal-case tracking-normal text-stamp hover:bg-stamp hover:text-paper"
                    : "border-rule-soft/20 bg-paper px-2.5 py-1 font-serif normal-case tracking-normal text-ink-muted hover:border-rule-soft/35 hover:bg-paper-soft/60 hover:text-ink"
                }
              >
                #{t.name}
              </Badge>
            </Link>
          ))}
          <Link
            to="/tags"
            className="ml-2 font-ui text-[11px] font-medium tracking-[0.12em] text-ink-muted underline-offset-4 hover:text-stamp hover:underline"
          >
            完整索引 →
          </Link>
        </div>
      </section>

      {/* CLASSIFIEDS — CTA band styled as small classifieds */}
      <section className="mt-16 grid gap-px border-2 border-ink bg-ink md:mt-20 md:grid-cols-3">
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
                replyLinkClass,
                "border-paper/70 bg-paper text-ink hover:bg-paper-warm hover:text-stamp",
              )}
            >
              联系编者
            </Link>
            <Link
              to="/notes"
              className={cn(
                replyLinkClass,
                "border-paper/65 bg-transparent text-paper hover:bg-paper/12 hover:text-paper",
              )}
            >
              翻到随笔
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-6">
      {note ? (
        <p className="font-ui text-[11px] font-medium tracking-[0.12em] text-ink-muted">
          {note}
        </p>
      ) : null}
      <h2 className="mt-1 font-display text-[24px] font-semibold leading-none text-ink-strong md:text-[27px]">
        {title}
      </h2>
    </div>
  );
}

function QuickRouteCard({
  to,
  eyebrow,
  title,
  summary,
  meta,
}: {
  to: string;
  eyebrow: string;
  title: string;
  summary: string;
  meta: string;
}) {
  return (
    <Link
      to={to}
      className="group bg-paper/80 px-4 py-4 transition-colors hover:bg-paper-warm/75 md:min-h-[138px] md:px-5"
    >
      <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {eyebrow}
      </p>
      <p className="mt-3 max-w-[18rem] font-display text-[20px] leading-[1.3] text-ink-strong transition-colors group-hover:text-stamp">
        {title}
      </p>
      <p className="mt-2 line-clamp-2 max-w-[22rem] font-serif text-[14px] leading-[1.7] text-ink-body">
        {summary}
      </p>
      <p className="mt-5 inline-flex items-center gap-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-stamp">
        {meta}
        <ArrowRight className="h-3 w-3" />
      </p>
    </Link>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div>
      <p className="font-display text-[28px] font-bold leading-none text-ink-strong">
        {value}
        <span className="ml-1 font-ui text-[12px] font-medium text-ink-muted">
          {suffix}
        </span>
      </p>
      <p className="mt-1.5 font-ui text-[11px] font-medium tracking-[0.12em] text-ink-muted">
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
