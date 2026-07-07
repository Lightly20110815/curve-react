/**
 * 首页 — 花园的入口。
 *
 * 顶部是活的夜空（招牌），大字是随时辰变化的问候；
 * 往下：最近种下（文章列表）+ 侧栏（刚写下的、园子记数），
 * 然后是花圃（标签）与邻居的灯（友链一角）。
 */
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { NightSky } from "@/components/NightSky";
import { DailyPoetry } from "@/components/DailyPoetry";
import { PostRow } from "@/components/PostRow";
import { posts, getAllTags, getAllCategories } from "@/content/posts";
import { notes } from "@/content/notes";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf } from "@/lib/as-of";
import { greetingForHour, getMoonPhase } from "@/lib/garden-time";
import { formatDotDate, formatArticleDateline, hanNumber } from "@/lib/han-date";
import { getAllFriendLinks } from "@/lib/links";

export default function HomePage() {
  const { asOf } = useAsOf();
  const visiblePosts = filterByAsOf(posts, asOf);
  const visibleNotes = filterByAsOf(notes, asOf);

  const recent = visiblePosts.slice(0, 7);
  const [latestNote] = visibleNotes;
  const tags = getAllTags(visiblePosts).slice(0, 14);
  const categories = getAllCategories(visiblePosts);
  const friends = getAllFriendLinks().slice(0, 3);

  const now = new Date();
  const greeting = greetingForHour(now.getHours());
  const moon = getMoonPhase(now);
  const totalWords = visiblePosts.reduce((s, p) => s + p.wordCount, 0);

  return (
    <div>
      {/* ============ 活的夜空 ============ */}
      <section className="relative overflow-hidden">
        <NightSky className="absolute inset-0 h-full w-full" />
        <div className="relative mx-auto flex min-h-[62dvh] max-w-5xl flex-col justify-end px-5 pb-14 pt-32 md:px-8">
          <p className="rise-in font-mono text-[12px] tracking-[0.08em] text-mist">
            {formatArticleDateline(now)} · {moon.name} · {greeting.period}
          </p>
          <h1 className="rise-in mt-4 max-w-xl text-[32px] font-bold leading-[1.45] text-ink-strong [text-wrap:balance] md:text-[42px]">
            {greeting.text}
          </h1>
          <p className="rise-in-late mt-4 max-w-md text-[16px] leading-relaxed text-ink">
            这里是 Sy 的数字花园，一份公开的便签本，写给某个深夜路过的你。
          </p>
          <DailyPoetry className="rise-in-late mt-10 border-l-2 border-firefly/60 pl-4" />
        </div>
      </section>

      {/* ============ 最近种下 + 侧栏 ============ */}
      <section className="mx-auto max-w-5xl px-5 pt-16 md:px-8 md:pt-20">
        <div className="grid gap-14 md:grid-cols-[1.6fr_0.9fr] md:gap-16">
          <div>
            <SectionHeading title="最近种下" />
            <div className="divide-y divide-line">
              {recent.map((p) => (
                <PostRow key={p.slug} post={p} />
              ))}
            </div>
            <Link
              to="/archives"
              className="group mt-8 inline-flex items-center gap-1.5 text-[14.5px] text-firefly transition-colors hover:text-firefly-deep"
            >
              全部 {visiblePosts.length} 篇文字
              <ArrowRight
                size={15}
                weight="bold"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {/* 侧栏 */}
          <aside className="space-y-12 md:border-l md:border-line md:pl-10">
            {latestNote && (
              <div>
                <SectionHeading title="刚写下的" small />
                <Link to="/notes" className="group block">
                  <p className="text-[17px] leading-relaxed text-ink-strong transition-colors group-hover:text-firefly">
                    {latestNote.mood ? `${latestNote.mood} ` : ""}
                    {latestNote.title}
                  </p>
                  {latestNote.description && (
                    <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-mist">
                      {latestNote.description}
                    </p>
                  )}
                  <p className="mt-3 font-mono text-[11px] tracking-wider text-mist">
                    {formatDotDate(latestNote.date)} · 去随笔
                  </p>
                </Link>
              </div>
            )}

            <div>
              <SectionHeading title="园子记数" small />
              <dl className="space-y-3.5">
                <CountLine label="种下" value={`${hanNumber(visiblePosts.length)} 篇文字`} />
                <CountLine label="随笔" value={`${hanNumber(visibleNotes.length)} 则`} />
                <CountLine label="累计" value={formatWords(totalWords)} />
              </dl>
              <Link
                to="/countdown"
                className="mt-5 inline-block text-[13.5px] text-firefly transition-colors hover:text-firefly-deep"
              >
                看看时间走到哪了
              </Link>
            </div>

            <div>
              <SectionHeading title="编者的话" small />
              <blockquote className="border-l-2 border-firefly/40 pl-4 text-[15px] leading-loose text-ink">
                我总希望能给别人带来欢乐，但最终带来的几乎只是烦恼。
              </blockquote>
              <p className="mt-2.5 font-mono text-[11px] tracking-wider text-mist">
                Sy，偶尔把这里当草稿纸
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ============ 花圃（标签与栏目） ============ */}
      <section className="mx-auto max-w-5xl px-5 pt-20 md:px-8 md:pt-24">
        <SectionHeading title="花圃" note="按标签走进园子的不同角落" />
        <div className="flex flex-wrap gap-2.5">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/categories/${encodeURIComponent(c.name)}`}
              className="pressable rounded-full border border-firefly/40 px-4 py-1.5 text-[14px] text-firefly transition-colors duration-200 hover:bg-firefly hover:text-page"
            >
              {c.name} · {hanNumber(c.count)}
            </Link>
          ))}
          {tags.map((t) => (
            <Link
              key={t.name}
              to={`/tags/${encodeURIComponent(t.name)}`}
              className="pressable rounded-full border border-line px-4 py-1.5 text-[14px] text-mist transition-colors duration-200 hover:border-firefly/50 hover:text-firefly"
            >
              {t.name}
            </Link>
          ))}
          <Link
            to="/tags"
            className="self-center pl-1 text-[13.5px] text-firefly transition-colors hover:text-firefly-deep"
          >
            完整索引
          </Link>
        </div>
      </section>

      {/* ============ 邻居的灯 ============ */}
      <section className="mx-auto max-w-5xl px-5 pt-20 md:px-8 md:pt-24">
        <SectionHeading title="邻居的灯" note="夜里也亮着的那些站点" />
        <div className="grid gap-4 sm:grid-cols-3">
          {friends.map((f) => (
            <a
              key={f.url}
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-line bg-surface/60 p-5 transition-[border-color,background-color] duration-300 hover:border-firefly/40 hover:bg-surface"
            >
              <div className="flex items-center gap-3">
                <img
                  src={f.avatar}
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 rounded-full border border-line object-cover"
                />
                <p className="truncate text-[15.5px] text-ink-strong transition-colors group-hover:text-firefly">
                  {f.name}
                </p>
              </div>
              <p className="mt-3 line-clamp-2 text-[13.5px] leading-relaxed text-mist">
                {f.desc}
              </p>
            </a>
          ))}
        </div>
        <Link
          to="/links"
          className="group mt-6 inline-flex items-center gap-1.5 text-[14.5px] text-firefly transition-colors hover:text-firefly-deep"
        >
          全部友邻
          <ArrowRight
            size={15}
            weight="bold"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </section>

      <div className="pb-4" />
    </div>
  );
}

function SectionHeading({
  title,
  note,
  small = false,
}: {
  title: string;
  note?: string;
  small?: boolean;
}) {
  return (
    <div className={small ? "mb-4" : "mb-7"}>
      <h2
        className={
          small
            ? "text-[15px] font-bold tracking-wide text-mist"
            : "text-[24px] font-bold text-ink-strong md:text-[27px]"
        }
      >
        {title}
      </h2>
      {note && <p className="mt-1.5 text-[14px] text-mist">{note}</p>}
    </div>
  );
}

function CountLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[14.5px]">
      <dt className="shrink-0 text-mist">{label}</dt>
      <dd className="text-right text-ink-strong">{value}</dd>
    </div>
  );
}

function formatWords(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)} 万字`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)} 千字`;
  return `${n} 字`;
}
