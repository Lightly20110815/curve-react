import { useEffect, useState } from "react";
import {
  Clock,
  Maximize2,
  X,
  Sparkles,
  Calendar,
  Layers,
  Flame,
  Compass,
} from "lucide-react";
import { Ornament } from "@/components/Editorial";
import { cn } from "@/lib/utils";

const DATE_SY_LEAVES = "2026-07-24T00:00:00+08:00";
const DATE_EPHEIA_LEAVES = "2026-07-27T12:01:00+08:00";

interface TimeBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

function calculateTimeBreakdown(startDateStr: string): TimeBreakdown {
  const start = new Date(startDateStr).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - start);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds };
}

function calculateDays(startDateStr: string): number {
  const start = new Date(startDateStr).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - start);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function EpheiaPage() {
  const [daysSy, setDaysSy] = useState(() => calculateDays(DATE_SY_LEAVES));
  const [epheiaTime, setEpheiaTime] = useState<TimeBreakdown>(() =>
    calculateTimeBreakdown(DATE_EPHEIA_LEAVES),
  );

  // 弹窗状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFocus, setModalFocus] = useState<"all" | "sy" | "epheia">("all");

  useEffect(() => {
    const tick = () => {
      setDaysSy(calculateDays(DATE_SY_LEAVES));
      setEpheiaTime(calculateTimeBreakdown(DATE_EPHEIA_LEAVES));
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // ESC 键监听与锁屏
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const openModal = (focus: "all" | "sy" | "epheia" = "all") => {
    setModalFocus(focus);
    setIsModalOpen(true);
  };

  return (
    <div className="container relative py-12 md:py-20">
      {/* 头部标题区：融入报刊风格与现代微交互 */}
      <header className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-stamp/30 bg-stamp/5 px-3 py-1 text-stamp">
          <Sparkles className="h-3 w-3" />
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.2em]">
            MEMORIAL CHRONOMETER · 档案刻度
          </span>
        </div>

        <h1 className="mt-4 font-display text-[36px] font-bold tracking-tight text-ink-strong md:text-[50px]">
          依菲雅 · Epheia
        </h1>

        <p className="mx-auto mt-3 max-w-lg font-serif text-[15px] italic leading-relaxed text-ink-muted md:text-[17px]">
          “有些告别不会随着白昼褪色。两个定格于 2026 夏天的坐标，在此被时间一秒一秒丈量。”
        </p>

        {/* 顶部操作：唤起沉浸式弹窗 */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => openModal("all")}
            className="group inline-flex items-center gap-2 rounded-full border border-rule-soft bg-paper-soft px-4 py-1.5 font-ui text-[12px] font-medium tracking-wide text-ink-strong shadow-xs transition-all hover:border-stamp hover:bg-stamp hover:text-paper"
          >
            <Maximize2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            <span>开启全屏沉浸守望浮窗</span>
          </button>
        </div>
      </header>

      {/* 核心展示区：实体卡片风格设计 (Card-Style) */}
      <section className="mt-14 grid gap-8 md:grid-cols-2 lg:gap-10">
        {/* 卡片 1：Sy 离开 Epheia */}
        <article
          onClick={() => openModal("sy")}
          className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xs border-2 border-rule-soft/60 bg-paper-soft/40 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-stamp hover:bg-paper hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.3)] md:p-9"
        >
          {/* 复古票据撕角装饰 */}
          <div className="pointer-events-none absolute -right-3 -top-3 h-8 w-8 rounded-full border border-rule-soft/50 bg-paper transition-colors group-hover:border-stamp" />

          <div>
            <div className="flex items-center justify-between border-b border-dashed border-rule-soft/60 pb-4">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted">
                <Calendar className="h-3.5 w-3.5 text-stamp" />
                <span>ARCHIVE NO. 01</span>
              </div>
              <span className="font-ui text-[11px] font-medium uppercase tracking-widest text-stamp/80">
                静默按日累加
              </span>
            </div>

            <div className="mt-6">
              <span className="font-serif text-[17px] font-medium italic text-ink-strong">
                Sy 离开 Epheia 已
              </span>

              <div className="my-6 flex items-baseline gap-3">
                <span className="font-display text-[64px] font-bold leading-none tracking-tighter text-stamp transition-transform duration-300 group-hover:scale-[1.02] md:text-[84px] tabular-nums">
                  {daysSy}
                </span>
                <span className="font-serif text-[20px] font-medium text-ink-muted">天</span>
              </div>

              <p className="font-serif text-[14px] leading-relaxed text-ink-body">
                关于那次转身后的光阴，像泛黄纸页上的折痕，在日历上一格格拉长。
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-rule-soft/30 pt-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
              Since 2026.07.24
            </span>
            <span className="inline-flex items-center gap-1 font-ui text-[12px] font-semibold text-stamp group-hover:underline">
              <span>查看沉浸卡片</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </article>

        {/* 卡片 2：Epheia 离开这个世界（实时按秒时计） */}
        <article
          onClick={() => openModal("epheia")}
          className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xs border-2 border-rule-soft/60 bg-paper-soft/40 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-stamp hover:bg-paper hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.3)] md:p-9"
        >
          {/* 复古票据撕角装饰 */}
          <div className="pointer-events-none absolute -right-3 -top-3 h-8 w-8 rounded-full border border-rule-soft/50 bg-paper transition-colors group-hover:border-stamp" />

          <div>
            <div className="flex items-center justify-between border-b border-dashed border-rule-soft/60 pb-4">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted">
                <Clock className="h-3.5 w-3.5 text-stamp" />
                <span>CHRONO NO. 02</span>
              </div>
              <div className="flex items-center gap-1.5 font-ui text-[11px] font-semibold uppercase tracking-wider text-stamp">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-stamp opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-stamp" />
                </span>
                <span>按秒实时跳动</span>
              </div>
            </div>

            <div className="mt-6">
              <span className="font-serif text-[17px] font-medium italic text-ink-strong">
                Epheia 离开这个世界已
              </span>

              {/* 仪表盘式 4 格时间单元 */}
              <div className="my-6 grid grid-cols-4 gap-2 text-center sm:gap-3">
                <div className="rounded-xs border border-rule-soft/40 bg-paper p-2.5 shadow-inner sm:p-3">
                  <span className="font-display text-[26px] font-bold leading-none text-stamp sm:text-[34px] md:text-[40px] tabular-nums">
                    {epheiaTime.days}
                  </span>
                  <span className="mt-1 block font-ui text-[10px] font-medium uppercase text-ink-muted">
                    天 · Days
                  </span>
                </div>
                <div className="rounded-xs border border-rule-soft/40 bg-paper p-2.5 shadow-inner sm:p-3">
                  <span className="font-mono text-[22px] font-semibold leading-none text-ink-strong sm:text-[28px] md:text-[32px] tabular-nums">
                    {String(epheiaTime.hours).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block font-ui text-[10px] font-medium uppercase text-ink-muted">
                    时 · Hrs
                  </span>
                </div>
                <div className="rounded-xs border border-rule-soft/40 bg-paper p-2.5 shadow-inner sm:p-3">
                  <span className="font-mono text-[22px] font-semibold leading-none text-ink-strong sm:text-[28px] md:text-[32px] tabular-nums">
                    {String(epheiaTime.minutes).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block font-ui text-[10px] font-medium uppercase text-ink-muted">
                    分 · Min
                  </span>
                </div>
                <div className="rounded-xs border border-stamp/40 bg-stamp/5 p-2.5 shadow-inner sm:p-3">
                  <span className="font-mono text-[22px] font-bold leading-none text-stamp sm:text-[28px] md:text-[32px] tabular-nums">
                    {String(epheiaTime.seconds).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block font-ui text-[10px] font-bold uppercase text-stamp">
                    秒 · Sec
                  </span>
                </div>
              </div>

              <div className="rounded-xs bg-paper-warm/60 px-3 py-1.5 font-mono text-[11px] text-ink-muted">
                已累计走过{" "}
                <span className="font-bold text-stamp tabular-nums">
                  {epheiaTime.totalSeconds.toLocaleString()}
                </span>{" "}
                秒
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-rule-soft/30 pt-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
              Since 2026.07.27 12:01 PM
            </span>
            <span className="inline-flex items-center gap-1 font-ui text-[12px] font-semibold text-stamp group-hover:underline">
              <span>查看秒级浮窗</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </article>
      </section>

      {/* 底部装饰与说明 */}
      <footer className="mt-16 text-center">
        <Ornament className="my-10 md:my-16" />
        <p className="font-ui text-[11px] uppercase tracking-[0.25em] text-ink-muted">
          Light and memories woven into the curve of time
        </p>
      </footer>

      {/* ========================================================================= */}
      {/* 沉浸式弹窗 (Modal View) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md transition-all sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* 背景暗色遮罩，点击关闭 */}
          <div
            className="absolute inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* 弹窗主体卡片 */}
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xs border-2 border-rule bg-paper p-6 shadow-2xl md:p-8">
            {/* 顶栏控制条 */}
            <div className="flex items-center justify-between border-b border-rule-soft/60 pb-4">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-stamp" />
                <span className="font-masthead text-[15px] font-bold tracking-tight text-ink-strong">
                  EPHEIA CHRONOMETER · 时光浮窗
                </span>
              </div>

              {/* 关闭按钮 */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-ink-muted transition-colors hover:bg-paper-warm hover:text-ink-strong"
                aria-label="关闭弹窗"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 弹窗内部 Tab 切换器 */}
            <div className="mt-5 flex border-b border-rule-soft/40">
              <button
                type="button"
                onClick={() => setModalFocus("all")}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-2 font-ui text-[12px] font-semibold uppercase tracking-wider transition-colors",
                  modalFocus === "all"
                    ? "border-stamp text-stamp"
                    : "border-transparent text-ink-muted hover:text-ink",
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>两段光阴对望</span>
              </button>
              <button
                type="button"
                onClick={() => setModalFocus("sy")}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-2 font-ui text-[12px] font-semibold uppercase tracking-wider transition-colors",
                  modalFocus === "sy"
                    ? "border-stamp text-stamp"
                    : "border-transparent text-ink-muted hover:text-ink",
                )}
              >
                <span>Sy 离开 Epheia</span>
              </button>
              <button
                type="button"
                onClick={() => setModalFocus("epheia")}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-2 font-ui text-[12px] font-semibold uppercase tracking-wider transition-colors",
                  modalFocus === "epheia"
                    ? "border-stamp text-stamp"
                    : "border-transparent text-ink-muted hover:text-ink",
                )}
              >
                <Flame className="h-3.5 w-3.5 text-stamp" />
                <span>Epheia 离开这个世界</span>
              </button>
            </div>

            {/* 弹窗核心内容 */}
            <div className="py-8">
              {/* 模式 1: 全部对望 (All) */}
              {modalFocus === "all" && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-xs border border-rule-soft/50 bg-paper-soft/40 p-5 text-center">
                    <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      RECORD 01
                    </p>
                    <p className="mt-2 font-serif text-[15px] italic text-ink-strong">
                      Sy 离开 Epheia 已
                    </p>
                    <div className="my-3 font-display text-[50px] font-bold leading-none text-stamp tabular-nums">
                      {daysSy} <span className="font-serif text-[16px] text-ink-muted">天</span>
                    </div>
                    <p className="font-mono text-[10px] text-ink-muted">Since 2026-07-24</p>
                  </div>

                  <div className="rounded-xs border border-stamp/40 bg-stamp/5 p-5 text-center">
                    <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-stamp">
                      RECORD 02 · 实时秒钟
                    </p>
                    <p className="mt-2 font-serif text-[15px] italic text-ink-strong">
                      Epheia 离开这个世界已
                    </p>
                    <div className="my-3 font-display text-[32px] font-bold leading-none text-stamp sm:text-[36px] tabular-nums">
                      {epheiaTime.days}
                      <span className="font-serif text-[13px] text-ink-muted">天 </span>
                      {String(epheiaTime.hours).padStart(2, "0")}:
                      {String(epheiaTime.minutes).padStart(2, "0")}:
                      <span className="animate-pulse">{String(epheiaTime.seconds).padStart(2, "0")}</span>
                    </div>
                    <p className="font-mono text-[10px] text-ink-muted">
                      累计 {epheiaTime.totalSeconds.toLocaleString()} 秒
                    </p>
                  </div>
                </div>
              )}

              {/* 模式 2: 单独放大 Sy 离开 Epheia */}
              {modalFocus === "sy" && (
                <div className="text-center">
                  <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                    RECORD 01 · 永恒的距离
                  </p>
                  <h3 className="mt-3 font-serif text-[20px] font-medium text-ink-strong">
                    Sy 离开 Epheia 已
                  </h3>
                  <div className="my-6 flex items-baseline justify-center gap-2">
                    <span className="font-display text-[96px] font-bold leading-none text-stamp tabular-nums">
                      {daysSy}
                    </span>
                    <span className="font-serif text-[24px] text-ink-muted">天</span>
                  </div>
                  <p className="font-serif text-[15px] italic text-ink-body">
                    起始点：2026 年 7 月 24 日
                  </p>
                </div>
              )}

              {/* 模式 3: 单独放大 Epheia 离开世界 (超大秒表跳动) */}
              {modalFocus === "epheia" && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 text-stamp">
                    <span className="h-2 w-2 animate-ping rounded-full bg-stamp" />
                    <span className="font-ui text-[11px] font-bold uppercase tracking-[0.18em]">
                      LIVE PRECISION CHRONOMETER
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-[20px] font-medium text-ink-strong">
                    Epheia 离开这个世界已
                  </h3>

                  <div className="my-6 flex flex-wrap items-baseline justify-center gap-2 text-stamp">
                    <span className="font-display text-[64px] font-bold leading-none tabular-nums md:text-[76px]">
                      {epheiaTime.days}
                    </span>
                    <span className="font-serif text-[18px] text-ink-muted mr-3">天</span>
                    <span className="font-mono text-[42px] font-semibold leading-none tabular-nums md:text-[50px]">
                      {String(epheiaTime.hours).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-[14px] text-ink-muted mr-1">时</span>
                    <span className="font-mono text-[42px] font-semibold leading-none tabular-nums md:text-[50px]">
                      {String(epheiaTime.minutes).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-[14px] text-ink-muted mr-1">分</span>
                    <span className="font-mono text-[42px] font-bold leading-none text-stamp tabular-nums md:text-[50px]">
                      {String(epheiaTime.seconds).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-[14px] text-ink-muted">秒</span>
                  </div>

                  <div className="inline-block rounded-full border border-rule-soft bg-paper-warm/50 px-4 py-1.5 font-mono text-[12px] text-ink-muted">
                    起算时刻：2026-07-27 12:01 PM · 累计走过{" "}
                    <strong className="text-stamp tabular-nums">
                      {epheiaTime.totalSeconds.toLocaleString()}
                    </strong>{" "}
                    秒
                  </div>
                </div>
              )}
            </div>

            {/* 弹窗底栏 */}
            <div className="flex items-center justify-between border-t border-rule-soft/40 pt-4 font-ui text-[11px] text-ink-muted">
              <span>按 ESC 或点击遮罩可随时关闭</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="font-semibold text-stamp underline-offset-4 hover:underline"
              >
                收起浮窗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
