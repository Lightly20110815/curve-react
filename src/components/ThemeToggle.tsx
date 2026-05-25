import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  variant?: "icon" | "menu";
}

/**
 * Theme toggle button — switches between light (newsprint) and dark (darkroom) modes.
 */
export function ThemeToggle({ className, variant = "icon" }: Props) {
  const { theme, toggle, mounted } = useTheme();

  // Prevent hydration mismatch: render a placeholder until mounted
  if (!mounted) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center text-ink-muted",
          variant === "icon" && "h-10 w-10",
          variant === "menu" && "px-3 py-2",
          className,
        )}
        aria-hidden
      >
        <span className="h-4 w-4" />
      </span>
    );
  }

  const isDark = theme === "dark";

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors",
          "hover:bg-ink hover:text-paper",
          "focus-visible:bg-ink focus-visible:text-paper focus-visible:outline-none",
          className,
        )}
      >
        <span className="flex items-center gap-2.5">
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          <span className="font-serif text-[14px] leading-none">
            {isDark ? "切回日间" : "进入暗房"}
          </span>
        </span>
        <span className="font-ui text-[11px] font-medium uppercase opacity-60">
          {isDark ? "Light" : "Dark"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-stamp",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40",
        className,
      )}
      aria-label={isDark ? "切换到日间模式" : "切换到暗房模式"}
      title={isDark ? "日间模式" : "暗房模式"}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
