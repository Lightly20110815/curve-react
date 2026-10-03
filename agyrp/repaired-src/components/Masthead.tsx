import { MastheadWeather } from "@/components/MastheadWeather";
import { cn } from "@/lib/utils";
import { formatMastheadDate, formatIssueSeason } from "@/lib/han-date";

interface Props {
  issueNo: number;
  className?: string;
}

/**
 * 修复版 Masthead (已移除 AI 动态篡改标题与打字机光标)
 *
 * 核心整改：
 * 1. 刊名绝对固定为 "The Curve Times · 曲線時報"，不再调用模型退格换词；
 * 2. 全页零打字机动画、零闪烁光标；
 * 3. Tagline 改为稳定的办刊人寄语；
 * 4. 彻底消除加载抖动（CLS）与无效网络请求。
 */
export function Masthead({ issueNo, className }: Props) {
  const today = new Date();

  return (
    <header className={cn("border-b border-rule/85", className)}>
      {/* Edition strip */}
      <div className="border-b border-rule-soft/55">
        <div className="container flex flex-wrap items-center justify-between gap-x-4 py-1 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted md:text-[12px]">
          <span>VOL. I · No. {String(issueNo).padStart(3, "0")}</span>
          <span className="hidden font-serif text-[13px] font-medium normal-case text-ink-body md:block">
            {formatMastheadDate(today)}
          </span>
          <span>Free Edition · 免费发行</span>
        </div>
      </div>

      {/* Nameplate — 3-column grid keeps ornaments out of the title's path */}
      <div className="container py-4 md:py-5">
        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[minmax(112px,1fr)_auto_minmax(112px,1fr)] md:gap-6">
          {/* Left ornament */}
          <div className="hidden flex-col items-start justify-center gap-1 md:flex">
            <span className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              {formatIssueSeason(today)}
            </span>
            <span className="block h-px w-10 bg-rule-soft/70" />
            <span className="font-ui text-[11px] font-medium text-stamp">创刊于 2025</span>
          </div>

          {/* Title — static, noble typography */}
          <div className="text-center">
            <h1 className="font-masthead text-[clamp(34px,7vw,70px)] font-black leading-none text-ink-strong tracking-normal sm:whitespace-nowrap">
              The Curve Times
            </h1>
            <p className="mt-1.5 font-serif text-[clamp(15px,1.5vw,18px)] font-medium tracking-[0.3em] text-stamp indent-[0.3em]">
              曲線時報
            </p>
          </div>

          {/* Right ornament — live weather */}
          <MastheadWeather className="hidden flex-col items-end justify-center gap-1 md:flex" />
        </div>
      </div>

      {/* Fixed human tagline strap */}
      <div className="border-t border-rule-soft/55 bg-paper-soft/30">
        <div className="container py-1.5 text-center font-serif text-[12.5px] text-ink-muted md:text-[13px]">
          一份个人早报 —— 用代码与文字搭起来的家
        </div>
      </div>
    </header>
  );
}
