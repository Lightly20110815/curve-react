import { GithubLogo, Rss, EnvelopeSimple } from "@phosphor-icons/react";
import { site, siteEmailHref } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("mt-24 border-t border-line", className)}>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="text-[15px] text-ink-strong">{site.name}</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-mist">
            夜里种字，白天生长。
          </p>
          <p className="mt-4 font-mono text-[11.5px] text-mist">
            © {year} {site.author} · 一座深夜的数字花园
          </p>
        </div>
        <nav className="flex items-center gap-2" aria-label="站外链接">
          <FooterIconLink href={site.githubUrl} label="GitHub">
            <GithubLogo size={19} weight="light" />
          </FooterIconLink>
          <FooterIconLink href={siteEmailHref} label="邮件">
            <EnvelopeSimple size={19} weight="light" />
          </FooterIconLink>
          <FooterIconLink href={site.rssPath} label="RSS 订阅">
            <Rss size={19} weight="light" />
          </FooterIconLink>
        </nav>
      </div>
    </footer>
  );
}

function FooterIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="pressable flex h-10 w-10 items-center justify-center rounded-full text-mist transition-colors duration-200 hover:bg-veil hover:text-firefly"
    >
      {children}
    </a>
  );
}
