/**
 * 关于 — 园丁。
 */
import { GithubLogo, EnvelopeSimple } from "@phosphor-icons/react";
import { PageHeader } from "@/components/PageHeader";
import {
  aboutIntroHeading,
  aboutIntroParagraphs,
  aboutPullQuote,
  aboutColophonEntries,
  aboutContactCopy,
} from "@/lib/about-profile";
import { site, siteContactMailHref } from "@/lib/site";

export default function AboutPage() {
  return (
    <div>
      <PageHeader title="园丁" note="关于这座园子，和照看它的人。" />
      <div className="mx-auto max-w-3xl space-y-16 px-5 md:px-8">
        {/* 自述 */}
        <section>
          <h2 className="text-[24px] font-bold text-ink-strong">{aboutIntroHeading}</h2>
          <div className="mt-5 space-y-5">
            {aboutIntroParagraphs.map((p) => (
              <p key={p.slice(0, 12)} className="text-[16px] leading-loose text-ink">
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* 引言 */}
        <section>
          <blockquote className="border-l-2 border-firefly pl-5 text-[19px] leading-loose text-ink-strong">
            {aboutPullQuote.content}
          </blockquote>
          <p className="mt-3 pl-5 font-mono text-[11.5px] tracking-wider text-mist">
            {aboutPullQuote.attribution}
          </p>
        </section>

        {/* 园子的工具 */}
        <section>
          <h2 className="mb-6 text-[15px] font-bold tracking-wide text-mist">
            园子是怎么搭起来的
          </h2>
          <dl className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {aboutColophonEntries.map((entry) => (
              <div
                key={entry.label}
                className="flex items-baseline justify-between gap-4 border-b border-line pb-3"
              >
                <dt className="shrink-0 text-[13.5px] text-mist">{entry.label}</dt>
                <dd className="text-right text-[14.5px] text-ink-strong">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 来信 */}
        <section className="rounded-2xl border border-line bg-surface/60 p-6 md:p-8">
          <h2 className="text-[19px] text-ink-strong">{aboutContactCopy.heading}</h2>
          <p className="mt-2.5 max-w-lg text-[14.5px] leading-relaxed text-mist">
            {aboutContactCopy.body}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={siteContactMailHref}
              className="pressable inline-flex items-center gap-2 rounded-full bg-firefly px-5 py-2 text-[14px] text-page transition-colors duration-200 hover:bg-firefly-deep"
            >
              <EnvelopeSimple size={16} weight="bold" />
              写信给我
            </a>
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="pressable inline-flex items-center gap-2 rounded-full border border-line px-5 py-2 text-[14px] text-ink transition-colors duration-200 hover:border-firefly/50 hover:text-firefly"
            >
              <GithubLogo size={16} weight="light" />
              GitHub
            </a>
          </div>
        </section>

        <div className="pb-4" />
      </div>
    </div>
  );
}
