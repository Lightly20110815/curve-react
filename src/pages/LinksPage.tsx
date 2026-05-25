import { useState, useCallback } from "react";
import { Shuffle, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TwikooComments } from "@/components/TwikooComments";
import { Kicker, Ornament } from "@/components/Editorial";
import linkData, { getRandomFriendLink } from "@/lib/links";

export default function LinksPage() {
  const [jumping, setJumping] = useState(false);

  const handleRandomJump = useCallback(() => {
    const link = getRandomFriendLink();
    if (!link) return;
    setJumping(true);
    setTimeout(() => {
      window.open(link.url, "_blank");
      setJumping(false);
    }, 600);
  }, []);

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        kicker="LINKS · 友情链接"
        title="友情链接"
        description="与各位博主无限进步"
        align="center"
      />

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={handleRandomJump}
          disabled={jumping}
          className="inline-flex h-11 items-center gap-2 border border-ink px-5 font-ui text-[12px] font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-stamp hover:border-stamp hover:text-paper disabled:opacity-50"
        >
          <Shuffle className="h-4 w-4" />
          {jumping ? "正在跳转…" : "随机访问"}
        </button>
      </div>

      {/* Link groups */}
      <div className="mt-12 space-y-14">
        {linkData.map((group) => (
          <section key={group.type}>
            <div className="flex items-baseline justify-between border-b border-rule pb-3">
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-[24px] font-bold text-ink-strong">
                  {group.typeName}
                </h2>
                <span className="font-ui text-[13px] text-ink-muted">
                  {group.typeList.length} 个站点
                </span>
              </div>
              <span className="hidden font-ui text-[12px] text-ink-faded sm:inline">
                {group.typeDesc}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.typeList.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-center gap-4 border border-rule-soft/60 bg-paper-soft/50 p-4 transition-all hover:border-stamp hover:bg-stamp hover:shadow-[0_0_0_1px_hsl(var(--stamp))]"
                >
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border border-rule-soft/40 bg-paper-warm">
                    <img
                      src={link.avatar}
                      alt={link.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-display text-[16px] font-semibold text-ink-strong group-hover:text-paper">
                        {link.name}
                      </span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0 text-ink-faded opacity-0 transition-opacity group-hover:text-paper/70 group-hover:opacity-100" />
                    </div>
                    <p className="mt-0.5 truncate font-serif text-[13px] leading-relaxed text-ink-muted group-hover:text-paper/80">
                      {link.desc}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Ornament className="my-section" />

      {/* Apply for link */}
      <section className="mx-auto max-w-prose text-center">
        <Kicker variant="stamp">Apply · 申请友链</Kicker>
        <h2 className="mt-3 font-display text-[28px] font-bold text-ink-strong">
          想交换链接？
        </h2>
        <p className="mt-4 font-serif text-[16px] leading-[1.75] text-ink-body">
          如果你也有一个用心维护的博客，欢迎通过邮件或 GitHub 联系我。
          <br />
          请附上你的网站名称、简介、头像链接和地址。
        </p>
      </section>

      <TwikooComments pageKey="/pages/link" />
    </div>
  );
}
