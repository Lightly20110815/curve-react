import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Post } from "@/content/posts";
import { cn } from "@/lib/utils";

/**
 * 播出记录 —— 全部期目铺在一条时间轴上，像一段信号。
 *
 * 移植自 preview-home-v4-radio 的 buildWave()：
 * - 每一期一根竖条，以中轴线为中心，高度按阅读时长；
 * - 相邻两期间隔超过 30 天算一段「停播」，用斜线填平并标注天数
 *   （标注放不下时退成「N 天」，再放不下就不写，不让字压在信号上）；
 * - 指针滑过是一根读带磁头，靠近哪一期就吸到哪一期；
 *   落在停波段就报停播的第几天；
 * - 两处编辑注：开台那一期，和最近一轮集中播出。
 */

const DAY = 864e5;
const PLOT_H = 216;
const GAP_DAYS = 30;

const pad = (n: number) => String(n).padStart(2, "0");

/** 只取日期部分，按本地时区落地，避免 UTC 零点跨界。 */
function toDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dots(d: Date): string {
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

const barH = (minutes: number) => 12 + minutes * 7.2;

interface BarItem {
  post: Post;
  x: number;
  h: number;
}

interface GapItem {
  left: number;
  width: number;
  mid: number;
  days: number;
  span: number;
}

interface NoteItem {
  x: number;
  leadH: number;
  title: string;
  sub: string;
  flip: boolean;
}

type Readout = { kind: "post"; post: Post } | { kind: "quiet"; date: Date };

export function BroadcastWave({ posts, asOf }: { posts: Post[]; asOf?: string | null }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const [readout, setReadout] = useState<Readout | null>(null);
  const [head, setHead] = useState<{ x: number; label: string; flip: boolean } | null>(null);

  const model = useMemo(() => {
    if (posts.length === 0) return null;
    const asc = [...posts].reverse();
    const lead = posts[0];
    const end = asOf ? toDate(asOf) : new Date();
    end.setHours(0, 0, 0, 0);
    const first = asc[0];
    const firstDate = toDate(first.date);
    const span0 = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    const span1 = new Date(end.getFullYear(), end.getMonth() + 1, 1);
    const xOf = (d: Date) => ((d.getTime() - span0.getTime()) / (span1.getTime() - span0.getTime())) * 100;

    // 信号竖条：同日或相邻两天的期目各占一根
    const bars: BarItem[] = [];
    let prevX = -Infinity;
    for (const post of asc) {
      let x = xOf(toDate(post.date));
      if (x - prevX < 0.55) x = prevX + 0.55;
      prevX = x;
      bars.push({ post, x, h: barH(post.readingMinutes) });
    }

    // 停波段：间隔超过 30 天，信号是空的，用斜线填平
    const gaps: GapItem[] = [];
    for (let i = 0; i < asc.length - 1; i += 1) {
      const days = Math.round((toDate(asc[i + 1].date).getTime() - toDate(asc[i].date).getTime()) / DAY);
      if (days > GAP_DAYS) {
        const a = xOf(toDate(asc[i].date));
        const b = xOf(toDate(asc[i + 1].date));
        gaps.push({ left: a + 0.7, width: b - a - 1.4, mid: (a + b) / 2, days, span: b - a });
      }
    }

    // 编辑注：开台那一期，和最近这一轮集中播出
    const notes: NoteItem[] = [];
    const leadLineH = (minutes: number) => PLOT_H / 2 - barH(minutes) / 2 - 6;
    notes.push({ x: xOf(firstDate), leadH: leadLineH(first.readingMinutes), title: "开台", sub: first.title, flip: false });
    const leadDate = toDate(lead.date);
    const run = posts.filter((p) => (leadDate.getTime() - toDate(p.date).getTime()) / DAY <= 14);
    if (run.length >= 3) {
      const oldest = run[run.length - 1];
      const spanDays = Math.round((leadDate.getTime() - toDate(oldest.date).getTime()) / DAY) + 1;
      const before = asc[asc.indexOf(oldest) - 1];
      const silent = before ? Math.round((toDate(oldest.date).getTime() - toDate(before.date).getTime()) / DAY) : 0;
      notes.push({
        x: xOf(toDate(oldest.date)) - 0.8,
        leadH: PLOT_H / 2 - Math.max(...run.map((p) => barH(p.readingMinutes))) / 2 - 6,
        title: `${toDate(oldest.date).getMonth() + 1} 月 · ${spanDays} 天 ${run.length} 期`,
        sub: silent ? `停播 ${silent} 天之后` : "",
        flip: true,
      });
    }

    // 月份刻度：1 月和起始月写全，其余只写月份数字
    const months: { x: number; text: string; year: boolean }[] = [];
    for (let d = new Date(span0); d < span1; d.setMonth(d.getMonth() + 1)) {
      const year = d.getMonth() === 0 || d.getTime() === span0.getTime();
      months.push({ x: xOf(new Date(d)), text: year ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}` : String(d.getMonth() + 1), year });
    }

    return {
      asc,
      lead,
      end,
      bars,
      gaps,
      notes,
      months,
      todayX: xOf(end),
      daysSinceLead: Math.round((end.getTime() - leadDate.getTime()) / DAY),
      span0,
      span1,
    };
  }, [posts, asOf]);

  // 停播标注按可用宽度降级：完整 → 「N 天」 → 隐藏。直接操作 DOM，与预览一致。
  const fitGaps = useCallback(() => {
    const plot = plotRef.current;
    if (!plot || !model) return;
    const width = plot.clientWidth;
    plot.querySelectorAll<HTMLSpanElement>("[data-gap]").forEach((gap) => {
      const g = model.gaps[Number(gap.dataset.gap)];
      if (!g) return;
      const room = (g.span / 100) * width - 14;
      gap.hidden = false;
      gap.innerHTML = `停播 <b>${g.days}</b> 天`;
      if (gap.offsetWidth > room) gap.innerHTML = `<b>${g.days}</b> 天`;
      if (gap.offsetWidth > room) gap.hidden = true;
    });
  }, [model]);

  useLayoutEffect(() => {
    fitGaps();
    const onResize = () => fitGaps();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fitGaps]);

  // 窄屏时信号条横向滚动，默认停在最近的一端
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && el.scrollWidth > el.clientWidth + 1) el.scrollLeft = el.scrollWidth;
  }, [model]);

  if (!model) return null;

  const hotSlug = readout?.kind === "post" ? readout.post.slug : null;

  function quietText(date: Date): string {
    const { asc } = model!;
    const prev = [...asc].reverse().find((p) => toDate(p.date) <= date);
    const next = asc.find((p) => toDate(p.date) > date);
    if (!prev) return "还没开台";
    if (!next) return `最近一期之后的第 ${Math.round((date.getTime() - toDate(prev.date).getTime()) / DAY)} 天，音乐照常在播`;
    const gap = Math.round((toDate(next.date).getTime() - toDate(prev.date).getTime()) / DAY);
    const into = Math.max(1, Math.round((date.getTime() - toDate(prev.date).getTime()) / DAY));
    return gap > GAP_DAYS ? `停播中：${gap} 天里的第 ${into} 天` : "这一天没有新节目";
  }

  // 指针在信号上滑过就是一根读带磁头：靠近哪一期就吸到哪一期
  function onMove(e: React.PointerEvent) {
    const plot = plotRef.current;
    if (!plot || !model) return;
    const box = plot.getBoundingClientRect();
    const px = Math.min(box.width, Math.max(0, e.clientX - box.left));
    let best: BarItem | null = null;
    let bestDist = 14;
    for (const bar of model.bars) {
      const dist = Math.abs((bar.x / 100) * box.width - px);
      if (dist < bestDist) {
        best = bar;
        bestDist = dist;
      }
    }
    const atX = best ? (best.x / 100) * box.width : px;
    // 吸附时报那一期的真实日期（同日两期的竖条为了看得清稍微错开过）
    const date = best
      ? toDate(best.post.date)
      : new Date(model.span0.getTime() + (atX / box.width) * (model.span1.getTime() - model.span0.getTime()));
    setHead({ x: atX, label: dots(date), flip: atX > box.width * 0.82 });
    setReadout(best ? { kind: "post", post: best.post } : { kind: "quiet", date });
  }

  function onLeave() {
    setHead(null);
    setReadout(null);
  }

  const current: Readout = readout ?? { kind: "post", post: model.lead };
  const firstDate = toDate(model.asc[0].date);

  return (
    <section aria-labelledby="broadcast-wave-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-ink pb-3">
        <h2 id="broadcast-wave-title" className="font-display text-[24px] font-semibold leading-none text-ink-strong md:text-[27px]">
          播出记录
        </h2>
        <p className="font-ui text-[12px] text-ink-muted">
          自 {firstDate.getFullYear()} 年 {firstDate.getMonth() + 1} 月 {firstDate.getDate()} 日开台，共 {posts.length} 期，停播过 {model.gaps.length} 次
        </p>
      </div>

      <div ref={scrollRef} className="mt-7 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
        <div
          ref={plotRef}
          className={cn("relative h-[216px] min-w-[760px] touch-pan-y", hotSlug && "cursor-pointer")}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          onBlur={(e) => {
            if (!plotRef.current?.contains(e.relatedTarget as Node)) setReadout(null);
          }}
        >
          {/* 中轴线 */}
          <span className="absolute left-0 right-0 top-1/2 h-px bg-rule-soft/60" />

          {/* 停波段：斜线填平 */}
          {model.gaps.map((gap, i) => (
            <span
              key={`s${i}`}
              aria-hidden="true"
              className="absolute top-[calc(50%-8px)] h-4"
              style={{
                left: `${gap.left}%`,
                width: `${gap.width}%`,
                backgroundImage: "repeating-linear-gradient(135deg, hsl(var(--rule-soft)) 0 1px, transparent 1px 5px)",
              }}
            />
          ))}

          {/* 信号竖条 */}
          {model.bars.map((bar) => (
            <Link
              key={bar.post.slug}
              to={`/posts/${bar.post.slug}`}
              aria-label={`${dots(toDate(bar.post.date))}，${bar.post.title}，约 ${bar.post.readingMinutes} 分钟`}
              className={cn(
                "absolute top-1/2 w-[5px] -translate-x-1/2 -translate-y-1/2 bg-ink transition-opacity duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink",
                hotSlug && hotSlug !== bar.post.slug && "opacity-[0.22]",
              )}
              style={{ left: `${bar.x}%`, height: `${bar.h}px` }}
              onFocus={() => setReadout({ kind: "post", post: bar.post })}
            />
          ))}

          {/* 编辑注 */}
          {model.notes.map((note, i) => (
            <span
              key={`n${i}`}
              className={cn(
                "absolute top-0 whitespace-nowrap border-ink text-[12px] leading-[1.35] transition-opacity duration-150",
                note.flip ? "-translate-x-full border-r pr-2 text-right" : "border-l pl-2",
                head && "opacity-20",
              )}
              style={{ left: `${note.x}%`, height: `${note.leadH}px` }}
            >
              <b className="block font-semibold text-ink">{note.title}</b>
              <span className="text-ink-muted">{note.sub}</span>
            </span>
          ))}

          {/* 停播标注：内容由 fitGaps 按宽度降级写入 */}
          {model.gaps.map((gap, i) => (
            <span
              key={`g${i}`}
              data-gap={i}
              className="absolute top-[calc(50%-30px)] -translate-x-1/2 whitespace-nowrap text-[12px] text-ink-muted [&_b]:font-mono [&_b]:font-medium [&_b]:text-ink-body"
              style={{ left: `${gap.mid}%` }}
            />
          ))}

          {/* 今天 */}
          {model.daysSinceLead >= 0 && (
            <span className="absolute bottom-0 top-1/2 border-l border-dashed border-rule-soft" style={{ left: `${model.todayX}%` }}>
              <span className="absolute bottom-1 right-1.5 whitespace-nowrap font-ui text-[12px] text-ink-muted">
                {asOf ? `${model.end.getMonth() + 1} 月 ${model.end.getDate()} 日` : "今天"} · 距上一期 {model.daysSinceLead} 天
              </span>
            </span>
          )}

          {/* 读带磁头 */}
          {head && (
            <span className="pointer-events-none absolute bottom-0 top-0 border-l border-ink" style={{ left: `${head.x}px` }}>
              <span className={cn("absolute top-0 whitespace-nowrap bg-paper px-1 font-mono text-[12px] text-ink", head.flip ? "right-1.5" : "left-1.5")}>
                {head.label}
              </span>
            </span>
          )}
        </div>

        {/* 月份轴 */}
        <div className="relative h-[34px] min-w-[760px] border-t border-rule-soft/35" aria-hidden="true">
          {model.months.map((m, i) => (
            <span
              key={`m${i}`}
              className={cn("absolute top-2 border-l border-rule-soft/35 pl-[5px] font-mono text-[12px]", m.year ? "font-semibold text-ink" : "text-ink-muted")}
              style={{ left: `${m.x}%` }}
            >
              {m.text}
            </span>
          ))}
        </div>
      </div>

      {/* 读带读出 */}
      <p className="mt-2.5 flex min-h-7 flex-wrap items-baseline gap-x-4 gap-y-1 text-[15px] text-ink" aria-live="polite">
        {current.kind === "post" ? (
          <>
            <time dateTime={current.post.date.slice(0, 10)} className="font-mono text-[13px] text-ink-muted">
              {dots(toDate(current.post.date))}
            </time>
            <b className="font-semibold">{current.post.title}</b>
            <span className="font-ui text-[13px] text-ink-muted">
              {current.post.categories[0]} · 约 {current.post.readingMinutes} 分钟
            </span>
          </>
        ) : (
          <>
            <time className="font-mono text-[13px] text-ink-muted">{dots(current.date)}</time>
            <span className="font-ui text-[15px] text-ink-muted">{quietText(current.date)}</span>
          </>
        )}
      </p>
    </section>
  );
}
