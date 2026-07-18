import { Link } from "react-router-dom";
import { formatMastheadDate } from "@/lib/han-date";
import { site, siteEmailHref } from "@/lib/site";

const sections = [
  {
    title: "Sections · 版块",
    links: [
      { label: "FRONT · 头版", to: "/" },
      { label: "ARCHIVES · 存档", to: "/archives" },
      { label: "OPINION · 随笔", to: "/notes" },
      { label: "LINKS · 友链", to: "/links" },
      { label: "MASTHEAD · 编者", to: "/about" },
    ],
  },
  {
    title: "Reach the desk · 联系",
    external: [
      { label: "GitHub", href: site.githubUrl },
      { label: `Email — ${site.email}`, href: siteEmailHref },
      { label: "RSS Feed", href: site.rssPath },
    ],
  },
] as const;

/**
 * Newspaper colophon footer.
 * Carries publication info, masthead links, contact, and a printed-on line.
 */
export function Footer() {
  const today = new Date();

  return (
    <footer className="mt-section border-t border-rule-soft/60">
      <div className="border-b border-rule-soft/55">
        <div className="container py-4">
          <p className="text-center font-serif text-[14px] text-ink-muted">
            <span aria-hidden className="mr-2 text-stamp">✦</span>
            Thank you for reading.
            <span className="mx-3 text-ink-faded">·</span>
            谢谢你读到这里。
            <span aria-hidden className="ml-2 text-stamp">✦</span>
          </p>
        </div>
      </div>

      <div className="container grid gap-14 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="font-masthead text-[28px] font-black leading-none text-ink-strong">
            The Curve Times
          </Link>
          <p className="mt-1 font-serif text-[16px] font-medium text-stamp">曲線時報</p>
          <p className="mt-5 max-w-sm font-serif text-[15px] leading-[1.8] text-ink-body">
            一份个人早报。装得下乱糟糟的成绩、半成品的项目，和那些睡不着的夜晚。
          </p>
          <p className="mt-4 font-ui text-[12px] font-medium uppercase text-ink-muted">
            {formatMastheadDate(today)}
          </p>
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <p className="border-b border-rule-soft/55 pb-2 font-ui text-[12px] font-bold uppercase text-ink-body">
              {section.title}
            </p>
            <ul className="mt-5 space-y-3">
              {"links" in section && section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="font-serif text-[15px] leading-[1.8] text-ink-body transition-colors hover:text-stamp"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {"external" in section && section.external.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="font-serif text-[15px] leading-[1.8] text-ink-body transition-colors hover:text-stamp"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-rule-soft/40 bg-paper">
        <div className="container flex flex-col items-center justify-between gap-2 py-3.5 text-center font-ui text-[11px] font-medium uppercase text-ink-muted md:flex-row md:text-left">
          <p>© {today.getFullYear()} The Curve Times · All wrongs reserved</p>
          <p>Printed in 赛博空间 · Press: Vite + React</p>
        </div>
      </div>
    </footer>
  );
}
