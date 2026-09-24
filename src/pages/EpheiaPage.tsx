import { Fragment as ReactFragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Bookmark, ChevronRight, Compass, ExternalLink, Flame, Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { nowPlaying } from "@/lib/music-controller";
import { getPostBySlug } from "@/content/posts";
import { EPHEIA, type Favorite } from "@/content/epheia";
import FreefallDarkroom from "@/components/FreefallDarkroom";
import DystopiaDarkroom from "@/components/DystopiaDarkroom";
import "./epheia.css";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stamp";

/** Enter / 空格 当作点击，给用 div 做的按钮用 */
function onActivate(handler: () => void) {
  return (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      handler();
    }
  };
}

/* ------------------------------------------------------------------ */
/* 时间                                                                 */
/* ------------------------------------------------------------------ */

interface TimeBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

function calculateTimeBreakdown(startDateStr: string): TimeBreakdown {
  const diff = Math.max(0, Date.now() - new Date(startDateStr).getTime());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}

function calculateDays(startDateStr: string): number {
  const diff = Math.max(0, Date.now() - new Date(startDateStr).getTime());
  return Math.floor(diff / 86_400_000);
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* 版面小件                                                             */
/* ------------------------------------------------------------------ */

function SectionHead({ num, id, title }: { num: string; id: string; title: string }) {
  return (
    <header className="mb-8 border-t-[3px] border-double border-rule pt-3 md:mb-12">
      <h2 id={id} className="flex items-baseline gap-x-3">
        <span className="font-mono text-[12px] text-stamp">{num}</span>
        <span className="font-display text-[26px] font-bold text-ink-strong md:text-[32px]">{title}</span>
      </h2>
    </header>
  );
}

function SubLabel({ id, rule = true, children }: { id?: string; rule?: boolean; children: React.ReactNode }) {
  return (
    <h3 id={id} className="flex items-center gap-3 font-ui text-[13px] font-semibold text-ink-strong">
      <span>{children}</span>
      {rule && <span className="h-px flex-1 bg-rule-soft/40" aria-hidden="true" />}
    </h3>
  );
}

function Prose({ paragraphs, className }: { paragraphs: string[]; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-[36em] space-y-5 font-serif text-[16px] leading-[2] text-ink-body md:text-[17.5px]",
        className,
      )}
    >
      {paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 晾衣绳：她喜欢的 + 两根耳机线（暗房入口）                              */
/* ------------------------------------------------------------------ */

/** 拍立得木夹子 */
function Clothespin({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="38"
      viewBox="0 0 20 38"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none select-none drop-shadow-md", className)}
    >
      <rect x="2" y="1" width="6" height="36" rx="2" fill="#c69263" stroke="#845229" strokeWidth="1" />
      <rect x="3.5" y="3" width="3" height="32" rx="1" fill="#dfb083" opacity="0.6" />
      <rect x="12" y="1" width="6" height="36" rx="2" fill="#d4a070" stroke="#845229" strokeWidth="1" />
      <rect x="13.5" y="3" width="3" height="32" rx="1" fill="#ecd0a8" opacity="0.6" />
      <rect x="4" y="12" width="12" height="6" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1" />
      <line x1="5" y1="15" x2="15" y2="15" stroke="#94a3b8" strokeWidth="1" />
      <circle cx="10" cy="15" r="1.5" fill="#f1f5f9" />
    </svg>
  );
}

/** 麻绳，两端淡出 */
function Rope() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-12 [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]"
      aria-hidden="true"
    >
      <svg className="h-12 w-full overflow-visible" viewBox="0 0 1000 48" preserveAspectRatio="none" fill="none">
        <path d="M 0 21 Q 500 31 1000 21" stroke="rgba(0, 0, 0, 0.15)" strokeWidth="2.5" className="dark:stroke-black/50" />
        <path d="M 0 20 Q 500 30 1000 20" stroke="#8d6e63" strokeWidth="2.5" className="opacity-95 dark:stroke-[#a1887f]" />
        <path
          d="M 0 20 Q 500 30 1000 20"
          stroke="#d7ccc8"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          className="opacity-80 dark:stroke-[#d7ccc8]/50"
        />
      </svg>
    </div>
  );
}

/** 夹在绳子上的一件东西：夹子在上，内容按固定角度垂下 */
function Hanger({ tilt, className, children }: { tilt: number; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("relative flex flex-col items-center", className)}
      style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "top center" }}
    >
      <Clothespin className="absolute -top-[16px] left-1/2 z-20 -translate-x-1/2" />
      {children}
    </div>
  );
}

/** 垂下来的 3.5mm 耳机线，点击进入对应的文字 PV 暗房 */
function CordButton({
  isOpen,
  onClick,
  openSleeve,
  compact = false,
}: {
  isOpen: boolean;
  onClick: () => void;
  openSleeve: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="耳机线"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className={cn(
        "group/cord relative flex w-full flex-col items-center rounded-xs",
        compact ? "min-h-[140px]" : "min-h-[190px]",
        focusRing,
      )}
    >
      <span
        className="flex origin-top flex-col items-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-visible/cord:rotate-[4deg] [@media(hover:hover)]:group-hover/cord:rotate-[4deg]"
        aria-hidden="true"
      >
        <svg
          width={compact ? 34 : 44}
          height={compact ? 92 : 120}
          viewBox="0 0 44 120"
          fill="none"
          className="overflow-visible drop-shadow-sm"
        >
          <path
            d="M 22 -4 C 22 12, 11 22, 13 38 C 15 54, 32 65, 28 86 C 25 102, 22 110, 22 118"
            stroke="rgba(0, 0, 0, 0.15)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="dark:stroke-black/50"
          />
          <path
            d="M 22 -5 C 22 11, 11 21, 13 37 C 15 53, 32 64, 28 85 C 25 101, 22 109, 22 117"
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
            className="dark:stroke-[#cbd5e1]"
          />
          <path
            d="M 22 -5 C 22 11, 11 21, 13 37 C 15 53, 32 64, 28 85 C 25 101, 22 109, 22 117"
            stroke="#475569"
            strokeWidth="0.9"
            strokeLinecap="round"
            className="opacity-90 dark:hidden"
          />
          <path
            d="M 22 -5 C 22 11, 11 21, 13 37 C 15 53, 32 64, 28 85 C 25 101, 22 109, 22 117"
            stroke="#94a3b8"
            strokeWidth="0.8"
            strokeDasharray="2 3"
            strokeLinecap="round"
            className="hidden opacity-40 dark:block dark:stroke-[#64748b]"
          />
        </svg>
        <svg
          width={compact ? 14 : 18}
          height={compact ? 33 : 42}
          viewBox="0 0 18 42"
          fill="none"
          className="-mt-1 drop-shadow-md"
        >
          <rect x="7" y="0" width="4" height="6" rx="1" fill="#334155" />
          <line x1="6" y1="2" x2="12" y2="2" stroke="#475569" strokeWidth="1" />
          <line x1="6" y1="4" x2="12" y2="4" stroke="#475569" strokeWidth="1" />
          <rect
            x="5"
            y="6"
            width="8"
            height="15"
            rx="1.5"
            fill={isOpen ? openSleeve : "#1e293b"}
            stroke="#0f172a"
            strokeWidth="0.8"
            className="transition-colors duration-300"
          />
          <line x1="5.5" y1="10" x2="12.5" y2="10" stroke="#64748b" strokeWidth="0.8" />
          <line x1="5.5" y1="14" x2="12.5" y2="14" stroke="#64748b" strokeWidth="0.8" />
          <line x1="5.5" y1="17" x2="12.5" y2="17" stroke="#64748b" strokeWidth="0.8" />
          <rect x="6.5" y="21" width="5" height="3" fill="#d97706" />
          <rect x="6.5" y="24" width="5" height="1" fill="#0f172a" />
          <rect x="6.5" y="25" width="5" height="4" fill="#f59e0b" />
          <rect x="6.5" y="29" width="5" height="1" fill="#0f172a" />
          <rect x="6.5" y="30" width="5" height="5" fill="#fbbf24" />
          <path d="M 6.5 35 L 9 41 L 11.5 35 Z" fill="#d97706" stroke="#b45309" strokeWidth="0.5" />
        </svg>
      </span>

    </button>
  );
}

const polaroidFrame =
  "rounded-xs border-2 border-black/20 bg-[#fdfbf7] shadow-[0_12px_24px_rgba(0,0,0,0.12)] dark:border-white/20 dark:bg-[#1a1a1a]";

function Polaroid({ item }: { item: Favorite }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block w-[150px] p-2.5 pb-3.5 transition-[transform,box-shadow] duration-150 ease-out lg:w-[190px] lg:p-3 lg:pb-4",
        "focus-visible:-translate-y-0.5 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[0_18px_32px_rgba(0,0,0,0.18)]",
        polaroidFrame,
        focusRing,
      )}
    >
      <span className="block aspect-[3/4] w-full overflow-hidden rounded-xs border border-black/10 bg-paper-warm">
        <img src={item.img} alt="" loading="lazy" className="h-full w-full object-cover" />
      </span>
      <span className="mt-2.5 block px-1 text-center">
        <span className="block font-serif text-[12.5px] font-medium leading-snug text-ink-strong transition-colors group-hover:text-stamp lg:text-[13px]">
          {item.caption}
        </span>
        <span className="mt-1 flex items-start justify-center gap-1 font-ui text-[10px] leading-snug tracking-wider text-ink-muted">
          <span lang={item.subLang} className="text-balance">
            {item.sub}
          </span>
          <ExternalLink className="mt-[2px] h-2.5 w-2.5 shrink-0 opacity-60" aria-hidden="true" />
        </span>
        {item.srExtra && <span className="sr-only">{item.srExtra}</span>}
      </span>
    </a>
  );
}

function Clothesline({
  dystopiaOpen,
  freefallOpen,
  onDystopia,
  onFreefall,
}: {
  dystopiaOpen: boolean;
  freefallOpen: boolean;
  onDystopia: () => void;
  onFreefall: () => void;
}) {
  const cords = (compact: boolean) => ({
    left: (
      <CordButton
        isOpen={dystopiaOpen}
        onClick={onDystopia}
        openSleeve="#b45309"
        compact={compact}
      />
    ),
    right: (
      <CordButton
        isOpen={freefallOpen}
        onClick={onFreefall}
        openSleeve="#991b1b"
        compact={compact}
      />
    ),
  });
  const wide = cords(false);
  const narrow = cords(true);

  return (
    <>
      {/* md 及以上：一根绳子挂五件东西 */}
      <div className="relative mx-auto mt-8 hidden max-w-[1000px] pb-8 pt-[26px] md:block">
        <Rope />
        <div className="relative flex items-start justify-between px-2">
          <Hanger tilt={-2} className="w-16 lg:w-24">
            {wide.left}
          </Hanger>
          {EPHEIA.favorites.map((item) => (
            <Hanger key={item.id} tilt={item.tilt}>
              <Polaroid item={item} />
            </Hanger>
          ))}
          <Hanger tilt={1.5} className="w-16 lg:w-24">
            {wide.right}
          </Hanger>
        </div>
      </div>

      {/* 手机：绳子上只挂照片和耳机线，链接放在下面的列表里 */}
      <div className="mt-8 md:hidden">
        <div className="relative pt-[22px]">
          <Rope />
          <div className="relative flex items-start gap-1.5">
            <Hanger tilt={-2} className="w-11 shrink-0">
              {narrow.left}
            </Hanger>
            {EPHEIA.favorites.map((item, i) => (
              <Hanger key={item.id} tilt={item.tilt * 0.6} className="min-w-0 flex-1">
                <div aria-hidden="true" className={cn("w-full p-1.5 pb-1", polaroidFrame)}>
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-xs border border-black/10 bg-paper-warm">
                    <img src={item.img} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-1 text-center font-mono text-[10px] text-ink-muted">{i + 1}</p>
                </div>
              </Hanger>
            ))}
            <Hanger tilt={1.5} className="w-11 shrink-0">
              {narrow.right}
            </Hanger>
          </div>
        </div>

        <ol className="mt-6 divide-y divide-rule-soft/40 border-y border-rule-soft/40">
          {EPHEIA.favorites.map((item, i) => (
            <li key={item.id}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("flex min-h-11 items-center gap-3 py-2.5", focusRing)}
              >
                <span className="font-mono text-[11px] text-ink-muted">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-[15px] text-ink-strong">{item.caption}</span>
                  <span lang={item.subLang} className="block font-ui text-[12px] text-ink-muted">
                    {item.sub}
                  </span>
                  {item.srExtra && <span className="sr-only">{item.srExtra}</span>}
                </span>
                <ExternalLink className="h-3 w-3 shrink-0 text-ink-muted" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 07/24                                                               */
/* ------------------------------------------------------------------ */

function Divider0724() {
  return (
    <section aria-labelledby="eph-0724" className="my-16 md:my-24">
      <div className="flex items-center gap-4">
        <span className="flex-1 border-t-[3px] border-double border-rule" aria-hidden="true" />
        <h3 id="eph-0724" className="font-mono text-[13px] tracking-[0.2em] text-stamp">
          07/24
        </h3>
        <span className="flex-1 border-t-[3px] border-double border-rule" aria-hidden="true" />
      </div>

      <dl className="mt-6 grid gap-y-1 font-mono text-[12.5px] leading-[1.8] md:grid-cols-[6.5em_1fr] md:gap-x-6 md:gap-y-3">
        <dt className="text-ink-muted">她用过的</dt>
        <dd className="text-ink-body">{EPHEIA.strata.used}</dd>
        <dt className="mt-3 text-ink-muted md:mt-0">她没等到的</dt>
        <dd className="text-ink-muted">{EPHEIA.strata.missed}</dd>
      </dl>
    </section>
  );
}

function SyPosts() {
  const rows = EPHEIA.syPosts.map((slug) => getPostBySlug(slug)).filter((post) => post !== undefined);
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="eph-sy-posts" className="mt-16">
      <SubLabel id="eph-sy-posts">Sy 写的</SubLabel>
      <ul className="mt-4 divide-y divide-rule-soft/40">
        {rows.map((post) => (
          <li key={post.slug}>
            <Link
              to={`/posts/${post.slug}`}
              className={cn("group grid min-h-11 grid-cols-[3.5em_1fr] items-center gap-x-4 py-2", focusRing)}
            >
              <span className="font-mono text-[12px] text-ink-muted">{post.date.slice(5, 10)}</span>
              <span className="font-serif text-[16px] text-ink-strong transition-colors group-hover:text-stamp">
                {post.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 她留下的：她的聊天角 + 做的、写的                                    */
/* ------------------------------------------------------------------ */

function HerCorner() {
  const { corner } = EPHEIA;
  return (
    <section aria-label={corner.title} className="eph-sheet relative px-5 pb-6 pt-10 md:px-8">
      <span className="eph-small absolute right-5 top-4">{corner.host}</span>
      {corner.avatar && (
        <img
          src={corner.avatar}
          alt=""
          width={36}
          height={36}
          className="mx-auto mb-3 h-9 w-9 rounded-full"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
      <p lang="ja" className="eph-title text-center text-[22px] md:text-[26px]">
        {corner.title}
      </p>
      <p lang="ja" className="eph-small mt-2 text-center">
        {corner.subtitle}
      </p>

      <ol className="mt-8 space-y-6">
        {corner.posts.map((post) => (
          <li key={`${post.date}-${post.tag}`} className="grid grid-cols-[18px_1fr] gap-x-3">
            <span className="eph-track" aria-hidden="true">
              <span className="eph-diamond" />
            </span>
            <div className="min-w-0">
              <p className="eph-small">{post.date}</p>
              <div className="eph-card mt-1.5 px-4 py-3 md:px-5">
                <span className="eph-tagtext">{post.tag}</span>
                {post.lines?.map((line) => (
                  <p key={line} lang={post.lang} className="eph-voice text-[15px] leading-[1.8]">
                    {line}
                  </p>
                ))}
                {post.link &&
                  (post.link.to.startsWith("/") ? (
                    <Link to={post.link.to} lang={post.lang} className="eph-link eph-focus">
                      {post.link.text}
                    </Link>
                  ) : (
                    <span lang={post.lang} className="eph-voice">
                      {post.link.text}
                    </span>
                  ))}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <a
        href={corner.url}
        target="_blank"
        rel="noopener noreferrer"
        className="eph-link eph-focus mt-6 inline-flex min-h-11 items-center"
      >
        {corner.label} · {corner.host} ↗
      </a>
    </section>
  );
}

function Works() {
  const rows = EPHEIA.works.filter((work) => work.title || work.meta);
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="eph-works" className="mt-10">
      <SubLabel id="eph-works">她做的、写的</SubLabel>
      <ol className="mt-4">
        {rows.map((work, i) => {
          const hasUrl = Boolean(work.url?.startsWith("https://"));
          return (
            <li
              key={`${work.kind}-${work.title ?? work.meta}`}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-dashed border-[color:var(--eph-line)] py-3"
            >
              <span className="eph-num" aria-hidden="true">
                #{i + 1}
              </span>
              <span className="eph-pill">#{work.kind}</span>
              {work.title ? (
                hasUrl ? (
                  <a
                    href={work.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    lang={work.lang}
                    className="eph-link eph-focus"
                  >
                    {work.title} ↗
                  </a>
                ) : (
                  <span lang={work.lang} className="eph-voice">
                    {work.title}
                  </span>
                )
              ) : (
                <span className="eph-voice">{work.meta}</span>
              )}
              {work.title && work.meta && <span className="eph-small">{work.meta}</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 结尾：注、她的话                                                      */
/* ------------------------------------------------------------------ */

function HerWords() {
  const { stanzas, signature } = EPHEIA.herWords;
  return (
    <figure className="mx-auto max-w-[580px]">
      <blockquote className="eph-sheet eph-voice space-y-[1.4em] px-5 py-7 text-[17px] leading-[2] tracking-[0.02em] md:px-10 md:py-10 md:text-[19px]">
        {stanzas.map((stanza) => (
          <p key={stanza.join("/")}>
            {stanza.map((line, i) => (
              <ReactFragment key={line}>
                {i > 0 && <br />}
                {line}
              </ReactFragment>
            ))}
          </p>
        ))}
      </blockquote>
      <figcaption
        className="mt-8 text-right text-[14px] tracking-[0.1em]"
        style={{ color: "var(--eph-rose)", fontFamily: "var(--eph-font)" }}
      >
        {signature}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* 两侧浮窗：左边注脚，右边两个日子                                      */
/* ------------------------------------------------------------------ */

/**
 * 左侧注脚：缩在左边，鼠标移上去滑出、移开缩回。
 * 没有悬停的触屏上点一下滑出，点别处收回；键盘用回车打开，Esc 或移开焦点收回。
 */
function FootnoteCard({ hidden }: { hidden: boolean }) {
  const [first, second, third] = EPHEIA.footnote;
  const [cardMounted, setCardMounted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const pointerTypeRef = useRef("");

  useEffect(() => {
    const timer = window.setTimeout(() => setCardMounted(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const toggle = () => setPinned((value) => !value);
  const shown = "translate-x-4 rotate-0 border-stamp opacity-100 shadow-[0_24px_50px_rgba(0,0,0,0.18)] sm:translate-x-6";

  return (
    <aside
      onPointerDown={(event) => {
        pointerTypeRef.current = event.pointerType;
      }}
      onClick={() => {
        // 鼠标交给悬停处理，点击不固定，免得移开后还停在外面
        if (pointerTypeRef.current !== "mouse") toggle();
      }}
      onMouseLeave={() => setPinned(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setPinned(false);
        else onActivate(toggle)(event);
      }}
      onBlur={() => setPinned(false)}
      className={cn(
        "group fixed left-0 top-[40vh] z-30 w-[240px] cursor-pointer select-none rounded-xs border-2 border-rule/80 bg-paper p-5 sm:w-[268px] sm:p-6",
        "shadow-[8px_16px_36px_rgba(0,0,0,0.08),2px_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[8px_16px_36px_rgba(0,0,0,0.35)]",
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        "outline-none",
        // 触控与鼠标延展区，防止滑出过程中丢失 hover
        "before:pointer-events-auto before:absolute before:inset-y-0 before:right-full before:w-16",
        hidden
          ? "pointer-events-none -translate-x-full opacity-0"
          : !cardMounted
            ? "-translate-x-full -rotate-12 opacity-0"
            : pinned
              ? shown
              : "translate-x-[calc(-100%+28px)] rotate-6 opacity-95 hover:translate-x-4 hover:rotate-0 hover:border-stamp hover:opacity-100 hover:shadow-[0_24px_50px_rgba(0,0,0,0.18)] focus-visible:translate-x-4 focus-visible:rotate-0 focus-visible:border-stamp focus-visible:opacity-100 sm:translate-x-[calc(-100%+32px)] sm:hover:translate-x-6 sm:focus-visible:translate-x-6",
      )}
      style={{ transformOrigin: "top left" }}
      role="button"
      tabIndex={hidden ? -1 : 0}
      aria-expanded={pinned}
      aria-label="注脚"
    >
      {/* 缩在角落时露出的小标签 */}
      <div
        className={cn(
          "pointer-events-none absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 text-stamp opacity-80 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0",
          pinned && "opacity-0",
        )}
      >
        <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink-muted [writing-mode:vertical-lr]">
          注脚
        </span>
      </div>

      {/* 滑出时的完整内容 */}
      <div
        className={cn(
          "opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100",
          pinned && "opacity-100",
        )}
      >
        <div className="flex items-center justify-between border-b border-dashed border-rule-soft/60 pb-2.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            FOOTNOTE · 注脚
          </span>
          <span className="font-ui text-[9px] font-semibold uppercase tracking-wider text-stamp">2026 夏末</span>
        </div>
        <div className="mt-4 space-y-2 font-serif text-[13.5px] leading-relaxed sm:text-[14px]">
          <p className="text-ink-body">{first}</p>
          <p className="pl-3 text-ink-muted">{second}</p>
          <p className="pl-6 font-medium text-stamp">{third}</p>
        </div>
      </div>
    </aside>
  );
}

type ChronoFocus = "all" | "epheia_sy" | "epheia_world";

function ChronoCard({
  days,
  world,
  hidden,
  onOpen,
}: {
  days: number;
  world: TimeBreakdown;
  hidden: boolean;
  onOpen: (focus: ChronoFocus, viaKeyboard?: boolean) => void;
}) {
  const [cardMounted, setCardMounted] = useState(false);

  // 页面加载后斜着飞入
  useEffect(() => {
    const timer = window.setTimeout(() => setCardMounted(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <aside
      onClick={() => onOpen("all")}
      onKeyDown={onActivate(() => onOpen("all", true))}
      className={cn(
        "group fixed right-0 top-[40vh] z-30 w-[290px] cursor-pointer select-none rounded-xs border-2 border-rule bg-paper p-5 sm:w-[320px]",
        "shadow-[-8px_16px_36px_rgba(0,0,0,0.12),-2px_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[-8px_16px_36px_rgba(0,0,0,0.45)]",
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        "outline-none",
        // 触控与鼠标延展区，防止滑出过程中丢失 hover
        "after:pointer-events-auto after:absolute after:inset-y-0 after:left-full after:w-16",
        hidden
          ? "pointer-events-none translate-x-full opacity-0"
          : cardMounted
            ? "translate-x-[calc(100%-28px)] -rotate-6 opacity-95 hover:-translate-x-4 hover:rotate-0 hover:border-stamp hover:opacity-100 hover:shadow-[0_24px_50px_rgba(0,0,0,0.18)] focus-visible:-translate-x-4 focus-visible:rotate-0 focus-visible:border-stamp focus-visible:opacity-100 sm:translate-x-[calc(100%-32px)] sm:hover:-translate-x-6 sm:focus-visible:-translate-x-6"
            : "translate-x-full rotate-12 opacity-0",
      )}
      style={{ transformOrigin: "top right" }}
      title="点击展开两段光阴对望"
      role="button"
      tabIndex={hidden ? -1 : 0}
      aria-label="Epheia 的两个日子，点击查看详情"
      aria-haspopup="dialog"
    >
      {/* 缩在角落时露出的小标签 */}
      <div className="pointer-events-none absolute left-1.5 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 text-stamp opacity-80 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0">
        <Compass className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink-muted [writing-mode:vertical-lr]">
          刻度
        </span>
      </div>

      {/* 滑出时的完整内容 */}
      <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        <div className="flex items-center justify-between border-b border-dashed border-rule-soft/80 pb-3">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            <Compass className="h-3.5 w-3.5 text-stamp" aria-hidden="true" />
            <span>EPHEIA · CHRONO</span>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-stamp/10 px-2 py-0.5 font-ui text-[10px] font-semibold text-stamp">
            <span className="h-1.5 w-1.5 rounded-full bg-stamp" />
            <span>实时跳动</span>
          </span>
        </div>

        <div
          onClick={(event) => {
            event.stopPropagation();
            onOpen("epheia_sy");
          }}
          className="group/item mt-4 rounded-xs p-2 transition-all hover:bg-paper-warm/80 hover:shadow-xs active:scale-[0.99]"
          title="点击查看「Epheia 离开 Sy」详情"
        >
          <div className="flex items-center justify-between">
            <p className="font-serif text-[13px] italic text-ink-muted group-hover/item:text-stamp">Epheia 离开 Sy 已</p>
            <span className="font-mono text-[9px] uppercase text-ink-faded opacity-0 transition-opacity group-hover/item:opacity-100">
              查看单项 →
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5 text-stamp">
              <span className="font-display text-[34px] font-bold leading-none tabular-nums">{days}</span>
              <span className="font-serif text-[14px] text-ink-muted">天</span>
            </div>
            <span className="font-mono text-[10px] text-ink-faded">2026.07.24</span>
          </div>
        </div>

        <div className="my-2.5 border-t border-dashed border-rule-soft/50" />

        <div
          onClick={(event) => {
            event.stopPropagation();
            onOpen("epheia_world");
          }}
          className="group/item rounded-xs p-2 transition-all hover:bg-paper-warm/80 hover:shadow-xs active:scale-[0.99]"
          title="点击查看「Epheia 离开这个世界」秒表详情"
        >
          <div className="flex items-center justify-between">
            <p className="font-serif text-[13px] italic text-ink-muted group-hover/item:text-stamp">
              Epheia 离开这个世界已
            </p>
            <span className="font-mono text-[9px] uppercase text-ink-faded opacity-0 transition-opacity group-hover/item:opacity-100">
              查看单项 →
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1 text-stamp">
            <span className="font-display text-[26px] font-bold leading-none tabular-nums">{world.days}</span>
            <span className="mr-1 font-serif text-[12px] text-ink-muted">天</span>
            <span className="font-mono text-[18px] font-bold tabular-nums">
              {pad2(world.hours)}:{pad2(world.minutes)}:{pad2(world.seconds)}
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-ink-faded">累计 {world.totalSeconds.toLocaleString()} 秒</p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-rule-soft/40 pt-2.5 font-ui text-[11px] font-semibold text-stamp">
          <span>点击日期查看详情</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </div>
    </aside>
  );
}

function ChronoModal({
  open,
  focus,
  setFocus,
  onClose,
  restoreFocusRef,
  days,
  world,
}: {
  open: boolean;
  focus: ChronoFocus;
  setFocus: (focus: ChronoFocus) => void;
  onClose: () => void;
  /** 用键盘打开时关闭后把焦点还给浮窗；用鼠标或触屏打开时不还，免得浮窗停在外面 */
  restoreFocusRef: React.MutableRefObject<boolean>;
  days: number;
  world: TimeBreakdown;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // ESC 关闭、锁住背景滚动、焦点进出弹窗
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (restoreFocusRef.current && previousFocus?.isConnected && previousFocus !== document.body) {
        previousFocus.focus({ preventScroll: true });
      } else {
        (document.activeElement as HTMLElement | null)?.blur();
      }
    };
  }, [open, onClose, restoreFocusRef]);

  const tab = (value: ChronoFocus, label: React.ReactNode) => (
    <button
      type="button"
      role="tab"
      aria-selected={focus === value}
      tabIndex={open ? 0 : -1}
      onClick={() => setFocus(value)}
      className={cn(
        "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 font-ui text-[12px] font-semibold uppercase tracking-wider transition-colors sm:px-4",
        focus === value ? "border-stamp text-stamp" : "border-transparent text-ink-muted hover:text-ink",
        focusRing,
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-[120] flex items-center justify-center overflow-hidden p-4 sm:p-6",
        open ? "pointer-events-auto" : "pointer-events-none delay-700",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="依菲雅时光详情弹窗"
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-700 ease-in-out",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-2xl overflow-hidden rounded-xs border-2 border-rule bg-paper p-6 shadow-2xl md:p-8",
          "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-[115vw]",
        )}
      >
        <div className="flex items-center justify-between border-b border-rule-soft/60 pb-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-stamp" aria-hidden="true" />
            <span className="font-masthead text-[15px] font-bold tracking-tight text-ink-strong">
              EPHEIA CHRONOMETER · 时光浮窗
            </span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className={cn(
              "rounded-full p-1 text-ink-muted transition-colors hover:bg-paper-warm hover:text-ink-strong",
              focusRing,
            )}
            aria-label="关闭弹窗"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div role="tablist" className="mt-5 flex overflow-x-auto border-b border-rule-soft/40">
          {tab(
            "all",
            <>
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              <span>两段光阴对望</span>
            </>,
          )}
          {tab("epheia_sy", <span>Epheia 离开 Sy</span>)}
          {tab(
            "epheia_world",
            <>
              <Flame className="h-3.5 w-3.5 text-stamp" aria-hidden="true" />
              <span>Epheia 离开这个世界</span>
            </>,
          )}
        </div>

        <div className="py-7">
          {focus === "all" && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xs border border-rule-soft/50 bg-paper-soft/40 p-5 text-center">
                <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-ink-muted">RECORD 01</p>
                <p className="mt-2 font-serif text-[15px] italic text-ink-strong">Epheia 离开 Sy 已</p>
                <div className="my-3 font-display text-[48px] font-bold leading-none text-stamp tabular-nums">
                  {days} <span className="font-serif text-[16px] text-ink-muted">天</span>
                </div>
                <p className="font-mono text-[10px] text-ink-muted">Since 2026-07-24</p>
              </div>

              <div className="rounded-xs border border-stamp/40 bg-stamp/5 p-5 text-center">
                <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-stamp">RECORD 02 · 实时秒钟</p>
                <p className="mt-2 font-serif text-[15px] italic text-ink-strong">Epheia 离开这个世界已</p>
                <div className="my-3 font-display text-[30px] font-bold leading-none text-stamp tabular-nums sm:text-[34px]">
                  {world.days}
                  <span className="font-serif text-[13px] text-ink-muted">天 </span>
                  {pad2(world.hours)}:{pad2(world.minutes)}:{pad2(world.seconds)}
                </div>
                <p className="font-mono text-[10px] text-ink-muted">累计 {world.totalSeconds.toLocaleString()} 秒</p>
              </div>
            </div>
          )}

          {focus === "epheia_sy" && (
            <div className="text-center">
              <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-ink-muted">RECORD 01 · 告别之隙</p>
              <h3 className="mt-3 font-serif text-[20px] font-medium text-ink-strong">Epheia 离开 Sy 已</h3>
              <div className="my-6 flex items-baseline justify-center gap-2">
                <span className="font-display text-[84px] font-bold leading-none text-stamp tabular-nums md:text-[96px]">
                  {days}
                </span>
                <span className="font-serif text-[24px] text-ink-muted">天</span>
              </div>
              <p className="font-serif text-[15px] italic text-ink-body">起始时刻：2026 年 7 月 24 日</p>
            </div>
          )}

          {focus === "epheia_world" && (
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-stamp">
                <span className="h-2 w-2 rounded-full bg-stamp" />
                <span className="font-ui text-[11px] font-bold uppercase tracking-[0.18em]">
                  LIVE PRECISION CHRONOMETER
                </span>
              </div>
              <h3 className="mt-3 font-serif text-[20px] font-medium text-ink-strong">Epheia 离开这个世界已</h3>

              <div className="my-6 grid grid-cols-4 gap-2 text-center sm:gap-3">
                {[
                  { value: String(world.days), label: "天 (Days)", accent: false, display: true },
                  { value: pad2(world.hours), label: "时 (Hrs)", accent: false, display: false },
                  { value: pad2(world.minutes), label: "分 (Min)", accent: false, display: false },
                  { value: pad2(world.seconds), label: "秒 (Sec)", accent: true, display: false },
                ].map((cell) => (
                  <div
                    key={cell.label}
                    className={cn(
                      "rounded-xs border p-3 shadow-inner",
                      cell.accent ? "border-stamp/40 bg-stamp/10" : "border-rule-soft/40 bg-paper",
                    )}
                  >
                    <span
                      className={cn(
                        "leading-none tabular-nums",
                        cell.display
                          ? "font-display text-[26px] font-bold text-stamp sm:text-[36px]"
                          : cn(
                              "font-mono text-[22px] sm:text-[30px]",
                              cell.accent ? "font-bold text-stamp" : "font-semibold text-ink-strong",
                            ),
                      )}
                    >
                      {cell.value}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block font-ui text-[10px] uppercase",
                        cell.accent ? "font-bold text-stamp" : "font-medium text-ink-muted",
                      )}
                    >
                      {cell.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="inline-block rounded-full border border-rule-soft bg-paper-warm/50 px-4 py-1.5 font-mono text-[12px] text-ink-muted">
                起算时刻：2026-07-27 12:01 PM · 累计走过{" "}
                <strong className="text-stamp tabular-nums">{world.totalSeconds.toLocaleString()}</strong> 秒
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 页面                                                                 */
/* ------------------------------------------------------------------ */

export default function EpheiaPage() {
  // 在这一页，全站播放器换成这一页自己的歌
  useLayoutEffect(() => {
    nowPlaying.setEpheiaMode(true);
    return () => nowPlaying.setEpheiaMode(false);
  }, []);

  // 两个日子，每秒刷新
  const [daysLeavesSy, setDaysLeavesSy] = useState(() => calculateDays(EPHEIA.dates.leavesSy));
  const [worldTime, setWorldTime] = useState<TimeBreakdown>(() => calculateTimeBreakdown(EPHEIA.dates.leavesWorld));
  useEffect(() => {
    const tick = () => {
      setDaysLeavesSy(calculateDays(EPHEIA.dates.leavesSy));
      setWorldTime(calculateTimeBreakdown(EPHEIA.dates.leavesWorld));
    };
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // 右侧浮窗与详情弹窗（渲染到 body，避免被页面的入场动画裁掉）
  const [portalReady, setPortalReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFocus, setModalFocus] = useState<ChronoFocus>("all");
  useEffect(() => setPortalReady(true), []);
  const restoreFocusRef = useRef(false);
  const openModal = (focus: ChronoFocus, viaKeyboard = false) => {
    restoreFocusRef.current = viaKeyboard;
    setModalFocus(focus);
    setModalOpen(true);
  };
  const closeModal = useRef(() => setModalOpen(false)).current;

  // 两个暗房：左侧耳机线进反乌托邦 Pt.2，右侧耳机线进自由落体
  const [isFreefallOpen, setIsFreefallOpen] = useState(false);
  const [isDystopiaOpen, setIsDystopiaOpen] = useState(false);
  const freefallAudioRef = useRef<HTMLAudioElement | null>(null);
  const dystopiaAudioRef = useRef<HTMLAudioElement | null>(null);

  const enterDarkroom = (audio: HTMLAudioElement | null, open: () => void) => {
    if (isFreefallOpen || isDystopiaOpen) return; // 一次只开一个暗房，退出由暗房自己管理
    open();
    if (!audio) return;
    if (nowPlaying.isPlaying) nowPlaying.togglePlay();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  };
  const handleToggleFreefall = () => enterDarkroom(freefallAudioRef.current, () => setIsFreefallOpen(true));
  const handleToggleDystopia = () => enterDarkroom(dystopiaAudioRef.current, () => setIsDystopiaOpen(true));

  const handleCloseFreefall = () => {
    freefallAudioRef.current?.pause();
    setIsFreefallOpen(false);
  };
  const handleCloseDystopia = () => {
    dystopiaAudioRef.current?.pause();
    setIsDystopiaOpen(false);
  };

  // 离开页面时两首歌都停下
  useEffect(() => {
    const freefall = freefallAudioRef.current;
    const dystopia = dystopiaAudioRef.current;
    return () => {
      freefall?.pause();
      dystopia?.pause();
    };
  }, []);

  return (
    <article aria-labelledby="eph-h1" className="eph-page container overflow-x-clip pb-32 pt-12 md:pt-16">
      <div className="mx-auto max-w-[1080px]">
        {/* 名字和开头一句 */}
        <header>
          <h1
            id="eph-h1"
            className="font-display text-[44px] font-bold leading-[1.05] tracking-tight text-ink-strong md:text-[64px]"
          >
            依菲雅
          </h1>
          <p className="eph-title mt-2 text-[18px] md:text-[24px]">Epheia</p>

          <div className="mt-8 max-w-[34em] space-y-1 font-serif text-[16px] leading-[1.9] text-ink-body md:text-[18px]">
            {EPHEIA.lede.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <Link
            to="/posts/goodnight"
            className={cn(
              "group mt-8 inline-flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 border border-rule-soft/70 px-4 py-2 transition-colors hover:border-stamp",
              focusRing,
            )}
          >
            <span className="font-serif text-[15px] font-semibold text-ink-strong">晚安喵</span>
            <span className="font-mono text-[11px] tracking-[0.2em] text-ink-muted transition-colors group-hover:text-stamp">
              那些我还记得的她 →
            </span>
          </Link>
        </header>

        {/* 01 我记得的她 */}
        <section aria-labelledby="eph-part-1" className="mt-20 md:mt-28">
          <SectionHead num="01" id="eph-part-1" title="我记得的她" />

          <section aria-labelledby="eph-before">
            <SubLabel id="eph-before">她还在的时候</SubLabel>
            <Prose paragraphs={EPHEIA.before} className="mt-6" />
          </section>

          <section aria-labelledby="eph-likes" className="mt-16">
            <SubLabel id="eph-likes" rule={false}>
              她喜欢的
            </SubLabel>
            <Clothesline
              dystopiaOpen={isDystopiaOpen}
              freefallOpen={isFreefallOpen}
              onDystopia={handleToggleDystopia}
              onFreefall={handleToggleFreefall}
            />
          </section>

          <Divider0724 />

          <section aria-labelledby="eph-after">
            <SubLabel id="eph-after">她离开以后</SubLabel>
            <div className="mt-6 max-w-[36em]">
              <Prose paragraphs={[EPHEIA.after.opening]} />
              <ul className="my-8 space-y-1 border-l-2 border-rule-soft/60 pl-5 font-serif text-[16px] leading-[1.9] text-ink-body md:text-[17.5px]">
                {EPHEIA.after.never.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <Prose paragraphs={EPHEIA.after.paragraphs} />
            </div>
          </section>

          <SyPosts />
        </section>

        {/* 02 她真正留下来的东西 */}
        <section aria-labelledby="eph-part-2" className="mt-20 md:mt-28">
          <SectionHead num="02" id="eph-part-2" title="她真正留下来的东西" />
          {/* 手机和中等宽度：Sy 的一句、她的聊天角、她做的依次往下；宽屏时左边放 Sy 的一句和她做的 */}
          <div className="lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10">
            <blockquote className="font-serif text-[17px] leading-[1.9] text-ink-body lg:col-span-5 lg:row-start-1">
              {EPHEIA.leftEpigraph}
            </blockquote>
            <div className="mx-auto mt-10 max-w-[580px] lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:mt-0 lg:max-w-none">
              <HerCorner />
            </div>
            <div className="lg:col-span-5 lg:row-start-2">
              <Works />
            </div>
          </div>
        </section>

        {/* 结尾：她的话 */}
        <div className="mt-24 md:mt-32">
          <HerWords />
        </div>
      </div>

      {/* 两首歌的音频实体（暗房用） */}
      <audio ref={freefallAudioRef} src="/audio/freefall/song.mp3" preload="metadata" />
      <audio ref={dystopiaAudioRef} src="/audio/dystopia/song.mp3" preload="metadata" />

      {isFreefallOpen && <FreefallDarkroom audioRef={freefallAudioRef} onClose={handleCloseFreefall} />}
      {isDystopiaOpen && <DystopiaDarkroom audioRef={dystopiaAudioRef} onClose={handleCloseDystopia} />}

      {portalReady &&
        createPortal(
          <>
            <FootnoteCard hidden={modalOpen} />
            <ChronoCard days={daysLeavesSy} world={worldTime} hidden={modalOpen} onOpen={openModal} />
            <ChronoModal
              open={modalOpen}
              focus={modalFocus}
              setFocus={setModalFocus}
              onClose={closeModal}
              restoreFocusRef={restoreFocusRef}
              days={daysLeavesSy}
              world={worldTime}
            />
          </>,
          document.body,
        )}
    </article>
  );
}
