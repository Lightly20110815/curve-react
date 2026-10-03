import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DailyPoetry } from "@/components/DailyPoetry";
import { HomeTerminalEasterEgg } from "@/components/HomeTerminalEasterEgg";
import { PostCard } from "@/components/PostCard";
import { Ornament } from "@/components/Editorial";
import { posts, getAllCategories, getAllTags } from "@/content/posts";
import { notes } from "@/content/notes";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf } from "@/lib/as-of";
import { formatArticleDateline, hanNumber } from "@/lib/han-date";

/**
 * 修复版 HomePage (彻底去 AI 模板感与 Anthropic 排版反模式)
 *
 * 核心整改：
 * 1. 彻底移除 GalleryPromoModal 全屏弹窗；
 * 2. 彻底删除 QuickRouteCard 3 列对称功能卡片；
 * 3. 彻底删除 Stats 3 栏数据仪表盘（累计/字数/今年）；
 * 4. 彻底删除 Wanted / Notice / Reply 底部三联大卡片，收敛为安静的报馆尾注；
 * 5. 栏目分类删除 01/02 序号与无意义小横线；
 * 6. 头版要闻采用 6/3/3 不等宽真实报纸拼版，层次分明；
 * 7. 箭头全面收敛，仅保留关键出口。
 */
export default function HomePage() {
  const { asOf } = useAsOf();
  const visiblePosts = filterByAsOf(posts, asOf);
  const visibleNotes = filterByAsOf(notes, asOf);
  const [lead, firstStory, secondStory, thirdStory, ...rest] = visiblePosts;
  const categories = getAllCategories(visiblePosts);
  const allTags = getAllTags(visiblePosts);
  const tags = allTags.slice(0, 20);
  const [latestNote] = visibleNotes;

  return (
    <div className="container py-5 md:py-8">
      {/* 隐藏的彩蛋保留，无侵入 */}
      <HomeTerminalEasterEgg />

      {/* LEAD STORY — 真正的头版头条 */}
      {lead && <PostCard post={lead} variant="lead" />}

      {/* 卷首引文 — 安静静态呈现 */}
      <DailyPoetry />

      {/* 头版要闻：6/3/3 不等宽报纸拼版 */}
      <section className="pt-8 md:pt-11">
        <div className="flex items-baseline justify-between border-b-2 border-rule pb-2.5 mb-7">
          <h2 className="font-display text-[22px] font-bold text-ink-strong md:text-[25px]">
            头版要闻
          </h2>
          <Link
            to="/archives"
            className="font-ui text-[12px] text-ink-muted hover:text-stamp hover:underline underline-offset-4"
          >
            完整存档 →
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-12 md:gap-x-10">
          {firstStory && (
            <div className="md:col-span-6 md:border-r md:border-rule-soft/25 md:pr-10">
              <PostCard post={firstStory} className="h-full" />
            </div>
          )}
          {secondStory && (
            <div className="md:col-span-3 md:border-r md:border-rule-soft/25 md:pr-8">
              <PostCard post={secondStory} className="h-full" />
            </div>
          )}
          {thirdStory && (
            <div className="md:col-span-3">
              <PostCard post={thirdStory} className="h-full" />
            </div>
          )}
        </div>
      </section>

      {/* 更多要目 + 编辑台并排 */}
      <section className="mt-14 grid items-start gap-12 border-t border-rule-soft/40 pt-10 md:grid-cols-[1.5fr_1fr] md:gap-14">
        <div>
          <h2 className="border-b-2 border-rule pb-2 font-display text-[20px] font-bold text-ink-strong">
            更多文章
          </h2>
          <div className="divide-y divide-rule-soft/25">
            {rest.slice(0, 6).map((p) => (
              <PostCard key={p.slug} post={p} variant="compact" />
            ))}
          </div>
          <Link
            to="/archives"
            className="mt-6 inline-flex items-center gap-1.5 border-b border-ink/40 pb-0.5 font-ui text-[12px] font-semibold text-ink transition-colors hover:border-stamp hover:text-stamp"
          >
            查看全部 {visiblePosts.length} 篇存档
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* 编辑台 — 真实纯朴的编者近况，去除 Stats 仪表盘 */}
        <aside className="border-t border-rule-soft/30 pt-8 md:border-t-0 md:border-l md:border-rule-soft/25 md:pl-10 md:pt-0">
          <h2 className="border-b-2 border-rule pb-2 font-display text-[20px] font-bold text-ink-strong">
            编辑台
          </h2>
          <div className="mt-4">
            <blockquote className="font-serif text-[18px] leading-[1.75] text-ink-strong">
              “我总希望能给别人带来欢乐，但最终带来的几乎只是烦恼。”
            </blockquote>
            <p className="mt-3 font-ui text-[12px] text-ink-muted">
              —— Sy，把这里当草稿纸。
            </p>
          </div>

          {/* 最新随笔便签 */}
          {latestNote && (
            <div className="mt-8 border-t border-rule-soft/30 pt-6">
              <p className="font-ui text-[11px] font-semibold tracking-wider text-stamp">
                刚写下的随笔
              </p>
              <Link to="/notes" className="group mt-2 block">
                <p className="font-display text-[18px] font-semibold text-ink-strong transition-colors group-hover:text-stamp">
                  {latestNote.title}
                </p>
                <p className="mt-1.5 line-clamp-3 font-serif text-[14px] leading-[1.7] text-ink-body">
                  {latestNote.description}
                </p>
                <p className="mt-2.5 font-ui text-[11px] text-ink-muted">
                  {formatArticleDateline(latestNote.date)} · 进入便签本 →
                </p>
              </Link>
            </div>
          )}
        </aside>
      </section>

      <Ornament className="my-14" />

      {/* 版块目录 — 名录式真实排版，无 01/02 假序号 */}
      <section>
        <div className="flex items-baseline justify-between border-b-2 border-rule pb-2 mb-6">
          <h2 className="font-display text-[20px] font-bold text-ink-strong">
            版块目录
          </h2>
          <Link
            to="/categories"
            className="font-ui text-[12px] text-ink-muted hover:text-stamp"
          >
            全部版块 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/categories/${encodeURIComponent(c.name)}`}
              className="group flex items-baseline justify-between border-b border-rule-soft/25 py-2.5 transition-colors"
            >
              <span className="font-display text-[17px] font-semibold text-ink-strong transition-colors group-hover:text-stamp">
                {c.name}
              </span>
              <span className="font-ui text-[11.5px] text-ink-muted">
                {hanNumber(c.count)} 篇
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 关键词 — 纯文字流，无大色块徽章堆叠 */}
      <section className="mt-14">
        <h2 className="border-b-2 border-rule pb-2 font-display text-[20px] font-bold text-ink-strong mb-4">
          常用标签
        </h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2 font-serif text-[14.5px] leading-relaxed text-ink-body">
          {tags.map((t) => (
            <Link
              key={t.name}
              to={`/tags/${encodeURIComponent(t.name)}`}
              className="text-ink-body transition-colors hover:text-stamp hover:underline underline-offset-4"
            >
              #{t.name}
              <span className="ml-1 text-[11px] text-ink-muted">({t.count})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 尾注 — 替代原来花哨的 Wanted/Notice/Reply 3 联卡片 */}
      <section className="mt-16 border-t-2 border-b border-rule py-7 text-center">
        <p className="font-serif text-[15px] leading-[1.9] text-ink-body">
          没有固定的发刊周期，心情好就发，心情不好也发。一切以“想写”为准。
        </p>
        <p className="mt-2 font-serif text-[13.5px] text-ink-muted">
          如果想聊聊，随时可以通过{" "}
          <Link to="/about" className="text-ink-strong underline underline-offset-4 hover:text-stamp">
            邮件或 GitHub
          </Link>{" "}
          来信。我不一定回得快，但一定会读。
        </p>
      </section>
    </div>
  );
}
