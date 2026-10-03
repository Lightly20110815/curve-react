import { cn } from "@/lib/utils";
import { Kicker } from "@/components/Editorial";

interface Props {
  kicker?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

function kickerLabel(kicker: string | undefined, title: string) {
  if (!kicker) return null;
  const parts = kicker.split("·").map((part) => part.trim()).filter(Boolean);
  const han = parts.find((part) => /\p{Script=Han}/u.test(part));
  const text = han ?? parts[parts.length - 1] ?? "";
  if (!text || text === title) return null;
  return text;
}

export function PageHeader({ kicker, title, description, align = "left", className }: Props) {
  const center = align === "center";
  const label = kickerLabel(kicker, title);
  return (
    <header className={cn(center && "text-center", className)}>
      {label && <Kicker variant="stamp">{label}</Kicker>}
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
      <div className="mt-8 border-t border-rule/80" />
    </header>
  );
}
