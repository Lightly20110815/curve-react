import { MastheadWeather } from "@/components/MastheadWeather";
import { cn } from "@/lib/utils";
import { formatMastheadDate, formatIssueSeason } from "@/lib/han-date";

interface Props {
  issueNo: number;
  className?: string;
}

export function Masthead({ issueNo, className }: Props) {
  const today = new Date();
  return (
    <header className={cn("border-b border-rule/85", className)}>
      <div className="border-b border-rule-soft/55">
        <div className="container flex flex-wrap items-center justify-between gap-x-4 py-1 font-ui text-[12px] text-ink-muted md:text-[13px]">
          <span>第 {String(issueNo).padStart(3, "0")} 期</span>
          <span className="hidden font-serif text-[13px] text-ink-body md:block">
            {formatMastheadDate(today)}
          </span>
          <span>免费</span>
        </div>
      </div>

      <div className="container py-3 md:py-4">
        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[minmax(112px,1fr)_auto_minmax(112px,1fr)] md:gap-5">
          <div className="hidden flex-col items-start justify-center gap-1 md:flex">
            <span className="font-ui text-[12px] text-ink-muted">
              {formatIssueSeason(today)}
            </span>
            <span className="block h-px w-10 bg-rule-soft/70" />
            <span className="font-ui text-[12px] text-stamp">创刊于 2025</span>
          </div>

          <div className="text-center">
            <h1 className="font-masthead text-[clamp(30px,6.8vw,68px)] font-black leading-none text-ink-strong sm:whitespace-nowrap">
              The Curve Times
            </h1>
            <p className="mt-1 font-serif text-[clamp(14px,1.4vw,17px)] font-medium text-stamp">
              曲線時報
            </p>
          </div>

          <MastheadWeather className="hidden flex-col items-end justify-center gap-1 md:flex" />
        </div>
      </div>

      <div className="border-t border-rule-soft/55">
        <div className="container py-1 text-center font-serif text-[13px] text-ink-body md:text-[14px]">
          没有发刊周期。想写才出刊。
        </div>
      </div>
    </header>
  );
}
