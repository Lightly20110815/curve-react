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
    <header className={cn("border-b-2 border-rule/85", className)}>
      {/* Edition strip */}
      <div className="border-b border-rule-soft/55">
        <div className="container flex flex-wrap items-center justify-between gap-x-4 py-1.5 font-ui text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted md:text-[11px]">
          <span>VOL. I · No. {String(issueNo).padStart(3, "0")}</span>
          <span className="hidden font-serif text-[13px] font-medium normal-case text-ink-body md:block">
            {formatMastheadDate(today)}
          </span>
          <span>Free Edition · 免费发行</span>
        </div>
      </div>

      {/* Nameplate — 3-column grid keeps ornaments out of the title's path */}
      <div className="container py-4 md:py-5">
        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[minmax(112px,1fr)_auto_minmax(112px,1fr)] md:gap-6">
          {/* Left ornament */}
          <div className="hidden flex-col items-start justify-center gap-1 md:flex">
            <span className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              {formatIssueSeason(today)}
            </span>
            <span className="block h-px w-10 bg-rule-soft/70" />
            <span className="font-ui text-[11px] font-medium text-stamp">创刊于 2025</span>
          </div>

          {/* Title — non-interactive */}
          <div className="text-center">
            <h1 className="whitespace-nowrap font-masthead text-[clamp(34px,6vw,78px)] font-black leading-[0.98] text-ink-strong">
              The Curve Times
            </h1>
            <p className="mt-1.5 font-serif text-[clamp(15px,1.6vw,18px)] font-medium text-stamp">
              曲線時報
            </p>
          </div>

          {/* Right ornament */}
          <div className="hidden flex-col items-end justify-center gap-1 md:flex">
            <span className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              Somewhere · 编于某处
            </span>
            <span className="block h-px w-10 bg-rule-soft/70" />
            <span className="font-ui text-[11px] font-medium text-stamp">
              {totalIssues ?? "—"} 篇
            </span>
          </div>
        </div>
      </div>

      {/* Tagline strap */}
      <div className="border-t border-rule-soft/55">
        <div className="container py-1.5 text-center font-serif text-[12px] text-ink-muted md:text-[13px]">
          用代码与文字搭起来的家
        </div>
      </div>
    </header>
  );
}
