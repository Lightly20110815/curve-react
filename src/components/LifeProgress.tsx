import { useEffect, useState } from "react";
import { getProgressItems, type ProgressItem } from "@/lib/progress";

/** A single labelled progress bar. */
function Bar({ item }: { item: ProgressItem }) {
  const percent = item.fraction * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[16px] font-bold text-ink-strong">{item.label}</span>
          <span className="font-ui text-[11px] uppercase tracking-[0.12em] text-ink-faded">
            {item.caption}
          </span>
        </div>
        <span className="font-mono text-[14px] font-bold tabular-nums text-stamp">
          {percent.toFixed(percent < 10 ? 1 : 0)}%
        </span>
      </div>

      <div
        className="mt-2 h-[6px] w-full overflow-hidden rounded-sm bg-rule-soft/40"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={item.label}
      >
        <div
          className="h-full origin-left rounded-sm bg-stamp transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-1.5 font-serif text-[12px] text-ink-muted">{item.remaining}</p>
    </div>
  );
}

/**
 * Life progress — today / this week / month / year / life as a stack of
 * bars that tick forward on their own. Personalize via `src/lib/progress.ts`.
 */
export function LifeProgress() {
  const [items, setItems] = useState<ProgressItem[]>(() => getProgressItems());

  useEffect(() => {
    const tick = () => setItems(getProgressItems());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="border border-rule-soft/60 bg-paper-soft/50 p-6 sm:p-7">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[20px] font-bold text-ink-strong">人生进度</h2>
        <span className="font-ui text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faded">
          LIFE · 进度
        </span>
      </div>
      <p className="mt-1 font-serif text-[13px] leading-relaxed text-ink-muted">
        时间一直在走，看看走到哪儿了。
      </p>

      <div className="mt-6 grid gap-5">
        {items.map((item) => (
          <Bar key={item.key} item={item} />
        ))}
      </div>
    </section>
  );
}
