import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Ornament } from "@/components/Editorial";
import { LifeProgress } from "@/components/LifeProgress";
import { TwikooComments } from "@/components/TwikooComments";
import { formatArticleDateline } from "@/lib/han-date";
import {
  getCountdownStatuses,
  type CountdownStatus,
} from "@/lib/countdown";
import { cn } from "@/lib/utils";

/** A single ticking time-unit cell. */
function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-[clamp(28px,5vw,44px)] font-bold leading-none tabular-nums text-ink-strong">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </span>
    </div>
  );
}

function CountdownCard({ status }: { status: CountdownStatus }) {
  const { event, days, hours, minutes, seconds, isPast, isToday } = status;

  return (
    <article
      className={cn(
        "relative border border-rule-soft/60 bg-paper-soft/50 p-6 transition-colors sm:p-7",
        isToday && "border-stamp bg-stamp/5",
        isPast && "opacity-60",
      )}
    >
      {event.emoji && (
        <span className="absolute right-5 top-5 text-[22px] leading-none" aria-hidden="true">
          {event.emoji}
        </span>
      )}

      <div className="flex items-baseline gap-2 pr-8">
        <h2 className="font-display text-[22px] font-bold text-ink-strong">{event.title}</h2>
        {event.repeat === "yearly" && (
          <span className="font-ui text-[10px] font-medium uppercase tracking-[0.12em] text-stamp">
            每年
          </span>
        )}
      </div>

      {event.note && (
        <p className="mt-1 font-serif text-[14px] leading-relaxed text-ink-muted">{event.note}</p>
      )}

      <p className="mt-2 font-ui text-[12px] tracking-wide text-ink-faded">
        {formatArticleDateline(status.target)}
      </p>

      <div className="mt-5 border-t border-rule-soft/40 pt-5">
        {isToday ? (
          <p className="font-display text-[26px] font-bold text-stamp">就是今天 🎉</p>
        ) : isPast ? (
          <p className="font-ui text-[14px] font-medium uppercase tracking-[0.12em] text-ink-muted">
            已过去 {days} 天
          </p>
        ) : (
          <div className="flex items-end gap-4 sm:gap-6">
            <Unit value={days} label="Days" />
            <span className="pb-5 font-mono text-[24px] text-ink-faded">:</span>
            <Unit value={hours} label="Hrs" />
            <span className="pb-5 font-mono text-[24px] text-ink-faded">:</span>
            <Unit value={minutes} label="Min" />
            <span className="pb-5 font-mono text-[24px] text-ink-faded">:</span>
            <Unit value={seconds} label="Sec" />
          </div>
        )}
      </div>
    </article>
  );
}

export default function CountdownPage() {
  const [statuses, setStatuses] = useState<CountdownStatus[]>(() => getCountdownStatuses());

  useEffect(() => {
    const tick = () => setStatuses(getCountdownStatuses());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const upcoming = statuses.filter((s) => !s.isPast);

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        kicker="COUNTDOWN · 倒计时"
        title="重要日期"
        description="距离那些值得期待的日子，还有多久。"
        align="center"
      />

      {statuses.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center text-ink-muted">
          <CalendarClock className="h-10 w-10 text-ink-faded" />
          <p className="mt-4 font-serif text-[16px]">还没有配置任何重要日期。</p>
        </div>
      ) : (
        <>
          {upcoming[0] && !upcoming[0].isToday && (
            <p className="mt-8 text-center font-serif text-[15px] text-ink-body">
              下一个：<span className="font-semibold text-stamp">{upcoming[0].event.title}</span>{" "}
              还有 <span className="font-mono font-bold tabular-nums text-ink-strong">{upcoming[0].days}</span> 天
            </p>
          )}

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {statuses.map((status) => (
              <CountdownCard key={status.event.title} status={status} />
            ))}
          </div>
        </>
      )}

      <div className="mt-12">
        <LifeProgress />
      </div>

      <Ornament className="my-section" />

      <TwikooComments pageKey="/pages/countdown" />
    </div>
  );
}
