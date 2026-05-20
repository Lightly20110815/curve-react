import { cn } from "@/lib/utils";

/**
 * Decorative section break — three diamonds centered on a thin rule.
 * The newspaper equivalent of "* * *" between scenes in fiction.
 */
export function Ornament({
  className,
  symbol = "✦",
  count = 3,
}: {
  className?: string;
  symbol?: string;
  count?: number;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-rule" />
      <span className="font-display text-[14px] text-stamp">
        {symbol.repeat(count).split("").join(" ")}
      </span>
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}

/**
 * Inline kicker — small uppercase label, often above a headline.
 */
export function Kicker({
  children,
  className,
  variant = "ink",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "ink" | "stamp";
}) {
  return (
    <span
      className={cn(
        "inline-block font-ui text-[12px] font-semibold uppercase",
        variant === "stamp" ? "text-stamp" : "text-ink-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Drop cap for the first paragraph of an article body.
 * Wraps the first letter (or character) of the children.
 * Use as: <DropCap>这是文章的第一段...</DropCap>
 */
export function DropCap({ children }: { children: string }) {
  const first = children.slice(0, 1);
  const rest = children.slice(1);
  return (
    <p className="font-serif text-[18px] leading-[1.9] text-ink-body">
      <span
        className="float-left mr-2 mt-1 font-display text-[64px] font-bold leading-[0.8] text-stamp"
        aria-hidden="true"
      >
        {first}
      </span>
      <span>
        <span className="sr-only">{first}</span>
        {rest}
      </span>
    </p>
  );
}

/**
 * Byline — "by AUTHOR · DATELINE"
 */
export function Byline({
  author,
  dateline,
  className,
}: {
  author: string;
  dateline: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-ui text-[12px] font-medium uppercase text-ink-muted",
        className,
      )}
    >
      <span className="italic">by</span>{" "}
      <span className="font-semibold text-ink">{author}</span>
      <span className="mx-2 text-ink-faded">·</span>
      <span>{dateline}</span>
    </p>
  );
}

/**
 * Pull quote — large hanging quote with serif italic.
 */
export function PullQuote({
  children,
  attribution,
}: {
  children: React.ReactNode;
  attribution?: string;
}) {
  return (
    <figure className="my-8 border-y-[3px] border-double border-rule py-6">
      <blockquote className="font-serif text-[27px] leading-[1.45] text-ink-strong">
        <span aria-hidden className="mr-1 text-stamp">"</span>
        {children}
        <span aria-hidden className="ml-1 text-stamp">"</span>
      </blockquote>
      {attribution && (
        <figcaption className="mt-3 font-ui text-[12px] font-medium uppercase text-ink-muted">
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}
