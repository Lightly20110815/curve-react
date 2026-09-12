import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Compass,
  ChevronRight,
  Bookmark,
  X,
  Flame,
  Layers,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nowPlaying } from "@/lib/music-controller";

// 两个关键时间坐标
const DATE_EPHEIA_LEAVES_SY = "2026-07-24T00:00:00+08:00";
const DATE_EPHEIA_LEAVES_WORLD = "2026-07-27T12:01:00+08:00";

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

/** 拍立得木夹子小部件 */
function Clothespin({ className }: { className?: string }) {
  return (
    <div className={cn("relative z-20 flex flex-col items-center select-none pointer-events-none", className)}>
      <svg width="20" height="38" viewBox="0 0 20 38" fill="none" className="drop-shadow-md">
        {/* 左木腿 */}
        <rect x="2" y="1" width="6" height="36" rx="2" fill="#c69263" stroke="#845229" strokeWidth="1" />
        <rect x="3.5" y="3" width="3" height="32" rx="1" fill="#dfb083" opacity="0.6" />

        {/* 右木腿 */}
        <rect x="12" y="1" width="6" height="36" rx="2" fill="#d4a070" stroke="#845229" strokeWidth="1" />
        <rect x="13.5" y="3" width="3" height="32" rx="1" fill="#ecd0a8" opacity="0.6" />

        {/* 金属弹簧圈（横跨中央，银灰金属质感与高光） */}
        <rect x="4" y="12" width="12" height="6" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1" />
        <line x1="5" y1="15" x2="15" y2="15" stroke="#94a3b8" strokeWidth="1" />
        <circle cx="10" cy="15" r="1.5" fill="#f1f5f9" />
      </svg>
    </div>
  );
}

export default function EpheiaPage() {
  useLayoutEffect(() => {
    nowPlaying.setEpheiaMode(true);
    return () => nowPlaying.setEpheiaMode(false);
  }, []);

  // 1. Epheia 离开 Sy
  const [daysEpheiaLeavesSy, setDaysEpheiaLeavesSy] = useState(() =>
    calculateDays(DATE_EPHEIA_LEAVES_SY),
  );
  // 2. Epheia 离开这个世界 (按秒跳动)
  const [epheiaWorldTime, setEpheiaWorldTime] = useState<TimeBreakdown>(() =>
    calculateTimeBreakdown(DATE_EPHEIA_LEAVES_WORLD),
  );

  // 控制右侧小弹窗斜向滑入的入场动画
  const [cardMounted, setCardMounted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 控制独立弹窗从右往左划入到屏幕中间
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFocus, setModalFocus] = useState<
    "all" | "epheia_sy" | "epheia_world"
  >("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  // 实时计时器（每秒刷新）
  useEffect(() => {
    const tick = () => {
      setDaysEpheiaLeavesSy(calculateDays(DATE_EPHEIA_LEAVES_SY));
      setEpheiaWorldTime(calculateTimeBreakdown(DATE_EPHEIA_LEAVES_WORLD));
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // 页面加载后触发右侧小弹窗斜着飞入
  useEffect(() => {
    const timer = setTimeout(() => {
      setCardMounted(true);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // ESC 键监听
  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  return (
    <div className="relative overflow-hidden pt-10 pb-4 md:pt-14 md:pb-6">
      {/* 顶部标题与题记（限定在居中容器内） */}
      <div className="container max-w-4xl">
        <header className="max-w-xl text-left md:pt-6">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-stamp">
            <Bookmark className="h-3.5 w-3.5" />
            <span>EPHEIA · 依菲雅档案</span>
          </div>

          <h1 className="mt-4 font-display text-[42px] font-bold tracking-tight text-ink-strong md:text-[58px]">
            依菲雅
          </h1>

          <p className="mt-2 font-ui text-[12px] font-semibold uppercase tracking-[0.25em] text-ink-muted">
            The Still Summer of 2026
          </p>

          <p className="mt-6 font-serif text-[17px] italic leading-[1.9] text-ink-body">
            “日子照常一寸寸挪过去，而关于夏天的刻度，被安放在了视线的右侧。”
          </p>
        </header>
      </div>

      {/* ========================================================================= */}
      {/* 晾衣绳相片区：位于题记下方，一根绳子从左到右贯穿屏幕挂着照片 */}
      {/* ========================================================================= */}
      <section className="relative mt-32 w-full pb-2 pt-2 md:mt-36">
        {/* 贯穿屏幕两端的绳子容器（紧凑高度，消灭下方多余留白） */}
        <div className="relative h-[375px] w-full">
          {/* 1. 悬挂在绳子上的照片卡片（位于底层 z-10，绝不可能反遮挡绳子） */}
          <div className="absolute inset-x-0 top-[26px] z-10 flex justify-center gap-3 sm:gap-6 md:gap-8 lg:gap-10">
            {/* 照片 1：百合动漫 */}
            <div
              className="group relative"
              style={{
                transform: "rotate(-3deg)",
                transformOrigin: "top center",
              }}
            >
              {/* 拍立得照片卡片 */}
              <a
                href="https://www.bilibili.com/video/BV1XRn2z9Ehb/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block origin-top transition-transform duration-300 hover:scale-[1.03]"
              >
                {/* 拍立得边框 */}
                <div className="w-[110px] rounded-xs border-2 border-black/20 bg-[#fdfbf7] p-2 pb-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300 group-hover:shadow-[0_20px_35px_rgba(0,0,0,0.22)] dark:border-white/20 dark:bg-[#1a1a1a] sm:w-[170px] sm:p-2.5 sm:pb-3.5 md:w-[195px] md:p-3 md:pb-4 lg:w-[210px]">
                  {/* 照片画面 */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xs border border-black/10 bg-paper-warm">
                    <img
                      src="/images/epheia/mwem.jpg"
                      alt="Epheia 最喜欢的百合动漫"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  {/* 边框上的文字手写注释 */}
                  <div className="mt-2 px-1 text-center sm:mt-2.5">
                    <p className="font-serif text-[10.5px] font-medium text-ink-strong transition-colors group-hover:text-stamp sm:text-[12px] md:text-[13px]">
                      Epheia 最喜欢的百合动漫
                    </p>
                    <p className="mt-0.5 flex items-center justify-center gap-1 font-ui text-[8px] tracking-wider text-ink-muted sm:text-[9px] md:text-[10px]">
                      <span className="truncate max-w-[90px] sm:max-w-none">《私を喰べたい、ひとでなし》</span>
                      <ExternalLink className="h-2 w-2 opacity-60 sm:h-2.5 sm:w-2.5" />
                    </p>
                  </div>
                </div>
              </a>
            </div>

            {/* 照片 2：Euro Truck Simulator 2 游戏 */}
            <div
              className="group relative"
              style={{
                transform: "rotate(-0.5deg)",
                transformOrigin: "top center",
              }}
            >
              {/* 拍立得照片卡片 */}
              <a
                href="https://store.steampowered.com/app/227300/Euro_Truck_Simulator_2/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block origin-top transition-transform duration-300 hover:scale-[1.03]"
              >
                {/* 拍立得边框 */}
                <div className="w-[110px] rounded-xs border-2 border-black/20 bg-[#fdfbf7] p-2 pb-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300 group-hover:shadow-[0_20px_35px_rgba(0,0,0,0.22)] dark:border-white/20 dark:bg-[#1a1a1a] sm:w-[170px] sm:p-2.5 sm:pb-3.5 md:w-[195px] md:p-3 md:pb-4 lg:w-[210px]">
                  {/* 照片画面 */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xs border border-black/10 bg-paper-warm">
                    <img
                      src="/images/epheia/ets2.jpg"
                      alt="Epheia 喜欢的游戏 · Euro Truck Simulator 2"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  {/* 边框上的文字手写注释 */}
                  <div className="mt-2 px-1 text-center sm:mt-2.5">
                    <p className="font-serif text-[10.5px] font-medium text-ink-strong transition-colors group-hover:text-stamp sm:text-[12px] md:text-[13px]">
                      Epheia 喜欢的游戏
                    </p>
                    <p className="mt-0.5 flex items-center justify-center gap-1 font-ui text-[8px] tracking-wider text-ink-muted sm:text-[9px] md:text-[10px]">
                      <span>Euro Truck Simulator 2</span>
                      <ExternalLink className="h-2 w-2 opacity-60 sm:h-2.5 sm:w-2.5" />
                    </p>
                  </div>
                </div>
              </a>
            </div>

            {/* 照片 3：优米雅的炼金工房 */}
            <div
              className="group relative"
              style={{
                transform: "rotate(3deg)",
                transformOrigin: "top center",
              }}
            >
              {/* 拍立得照片卡片 */}
              <a
                href="https://store.steampowered.com/app/3123410/Atelier_Yumia_The_Alchemist_of_Memories__the_Envisioned_Land/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block origin-top transition-transform duration-300 hover:scale-[1.03]"
                title="优米雅的炼金工房 ～追忆之炼金术士与幻创之国～"
              >
                {/* 拍立得边框 */}
                <div className="w-[110px] rounded-xs border-2 border-black/20 bg-[#fdfbf7] p-2 pb-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300 group-hover:shadow-[0_20px_35px_rgba(0,0,0,0.22)] dark:border-white/20 dark:bg-[#1a1a1a] sm:w-[170px] sm:p-2.5 sm:pb-3.5 md:w-[195px] md:p-3 md:pb-4 lg:w-[210px]">
                  {/* 照片画面 */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xs border border-black/10 bg-paper-warm">
                    <img
                      src="/images/epheia/yumia.jpg"
                      alt="Epheia 喜欢的，，· 买断制原神？"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  {/* 边框上的文字手写注释 */}
                  <div className="mt-2 px-1 text-center sm:mt-2.5">
                    <p className="font-serif text-[10.5px] font-medium text-ink-strong transition-colors group-hover:text-stamp sm:text-[12px] md:text-[13px]">
                      Epheia 喜欢的，，
                    </p>
                    <p className="mt-0.5 flex items-center justify-center gap-1 font-ui text-[8px] tracking-wider text-ink-muted sm:text-[9px] md:text-[10px]">
                      <span>买断制原神？</span>
                      <ExternalLink className="h-2 w-2 opacity-60 sm:h-2.5 sm:w-2.5" />
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* 2. 全宽 SVG 绳索：图层 z-20，永远横贯在卡片之上，绝不会被卡片遮挡！ */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-12 w-full">
            <svg
              className="h-12 w-full overflow-visible"
              viewBox="0 0 1000 48"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* 绳索微阴影 */}
              <path
                d="M 0 21 Q 500 31 1000 21"
                stroke="rgba(0, 0, 0, 0.15)"
                strokeWidth="2.5"
                className="dark:stroke-black/50"
              />
              {/* 麻绳底色 */}
              <path
                d="M 0 20 Q 500 30 1000 20"
                stroke="#8d6e63"
                strokeWidth="2.5"
                className="opacity-95 dark:stroke-[#a1887f]"
              />
              {/* 麻绳编织螺旋纹理 */}
              <path
                d="M 0 20 Q 500 30 1000 20"
                stroke="#d7ccc8"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                className="opacity-80 dark:stroke-[#d7ccc8]/50"
              />
            </svg>
          </div>

          {/* 3. 木夹子：图层 z-30，最外层，正正好好夹在绳索与相框交界处 */}
          <div className="pointer-events-none absolute inset-x-0 top-[30px] z-30 flex justify-center gap-3 sm:gap-6 md:gap-8 lg:gap-10">
            {/* 夹子 1（动漫） */}
            <div
              className="flex w-[110px] justify-center sm:w-[170px] md:w-[195px] lg:w-[210px]"
              style={{
                transform: "rotate(-3deg)",
                transformOrigin: "top center",
              }}
            >
              <div className="-mt-[16px]">
                <Clothespin />
              </div>
            </div>

            {/* 夹子 2（欧卡游戏） */}
            <div
              className="flex w-[110px] justify-center sm:w-[170px] md:w-[195px] lg:w-[210px]"
              style={{
                transform: "rotate(-0.5deg)",
                transformOrigin: "top center",
              }}
            >
              <div className="-mt-[16px]">
                <Clothespin />
              </div>
            </div>

            {/* 夹子 3（优米雅） */}
            <div
              className="flex w-[110px] justify-center sm:w-[170px] md:w-[195px] lg:w-[210px]"
              style={{
                transform: "rotate(3deg)",
                transformOrigin: "top center",
              }}
            >
              <div className="-mt-[16px]">
                <Clothespin />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 1. 右侧小卡片（默认缩在右上角落，微露尖角，鼠标悬浮向左滑出，点击展开时光详情） */}
      {/* ========================================================================= */}
      <aside
        onClick={() => {
          setModalFocus("all");
          setModalOpen(true);
        }}
        className={cn(
          "group fixed right-0 top-24 z-30 w-[290px] cursor-pointer select-none rounded-xs border-2 border-rule-strong bg-paper p-5 sm:top-28 sm:w-[320px]",
          "shadow-[-8px_16px_36px_rgba(0,0,0,0.12),-2px_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[-8px_16px_36px_rgba(0,0,0,0.45)]",
          "transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)",
          // 触控与鼠标延展区，防止滑出过程中由于边缘位移导致丢失 hover
          "after:absolute after:inset-y-0 after:left-full after:w-16 after:pointer-events-auto",
          modalOpen
            ? "pointer-events-none translate-x-full opacity-0"
            : cardMounted
              ? "translate-x-[calc(100%-28px)] -rotate-6 opacity-95 hover:-translate-x-4 hover:rotate-0 hover:opacity-100 hover:border-stamp hover:shadow-[0_24px_50px_rgba(0,0,0,0.18)] sm:translate-x-[calc(100%-32px)] sm:hover:-translate-x-6"
              : "translate-x-full rotate-12 opacity-0",
        )}
        style={{ transformOrigin: "top right" }}
        title="点击展开两段光阴对望"
        role="button"
        tabIndex={0}
      >
        {/* 缩在角落时露出的微型图章标签（滑出时淡出） */}
        <div className="pointer-events-none absolute left-1.5 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 text-stamp opacity-80 transition-opacity duration-300 group-hover:opacity-0">
          <Compass className="h-3.5 w-3.5 animate-pulse" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] text-ink-muted">
            刻度
          </span>
        </div>

        {/* 卡片完整内容（悬浮滑出时淡入呈现） */}
        <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {/* 复古挂扣 / 图章条 */}
          <div className="flex items-center justify-between border-b border-dashed border-rule-soft/80 pb-3">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              <Compass className="h-3.5 w-3.5 text-stamp" />
              <span>EPHEIA · CHRONO</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-stamp/10 px-2 py-0.5 font-ui text-[10px] font-semibold text-stamp">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-stamp" />
              <span>实时跳动</span>
            </span>
          </div>

          {/* 倒计时 1：Epheia 离开 Sy（独立点击切换为单独该板块详情） */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setModalFocus("epheia_sy");
              setModalOpen(true);
            }}
            className="group/item mt-4 cursor-pointer rounded-xs p-2 transition-all hover:bg-paper-warm/80 hover:shadow-xs active:scale-[0.99]"
            title="点击查看「Epheia 离开 Sy」详情"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-between">
              <p className="font-serif text-[13px] italic text-ink-muted group-hover/item:text-stamp">
                Epheia 离开 Sy 已
              </p>
              <span className="font-mono text-[9px] uppercase text-ink-faded opacity-0 transition-opacity group-hover/item:opacity-100">
                查看单项 →
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5 text-stamp">
                <span className="font-display text-[34px] font-bold leading-none tabular-nums">
                  {daysEpheiaLeavesSy}
                </span>
                <span className="font-serif text-[14px] text-ink-muted">天</span>
              </div>
              <span className="font-mono text-[10px] text-ink-faded">2026.07.24</span>
            </div>
          </div>

          <div className="my-2.5 border-t border-dashed border-rule-soft/50" />

          {/* 倒计时 2：Epheia 离开这个世界（独立点击切换为单独该板块秒表详情） */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setModalFocus("epheia_world");
              setModalOpen(true);
            }}
            className="group/item cursor-pointer rounded-xs p-2 transition-all hover:bg-paper-warm/80 hover:shadow-xs active:scale-[0.99]"
            title="点击查看「Epheia 离开这个世界」秒表详情"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-between">
              <p className="font-serif text-[13px] italic text-ink-muted group-hover/item:text-stamp">
                Epheia 离开这个世界已
              </p>
              <span className="font-mono text-[9px] uppercase text-ink-faded opacity-0 transition-opacity group-hover/item:opacity-100">
                查看单项 →
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-stamp">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-[26px] font-bold leading-none tabular-nums">
                  {epheiaWorldTime.days}
                </span>
                <span className="font-serif text-[12px] text-ink-muted mr-1">天</span>
                <span className="font-mono text-[18px] font-bold tabular-nums">
                  {String(epheiaWorldTime.hours).padStart(2, "0")}:
                  {String(epheiaWorldTime.minutes).padStart(2, "0")}:
                  <span className="animate-pulse text-stamp">
                    {String(epheiaWorldTime.seconds).padStart(2, "0")}
                  </span>
                </span>
              </div>
            </div>
            <p className="mt-1 font-mono text-[10px] text-ink-faded">
              累计 {epheiaWorldTime.totalSeconds.toLocaleString()} 秒
            </p>
          </div>

          {/* 底部点击提示栏：点击展开光阴对望总览 */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setModalFocus("all");
              setModalOpen(true);
            }}
            className="mt-3 flex cursor-pointer items-center justify-between border-t border-rule-soft/40 pt-2.5 font-ui text-[11px] font-semibold text-stamp transition-colors hover:text-ink-strong"
            title="点击展开两段光阴对望总览"
          >
            <span>点击日期查看详情</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. 左侧注脚小卡片（默认缩在左上角落，微露尖角，鼠标悬浮向右滑出） */}
      {/* ========================================================================= */}
      <aside
        className={cn(
          "group fixed left-0 top-24 z-30 w-[240px] select-none rounded-xs border-2 border-rule-strong/80 bg-paper p-5 sm:top-28 sm:w-[268px] sm:p-6",
          "shadow-[8px_16px_36px_rgba(0,0,0,0.08),2px_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[8px_16px_36px_rgba(0,0,0,0.35)]",
          "transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)",
          // 触控与鼠标延展区，防止滑出过程中由于边缘位移导致丢失 hover
          "before:absolute before:inset-y-0 before:right-full before:w-16 before:pointer-events-auto",
          modalOpen
            ? "pointer-events-none -translate-x-full opacity-0"
            : cardMounted
              ? "translate-x-[calc(-100%+28px)] rotate-6 opacity-95 hover:translate-x-4 hover:rotate-0 hover:opacity-100 hover:border-stamp hover:shadow-[0_24px_50px_rgba(0,0,0,0.18)] sm:translate-x-[calc(-100%+32px)] sm:hover:translate-x-6"
              : "-translate-x-full -rotate-12 opacity-0",
        )}
        style={{ transformOrigin: "top left" }}
        aria-label="时光注脚"
      >
        {/* 缩在角落时露出的微型图章标签（滑出时淡出） */}
        <div className="pointer-events-none absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 text-stamp opacity-80 transition-opacity duration-300 group-hover:opacity-0">
          <Bookmark className="h-3.5 w-3.5" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] text-ink-muted">
            注脚
          </span>
        </div>

        {/* 卡片完整内容（悬浮滑出时淡入呈现） */}
        <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center justify-between border-b border-dashed border-rule-soft/60 pb-2.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              FOOTNOTE · 注脚
            </span>
            <span className="font-ui text-[9px] font-semibold uppercase tracking-wider text-stamp">
              2026 夏末
            </span>
          </div>

          <div className="mt-4 space-y-2 font-serif text-[13.5px] leading-relaxed sm:text-[14px]">
            <p className="text-ink-body">“夏天结束了。”</p>
            <p className="pl-3 text-ink-muted">“还会再来吗？”</p>
            <p className="pl-6 font-medium text-stamp">“还会，但 Epheia 不会了”</p>
          </div>
        </div>
      </aside>
      {/* 2. 独立弹窗：从右往左平滑滑入到屏幕正中间 */}
      {/* ========================================================================= */}
      {mounted &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-[120] flex items-center justify-center overflow-hidden p-4 sm:p-6",
              modalOpen ? "pointer-events-auto" : "pointer-events-none delay-700",
            )}
            role="dialog"
            aria-modal="true"
            aria-label="依菲雅时光详情弹窗"
          >
            {/* 全屏暗色遮罩：覆盖视口全高与底部页脚 */}
            <div
              className={cn(
                "absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-700 ease-in-out",
                modalOpen ? "opacity-100" : "opacity-0",
              )}
              onClick={() => setModalOpen(false)}
              aria-hidden="true"
            />

            {/* 原生纸质报刊风格弹窗卡片（从右侧划到屏幕中央） */}
            <div
              className={cn(
                "relative z-10 w-full max-w-2xl overflow-hidden rounded-xs border-2 border-rule bg-paper p-6 shadow-2xl md:p-8",
                // 核心动画：放缓收起与展开的滑动速率至 700ms，纯平移进出
                "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                modalOpen ? "translate-x-0" : "translate-x-[115vw]",
              )}
            >
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
                  onClick={() => setModalOpen(false)}
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
                  onClick={() => setModalFocus("epheia_sy")}
                  className={cn(
                    "flex items-center gap-1.5 border-b-2 px-4 py-2 font-ui text-[12px] font-semibold uppercase tracking-wider transition-colors",
                    modalFocus === "epheia_sy"
                      ? "border-stamp text-stamp"
                      : "border-transparent text-ink-muted hover:text-ink",
                  )}
                >
                  <span>Epheia 离开 Sy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalFocus("epheia_world")}
                  className={cn(
                    "flex items-center gap-1.5 border-b-2 px-4 py-2 font-ui text-[12px] font-semibold uppercase tracking-wider transition-colors",
                    modalFocus === "epheia_world"
                      ? "border-stamp text-stamp"
                      : "border-transparent text-ink-muted hover:text-ink",
                  )}
                >
                  <Flame className="h-3.5 w-3.5 text-stamp" />
                  <span>Epheia 离开这个世界</span>
                </button>
              </div>

              {/* 弹窗核心内容 */}
              <div className="py-7">
                {/* 模式 1: 两段光阴对望 (All) */}
                {modalFocus === "all" && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* 块 1：Epheia 离开 Sy */}
                    <div className="rounded-xs border border-rule-soft/50 bg-paper-soft/40 p-5 text-center">
                      <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                        RECORD 01
                      </p>
                      <p className="mt-2 font-serif text-[15px] italic text-ink-strong">
                        Epheia 离开 Sy 已
                      </p>
                      <div className="my-3 font-display text-[48px] font-bold leading-none text-stamp tabular-nums">
                        {daysEpheiaLeavesSy}{" "}
                        <span className="font-serif text-[16px] text-ink-muted">天</span>
                      </div>
                      <p className="font-mono text-[10px] text-ink-muted">Since 2026-07-24</p>
                    </div>

                    {/* 块 2：Epheia 离开这个世界 */}
                    <div className="rounded-xs border border-stamp/40 bg-stamp/5 p-5 text-center">
                      <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-stamp">
                        RECORD 02 · 实时秒钟
                      </p>
                      <p className="mt-2 font-serif text-[15px] italic text-ink-strong">
                        Epheia 离开这个世界已
                      </p>
                      <div className="my-3 font-display text-[30px] font-bold leading-none text-stamp tabular-nums sm:text-[34px]">
                        {epheiaWorldTime.days}
                        <span className="font-serif text-[13px] text-ink-muted">天 </span>
                        {String(epheiaWorldTime.hours).padStart(2, "0")}:
                        {String(epheiaWorldTime.minutes).padStart(2, "0")}:
                        <span className="animate-pulse">
                          {String(epheiaWorldTime.seconds).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-ink-muted">
                        累计 {epheiaWorldTime.totalSeconds.toLocaleString()} 秒
                      </p>
                    </div>
                  </div>
                )}

                {/* 模式 2: 单独展示 Epheia 离开 Sy */}
                {modalFocus === "epheia_sy" && (
                  <div className="text-center">
                    <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                      RECORD 01 · 告别之隙
                    </p>
                    <h3 className="mt-3 font-serif text-[20px] font-medium text-ink-strong">
                      Epheia 离开 Sy 已
                    </h3>
                    <div className="my-6 flex items-baseline justify-center gap-2">
                      <span className="font-display text-[84px] font-bold leading-none text-stamp tabular-nums md:text-[96px]">
                        {daysEpheiaLeavesSy}
                      </span>
                      <span className="font-serif text-[24px] text-ink-muted">天</span>
                    </div>
                    <p className="font-serif text-[15px] italic text-ink-body">
                      起始时刻：2026 年 7 月 24 日
                    </p>
                  </div>
                )}

                {/* 模式 3: 单独放大 Epheia 离开世界 (超大秒表跳动) */}
                {modalFocus === "epheia_world" && (
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

                    {/* 4 格大时钟 */}
                    <div className="my-6 grid grid-cols-4 gap-2 text-center sm:gap-3">
                      <div className="rounded-xs border border-rule-soft/40 bg-paper p-3 shadow-inner">
                        <span className="font-display text-[26px] font-bold leading-none text-stamp sm:text-[36px] tabular-nums">
                          {epheiaWorldTime.days}
                        </span>
                        <span className="mt-1 block font-ui text-[10px] font-medium uppercase text-ink-muted">
                          天 (Days)
                        </span>
                      </div>
                      <div className="rounded-xs border border-rule-soft/40 bg-paper p-3 shadow-inner">
                        <span className="font-mono text-[22px] font-semibold leading-none text-ink-strong sm:text-[30px] tabular-nums">
                          {String(epheiaWorldTime.hours).padStart(2, "0")}
                        </span>
                        <span className="mt-1 block font-ui text-[10px] font-medium uppercase text-ink-muted">
                          时 (Hrs)
                        </span>
                      </div>
                      <div className="rounded-xs border border-rule-soft/40 bg-paper p-3 shadow-inner">
                        <span className="font-mono text-[22px] font-semibold leading-none text-ink-strong sm:text-[30px] tabular-nums">
                          {String(epheiaWorldTime.minutes).padStart(2, "0")}
                        </span>
                        <span className="mt-1 block font-ui text-[10px] font-medium uppercase text-ink-muted">
                          分 (Min)
                        </span>
                      </div>
                      <div className="rounded-xs border border-stamp/40 bg-stamp/10 p-3 shadow-inner">
                        <span className="font-mono text-[22px] font-bold leading-none text-stamp sm:text-[30px] tabular-nums">
                          {String(epheiaWorldTime.seconds).padStart(2, "0")}
                        </span>
                        <span className="mt-1 block font-ui text-[10px] font-bold uppercase text-stamp">
                          秒 (Sec)
                        </span>
                      </div>
                    </div>

                    <div className="inline-block rounded-full border border-rule-soft bg-paper-warm/50 px-4 py-1.5 font-mono text-[12px] text-ink-muted">
                      起算时刻：2026-07-27 12:01 PM · 累计走过{" "}
                      <strong className="text-stamp tabular-nums">
                        {epheiaWorldTime.totalSeconds.toLocaleString()}
                      </strong>{" "}
                      秒
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
