import { cn } from "@/lib/utils";
import { formatMastheadDate, formatIssueSeason } from "@/lib/han-date";

interface Props {
  issueNo: number;
  totalIssues?: number;
  className?: string;
}

/**
 * The Curve Times masthead.
 *
 * Layout uses a 3-column grid (side · title · side) so the side ornaments
 * never overlap the centered nameplate at any breakpoint. The title is a
 * non-interactive heading — navigation to home is handled by the Nav bar
 * below the masthead instead, per editor's request.
 */
export function Masthead({ issueNo, totalIssues, className }: Props) {
  const today = new Date();
  return (
    <header className={cn("border-b-[3px] border-rule", className)}>
      {/* Edition strip */}
      <div className="border-b border-rule/70">
        <div className="container flex flex-wrap items-center justify-between gap-x-4 py-2 font-ui text-[11px] font-medium uppercase text-ink-muted">
          <span>VOL. I · No. {String(issueNo).padStart(3, "0")}</span>
          <span className="hidden font-serif text-[14px] font-medium normal-case text-ink-body md:block">
            {formatMastheadDate(today)}
          </span>
          <span>Price: Free · Forever</span>
        </div>
      </div>

      {/* Nameplate — 3-column grid keeps ornaments out of the title's path */}
      <div className="container py-6 md:py-8">
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(120px,1fr)_auto_minmax(120px,1fr)] md:gap-8">
          {/* Left ornament */}
          <div className="hidden flex-col items-start justify-center gap-1 md:flex">
            <span className="font-ui text-[12px] font-medium uppercase text-ink-muted">
              {formatIssueSeason(today)}
            </span>
            <span className="block h-px w-12 bg-rule-soft" />
            <span className="font-ui text-[12px] font-medium text-stamp">Est. 2025</span>
          </div>

          {/* Title — non-interactive */}
          <div className="text-center">
            <h1 className="whitespace-nowrap font-masthead text-[clamp(38px,7vw,96px)] font-black leading-[0.98] text-ink-strong">
              The Curve Times
            </h1>
            <p className="mt-2 font-serif text-[clamp(16px,1.8vw,20px)] font-medium text-stamp">
              曲線時報
            </p>
          </div>

          {/* Right ornament */}
          <div className="hidden flex-col items-end justify-center gap-1 md:flex">
            <span className="font-ui text-[12px] font-medium uppercase text-ink-muted">
              Edited from somewhere
            </span>
            <span className="block h-px w-12 bg-rule-soft" />
            <span className="font-ui text-[12px] font-medium text-stamp">
              {totalIssues ?? "—"} 篇
            </span>
          </div>
        </div>
      </div>

      {/* Tagline strap */}
      <div className="border-t border-rule">
        <div className="container flex items-center justify-center gap-3 py-2 text-center font-serif text-[13px] text-ink-muted md:text-[14px]">
          <span aria-hidden>✦</span>
          <span>A QUIET CORNER · 用代码与文字搭起来的家 · MMXXV—</span>
          <span aria-hidden>✦</span>
        </div>
      </div>
    </header>
  );
}
