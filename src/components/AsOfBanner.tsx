import { X } from "lucide-react";
import { posts } from "@/content/posts";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf } from "@/lib/as-of";
import { formatMastheadDate } from "@/lib/han-date";

/**
 * Banner shown above the masthead when `?as-of=YYYY-MM-DD` is active.
 * Communicates that the reader is browsing a back issue and offers a
 * one-click way to return to "today".
 */
export function AsOfBanner() {
  const { asOf, isActive, exit } = useAsOf();
  if (!isActive || !asOf) return null;

  const issueNo = filterByAsOf(posts, asOf).length;

  return (
    <div className="border-b-2 border-stamp/40 bg-[hsl(var(--stamp-soft))]/70">
      <div className="container flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-stamp md:text-[12px]">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-stamp" aria-hidden />
          时间机器 · Time Machine
        </span>
        <span className="font-serif text-[12px] normal-case tracking-normal text-ink-strong md:text-[13px]">
          正在翻阅 · {formatMastheadDate(asOf)} · 第 {issueNo} 期
        </span>
        <button
          type="button"
          onClick={exit}
          className="inline-flex items-center gap-1 border border-stamp/45 bg-paper/70 px-2 py-0.5 text-stamp transition-colors hover:bg-stamp hover:text-paper"
        >
          <X className="h-3 w-3" />
          退出
        </button>
      </div>
    </div>
  );
}
