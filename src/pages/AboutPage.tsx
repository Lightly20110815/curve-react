import { Github, Mail } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Kicker, Ornament, PullQuote } from "@/components/editorial";
import { site, siteEmailHref } from "@/lib/site";

export default function AboutPage() {
  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        kicker="MASTHEAD · 编者按"
        title="关于这份小报"
        description="一个赛博空间里的家。装着代码、文字，和那些不太像样的情绪。"
      />

      <div className="mx-auto mt-12 max-w-prose">
        {/* Editor's bio */}
        <section>
          <Kicker>About the editor · 关于编者</Kicker>
          <h2 className="mt-3 font-display text-[40px] font-bold leading-[1.05] text-ink-strong">
            我是 Sy。
          </h2>
          <div className="prose-news mt-5">
            <p>
              住在某个时区的人类。
              喜欢把代码当作纸笔，把日子写得轻一点。
              这里不是教程站，更像一份公开的便签本，
              写给可能在某个深夜路过的你。
            </p>
            <p>
              我没有发刊周期，也不打算保证更新频率。
              一切以"想写"为准。<br />
              所以你看到的每一篇文章，都是某个时刻的我，
              写给某个时刻的你。
            </p>
          </div>
        </section>

        <PullQuote attribution="hello-world, 第一篇">
          这里是一个小小的角落，
          一个勉强算是"家"的地方。
        </PullQuote>

        {/* Technical colophon */}
        <section className="mt-12">
          <Kicker>Colophon · 印刷信息</Kicker>
          <h2 className="mt-3 font-display text-[32px] font-bold leading-[1.1] text-ink-strong">
            这份报纸是怎么印出来的
          </h2>
          <dl className="mt-5 grid gap-px border border-rule bg-rule sm:grid-cols-2">
            <ColophonItem label="Press · 排版机" value="Vite + React 18" />
            <ColophonItem label="Layout · 版式" value="Tailwind CSS" />
            <ColophonItem label="Type · 字体" value="Playfair Display · Cormorant · Noto Serif SC" />
            <ColophonItem label="Composing · 排字" value="Markdown → JSON 构建期管线" />
            <ColophonItem label="Music · 报刊电台" value="Meting API · HTML5 audio" />
            <ColophonItem label="Hosting · 印厂" value="Static site, anywhere" />
          </dl>
        </section>

        <Ornament className="my-section" />

        {/* Contact */}
        <section className="bg-ink p-10 text-paper md:p-12">
          <p className="font-ui text-[12px] font-semibold uppercase text-paper/70">
            Reach the desk · 给编辑部
          </p>
          <h2 className="mt-3 font-display text-[36px] font-bold leading-[1.1]">
            想说点什么？随时来信。
          </h2>
          <p className="mt-3 max-w-md font-serif text-[16px] leading-[1.65] text-paper/85">
            邮件、GitHub Issue、随笔评论 — 哪个顺手用哪个。
            <br />
            我不一定回得快，但一定会读。
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-11 items-center gap-2 bg-paper px-5 font-ui text-[12px] font-semibold uppercase text-ink transition-colors hover:bg-stamp hover:text-paper"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href={siteEmailHref}
              className="inline-flex h-11 items-center gap-2 border border-paper px-5 font-ui text-[12px] font-semibold uppercase text-paper transition-colors hover:bg-paper hover:text-ink"
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
      <p className="font-ui text-[12px] font-semibold uppercase text-ink-muted">{label}</p>
      <p className="mt-1.5 font-serif text-[15px] text-ink-strong">{value}</p>
    </div>
  );
}
