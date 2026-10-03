import { Github, Mail } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Kicker, PullQuote } from "@/components/Editorial";
import {
  aboutColophonEntries,
  aboutContactCopy,
  aboutIntroHeading,
  aboutIntroParagraphs,
  aboutPullQuote,
} from "@/lib/about-profile";
import { site, siteEmailHref } from "@/lib/site";

export default function AboutPage() {
  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        title="关于这份小报"
        description="代码、文章，和那些不太像样的情绪。"
      />

      <div className="mx-auto mt-12 max-w-prose">
        {/* Editor's bio */}
        <section>
          <Kicker>关于</Kicker>
          <h2 className="mt-3 font-display text-[40px] font-bold leading-[1.05] text-ink-strong">
            {aboutIntroHeading}
          </h2>
          <div className="prose-news mt-5">
            {aboutIntroParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <PullQuote attribution={aboutPullQuote.attribution}>{aboutPullQuote.content}</PullQuote>

        {/* Technical colophon */}
        <section className="mt-12">
          <Kicker>技术</Kicker>
          <h2 className="mt-3 font-display text-[32px] font-bold leading-[1.1] text-ink-strong">
            用到的东西
          </h2>
          <dl className="mt-5 grid gap-px border border-rule bg-rule sm:grid-cols-2">
            {aboutColophonEntries.map((entry) => (
              <ColophonItem key={entry.label} label={entry.label} value={entry.value} />
            ))}
          </dl>
        </section>

        <section className="mt-14 bg-ink p-10 text-paper md:p-12">
          <p className="font-ui text-[13px] text-paper/70">
            联系
          </p>
          <h2 className="mt-3 font-display text-[36px] font-bold leading-[1.1]">
            {aboutContactCopy.heading}
          </h2>
          <p className="mt-3 max-w-md font-serif text-[16px] leading-[1.65] text-paper/85">
            {aboutContactCopy.body}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-11 items-center gap-2 bg-paper px-5 font-ui text-[13px] font-semibold text-ink transition-colors hover:bg-stamp hover:text-paper"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href={siteEmailHref}
              className="inline-flex h-11 items-center gap-2 border border-paper px-5 font-ui text-[13px] font-semibold text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function ColophonItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper p-5">
      <p className="font-ui text-[13px] text-ink-muted">{label}</p>
      <p className="mt-1.5 font-serif text-[15px] text-ink-strong">{value}</p>
    </div>
  );
}
