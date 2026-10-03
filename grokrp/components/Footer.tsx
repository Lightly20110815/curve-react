import { Link } from "react-router-dom";
import { formatMastheadDate } from "@/lib/han-date";
import { site, siteEmailHref } from "@/lib/site";

const sections = [
  {
    title: "版块",
    links: [
      { label: "头版", to: "/" },
      { label: "存档", to: "/archives" },
      { label: "随笔", to: "/notes" },
      { label: "友链", to: "/links" },
      { label: "编者", to: "/about" },
    ],
  },
  {
    title: "联系",
    external: [
      { label: "GitHub", href: site.githubUrl },
      { label: site.email, href: siteEmailHref },
      { label: "RSS", href: site.rssPath },
    ],
  },
] as const;

export function Footer() {
  const today = new Date();

  return (
    <footer className="mt-section border-t border-rule-soft/60">
      <div className="container grid gap-14 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="font-masthead text-[28px] font-black leading-none text-ink-strong">
            The Curve Times
          </Link>
          <p className="mt-1 font-serif text-[16px] font-medium text-stamp">曲線時報</p>
          <p className="mt-5 max-w-sm font-serif text-[15px] leading-[1.8] text-ink-body">
            一份个人早报。装得下乱糟糟的成绩、半成品的项目，和那些睡不着的夜晚。
          </p>
          <p className="mt-4 font-ui text-[13px] text-ink-muted">
            {formatMastheadDate(today)}
          </p>
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <p className="border-b border-rule-soft/55 pb-2 font-ui text-[13px] font-bold text-ink-body">
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
        <div className="container py-3.5 text-center font-ui text-[12px] text-ink-muted md:text-left">
          <p>© {today.getFullYear()} 曲線時報</p>
        </div>
      </div>
    </footer>
  );
}
