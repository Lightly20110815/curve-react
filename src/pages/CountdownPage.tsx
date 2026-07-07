/**
 * 花期 — 倒数日与人生进度。
 *
 * 上半：重要日子的倒计时卡片，每秒轻轻走一格；
 * 下半：今天/本周/本月/今年/人生 五条进度。
 */
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { getCountdownStatuses, type CountdownStatus } from "@/lib/countdown";
import { getProgressItems, type ProgressItem } from "@/lib/progress";
import { formatDotDate } from "@/lib/han-date";

export default function CountdownPage() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const statuses = getCountdownStatuses(now);
  const progress = getProgressItems(now);

  return (
    <div>
      <PageHeader
        title="花期"
        note="有些日子像花期一样，远远地看着它一天天近了。"
      />
      <div className="mx-auto max-w-5xl space-y-16 px-5 md:px-8">
        <section className="grid gap-4 sm:grid-cols-2">
          {statuses.map((s) => (
            <CountdownCard key={s.event.title} status={s} />
          ))}
        </section>

        <section>
          <h2 className="mb-6 text-[15px] font-bold tracking-wide text-mist">
            时间走到哪了
          </h2>
          <div className="space-y-7">
            {progress.map((item) => (
              <ProgressBar key={item.key} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function CountdownCard({ status }: { status: CountdownStatus }) {
  const { event, days, hours, minutes, seconds, isPast, isToday } = status;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-line bg-surface/60 p-6">
      {event.emoji && (
        <span aria-hidden className="absolute right-5 top-5 text-[20px] opacity-70">
          {event.emoji}
        </span>
      )}
      <h3 className="text-[18px] text-ink-strong">{event.title}</h3>
      {event.note && <p className="mt-1 text-[13.5px] text-mist">{event.note}</p>}

      <div className="mt-5">
        {isToday ? (
          <p className="text-[26px] font-bold text-firefly">就是今天</p>
        ) : isPast ? (
          <p className="text-[20px] text-mist">已过去</p>
        ) : (
          <p className="flex items-baseline gap-2">
            <span className="font-mono text-[38px] font-bold leading-none text-firefly">
              {days}
            </span>
            <span className="text-[14px] text-ink">天</span>
            <span className="font-mono text-[13px] tracking-wide text-mist">
              {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
          </p>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] tracking-wider text-mist">
        {formatDotDate(status.target)}
        {event.repeat === "yearly" ? " · 每年" : ""}
      </p>
    </article>
  );
}

function ProgressBar({ item }: { item: ProgressItem }) {
  const percent = Math.round(item.fraction * 1000) / 10;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] text-ink-strong">
          {item.label}
          <span className="ml-2 text-[12.5px] text-mist">{item.caption}</span>
        </p>
        <p className="font-mono text-[12.5px] text-firefly">{percent}%</p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${item.label}已过 ${percent}%`}
        className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-veil"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-firefly/70 to-firefly transition-[width] duration-1000 ease-linear"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[12.5px] text-mist">{item.remaining}</p>
    </div>
  );
}
