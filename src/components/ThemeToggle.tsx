/**
 * 主题切换 — auto → 夜 → 晨 三态循环。
 * auto 是默认：花园跟着你的时间走。
 */
import { Clock, MoonStars, SunHorizon } from "@phosphor-icons/react";
import { useTheme } from "@/hooks/useTheme";

const MODE_META = {
  auto: { label: "跟随时辰", next: "切到夜" },
  night: { label: "夜", next: "切到晨" },
  dawn: { label: "晨", next: "回到跟随时辰" },
} as const;

export function ThemeToggle() {
  const { mode, theme, cycle } = useTheme();
  const meta = MODE_META[mode];

  return (
    <button
      type="button"
      onClick={cycle}
      title={`当前：${meta.label}（点击${meta.next}）`}
      aria-label={`主题：${meta.label}，点击${meta.next}`}
      className="pressable flex h-10 items-center gap-1.5 rounded-full px-3 text-mist transition-colors duration-200 hover:bg-veil hover:text-ink-strong"
    >
      {mode === "auto" ? (
        <Clock size={18} weight="light" />
      ) : theme === "night" ? (
        <MoonStars size={18} weight="light" />
      ) : (
        <SunHorizon size={18} weight="light" />
      )}
      <span className="font-mono text-[11px] tracking-wider">{meta.label}</span>
    </button>
  );
}
