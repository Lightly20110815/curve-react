/**
 * 友邻 — 夜里亮着灯的邻居们。
 */
import { PageHeader } from "@/components/PageHeader";
import linkData from "@/lib/links";
import { siteContactMailHref } from "@/lib/site";

export default function LinksPage() {
  return (
    <div>
      <PageHeader
        title="友邻"
        note="夜里写字的时候，抬头能看见这些窗口也亮着灯。"
      />
      <div className="mx-auto max-w-5xl space-y-14 px-5 md:px-8">
        {linkData.map((group) => (
          <section key={group.type}>
            <div className="mb-5">
              <h2 className="text-[15px] font-bold tracking-wide text-mist">
                {group.typeName}
              </h2>
              <p className="mt-1 text-[13.5px] text-mist/80">{group.typeDesc}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {group.typeList.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-line bg-surface/60 p-5 transition-[border-color,background-color] duration-300 hover:border-firefly/40 hover:bg-surface"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt=""
                      loading="lazy"
                      className="h-11 w-11 rounded-full border border-line object-cover"
                    />
                    <p className="min-w-0 truncate text-[15.5px] text-ink-strong transition-colors group-hover:text-firefly">
                      {item.name}
                    </p>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[13.5px] leading-relaxed text-mist">
                    {item.desc}
                  </p>
                </a>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-2xl border border-dashed border-line p-6 md:p-8">
          <h2 className="text-[17px] text-ink-strong">也想把灯挂在这里？</h2>
          <p className="mt-2 max-w-lg text-[14.5px] leading-relaxed text-mist">
            欢迎交换友链。写封邮件告诉我你的站点名、地址、头像和一句话介绍就好。
          </p>
          <a
            href={siteContactMailHref}
            className="pressable mt-5 inline-block rounded-full border border-firefly/50 px-5 py-2 text-[14px] text-firefly transition-colors duration-200 hover:bg-firefly hover:text-page"
          >
            写信给我
          </a>
        </section>
      </div>
    </div>
  );
}
