import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import type { ThemePreference } from "@/lib/time-theme";

interface Props {
  className?: string;
  variant?: "icon" | "menu";
}

const MENU_OPTIONS: { pref: ThemePreference; label: string; hint: string }[] = [
  { pref: "auto", label: "自动跟随系统", hint: "Auto" },
  { pref: "light", label: "日间模式", hint: "Light" },
  { pref: "dark", label: "暗房模式", hint: "Dark" },
];

/** Set the reveal origin for the View Transitions circular wipe. */
function setRevealOrigin(event: React.MouseEvent<HTMLElement>) {
  const root = document.documentElement;
  root.style.setProperty("--vt-x", `${event.clientX}px`);
  root.style.setProperty("--vt-y", `${event.clientY}px`);
}

/**
 * Theme toggle — three-state preference (auto / light / dark).
 * - icon variant: quick light↔dark flip from the resolved mode; clicking
 *   enters manual mode. Use the menu variant to return to "auto".
 * - menu variant: explicit three-row picker, used in the context menu.
 */
export function ThemeToggle({ className, variant = "icon" }: Props) {
  const { theme, isDark, toggle, setTheme, mounted, timeThemeInfo } = useTheme();

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

  if (variant === "menu") {
    return (
      <div role="group" aria-label="主题模式" className="flex flex-col">
        {MENU_OPTIONS.map((opt) => {
          const active = theme === opt.pref;
          const Icon = opt.pref === "auto" ? SunMoon : opt.pref === "dark" ? Moon : Sun;
          return (
            <button
              key={opt.pref}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={(e) => {
                setRevealOrigin(e);
                setTheme(opt.pref);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors",
                "hover:bg-ink hover:text-paper",
                "focus-visible:bg-ink focus-visible:text-paper focus-visible:outline-none",
                active && "text-stamp",
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-3.5 w-3.5" />
                <span className="font-serif text-[14px] leading-none">{opt.label}</span>
              </span>
              <span className="flex items-center gap-1.5">
                {active && <span className="h-1.5 w-1.5 rounded-full bg-stamp" aria-hidden />}
                <span className="font-ui text-[11px] font-medium uppercase opacity-60">{opt.hint}</span>
              </span>
            </button>
          );
        })}
        <span className="px-3 pb-1 pt-0.5 font-ui text-[10px] font-medium uppercase tracking-[0.1em] text-ink-faded">
          当前 · {isDark ? "暗房" : "日间"} · {timeThemeInfo.label}版
        </span>
      </div>
    );
  }

  const autoBadge = theme === "auto";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={(e) => {
        setRevealOrigin(e);
        toggle();
      }}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-stamp",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40",
        className,
      )}
      aria-label={isDark ? "切换到日间模式" : "切换到暗房模式"}
      title={
        autoBadge
          ? `自动跟随系统 · 当前${isDark ? "暗房" : "日间"} · 点击切到${isDark ? "日间" : "暗房"}`
          : `${isDark ? "暗房模式" : "日间模式"} · ${timeThemeInfo.label}版`
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      {autoBadge && (
        <span
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-stamp"
          aria-hidden
          title="自动模式"
        />
      )}
    </button>
  );
}
