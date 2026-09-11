import { useEffect, useState } from "react";
import { Ornament } from "@/components/Editorial";

const DATE_SY_LEAVES = "2026-07-24T00:00:00+08:00";
const DATE_EPHEIA_LEAVES = "2024-07-27T12:01:00+08:00";

function calculateDays(startDateStr: string) {
  const start = new Date(startDateStr).getTime();
  const now = new Date().getTime();
  const diff = now - start;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function EpheiaPage() {
  const [daysSy, setDaysSy] = useState(0);
  const [daysEpheia, setDaysEpheia] = useState(0);

  useEffect(() => {
    // 初始化并设置定时器以确保跨天时自动更新
    const update = () => {
      setDaysSy(calculateDays(DATE_SY_LEAVES));
      setDaysEpheia(calculateDays(DATE_EPHEIA_LEAVES));
    };
    
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
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
              <span className="font-display text-[64px] font-semibold leading-none tracking-tighter md:text-[88px]">
                {daysSy}
              </span>
              <span className="font-serif text-[16px] text-ink-muted">天</span>
            </div>
            <p className="font-ui text-[10px] font-medium tracking-[0.15em] uppercase text-ink-muted/70">
              Since Jul 24, 2026
            </p>
          </div>

          {/* 第二个倒计时：Epheia 离开这个世界 */}
          <div className="flex flex-col items-center justify-center space-y-5 relative md:before:absolute md:before:left-0 md:before:top-1/2 md:before:h-2/3 md:before:w-px md:before:-translate-y-1/2 md:before:bg-rule-soft/45">
            <p className="font-serif text-[16px] italic leading-relaxed text-ink-body">
              Epheia 离开这个世界已
            </p>
            <div className="flex items-baseline gap-2 text-stamp transition-colors hover:text-ink-strong">
              <span className="font-display text-[64px] font-semibold leading-none tracking-tighter md:text-[88px]">
                {daysEpheia}
              </span>
              <span className="font-serif text-[16px] text-ink-muted">天</span>
            </div>
            <p className="font-ui text-[10px] font-medium tracking-[0.15em] uppercase text-ink-muted/70">
              Since Jul 27, 2024
            </p>
          </div>

        </div>

      </div>
      <Ornament className="my-16 md:my-24" />
    </div>
  );
}
