import { cn } from "@/lib/utils";
import { Kicker, Ornament } from "./editorial";

interface Props {
  kicker?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * Newspaper section header — kicker label + serif headline + ornament rule.
 */
export function PageHeader({ kicker, title, description, align = "left", className }: Props) {
  const center = align === "center";
  return (
    <header className={cn(center && "text-center", className)}>
      {kicker && <Kicker variant="stamp">{kicker}</Kicker>}
      <h1 className="mt-3 font-display text-[clamp(40px,6vw,68px)] font-bold leading-[1.12] text-balance text-ink-strong">
        {title}
      </h1>
      {description && (
        <p
          className={cn(
            "mt-5 max-w-2xl font-serif text-[18px] leading-[1.85] text-ink-body",
            center && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
      <Ornament className="mt-8" />
    </header>
  );
}
