/**
 * 时光机横幅 — URL 带 ?as-of=YYYY-MM-DD 时出现。
 */
import { ClockCounterClockwise, X } from "@phosphor-icons/react";
import { useAsOf } from "@/hooks/useAsOf";
import { formatArticleDateline } from "@/lib/han-date";

export function AsOfBanner() {
  const { asOf, isActive, exit } = useAsOf();
  if (!isActive || !asOf) return null;

  return (
    <div className="sticky top-16 z-30 border-b border-firefly/30 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-2.5 md:px-8">
        <p className="flex items-center gap-2 text-[13.5px] text-ink">
          <ClockCounterClockwise size={16} weight="light" className="shrink-0 text-firefly" />
          <span>
            你正在看 {formatArticleDateline(asOf)} 的花园。之后种下的文字暂时隐去了。
          </span>
        </p>
        <button
          type="button"
          onClick={exit}
          className="pressable flex shrink-0 items-center gap-1 rounded-full border border-line px-3 py-1 text-[12.5px] text-mist transition-colors hover:border-firefly/50 hover:text-firefly"
        >
          <X size={13} weight="bold" />
          回到现在
        </button>
      </div>
    </div>
  );
}
