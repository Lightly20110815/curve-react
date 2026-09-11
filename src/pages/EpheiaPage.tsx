import { useEffect, useState } from "react";
import { Ornament } from "@/components/Editorial";

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

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
  };
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

  useEffect(() => {
    // 每一秒更新一次按秒计时的 Days2
    const tick = () => {
      setDaysSy(calculateDays(DATE_SY_LEAVES));
      setEpheiaTime(calculateTimeBreakdown(DATE_EPHEIA_LEAVES));
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-display text-[32px] font-bold leading-tight text-ink-strong md:text-[40px]">
          依菲雅
        </h1>
        <p className="mt-3 font-ui text-[11px] font-medium tracking-[0.25em] uppercase text-ink-muted">
          Epheia
        </p>

        <div className="mt-20 grid gap-16 border-y border-rule-soft/45 py-16 md:grid-cols-2 md:gap-8">
          {/* 第一个倒计时：Sy 离开 Epheia */}
          <div className="flex flex-col items-center justify-center space-y-5">
            <p className="font-serif text-[16px] italic leading-relaxed text-ink-body">
              Sy 离开 Epheia 已
            </p>
            <div className="flex items-baseline gap-2 text-stamp transition-colors hover:text-ink-strong">
              <span className="font-display text-[64px] font-semibold leading-none tracking-tighter md:text-[88px] tabular-nums">
                {daysSy}
              </span>
              <span className="font-serif text-[16px] text-ink-muted">天</span>
            </div>
            <p className="font-ui text-[10px] font-medium tracking-[0.15em] uppercase text-ink-muted/70">
              Since Jul 24, 2026
            </p>
          </div>

          {/* 第二个倒计时：Epheia 离开这个世界（按秒计时） */}
          <div className="relative flex flex-col items-center justify-center space-y-5 md:before:absolute md:before:left-0 md:before:top-1/2 md:before:h-2/3 md:before:w-px md:before:-translate-y-1/2 md:before:bg-rule-soft/45">
            <p className="font-serif text-[16px] italic leading-relaxed text-ink-body">
              Epheia 离开这个世界已
            </p>
            <div className="flex flex-wrap items-baseline justify-center gap-1 sm:gap-1.5 text-stamp transition-colors hover:text-ink-strong">
              <span className="font-display text-[44px] font-semibold leading-none tracking-tight sm:text-[54px] md:text-[64px] tabular-nums">
                {epheiaTime.days}
              </span>
              <span className="font-serif text-[14px] text-ink-muted mr-1 sm:mr-2">天</span>

              <span className="font-mono text-[26px] font-semibold leading-none sm:text-[32px] md:text-[38px] tabular-nums">
                {String(epheiaTime.hours).padStart(2, "0")}
              </span>
              <span className="font-serif text-[12px] text-ink-muted mr-1">时</span>

              <span className="font-mono text-[26px] font-semibold leading-none sm:text-[32px] md:text-[38px] tabular-nums">
                {String(epheiaTime.minutes).padStart(2, "0")}
              </span>
              <span className="font-serif text-[12px] text-ink-muted mr-1">分</span>

              <span className="font-mono text-[26px] font-semibold leading-none sm:text-[32px] md:text-[38px] tabular-nums text-stamp">
                {String(epheiaTime.seconds).padStart(2, "0")}
              </span>
              <span className="font-serif text-[12px] text-ink-muted">秒</span>
            </div>
            <p className="font-ui text-[10px] font-medium tracking-[0.15em] uppercase text-ink-muted/70">
              Since Jul 27, 2026 12:01 PM · 累计 {epheiaTime.totalSeconds.toLocaleString()} 秒
            </p>
          </div>
        </div>
      </div>
      <Ornament className="my-16 md:my-24" />
    </div>
  );
}
