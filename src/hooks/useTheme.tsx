/**
 * 主题系统 — 「花园跟着你的时间」。
 *
 * 三种模式：
 * - auto（默认）：18:00–5:59 是夜，其余是晨；每分钟检查一次时刻跨越
 * - night / dawn：手动锁定，存入 localStorage
 *
 * index.html 里的内联脚本在 React 挂载前已按同样规则设置了
 * data-theme，这里只负责后续的切换与跨时刻更新。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { themeForHour, type GardenTheme } from "@/lib/garden-time";

export type ThemeMode = GardenTheme | "auto";

const STORAGE_KEY = "garden-theme";

interface ThemeContextValue {
  /** 用户选择的模式。 */
  mode: ThemeMode;
  /** 实际生效的主题。 */
  theme: GardenTheme;
  /** auto → night → dawn → auto 循环。 */
  cycle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "night" || raw === "dawn" ? raw : "auto";
  } catch {
    return "auto";
  }
}

function applyTheme(theme: GardenTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "night" ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "night" ? "#0a0f1e" : "#f1f3f6");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readStoredMode);
  const [hourTheme, setHourTheme] = useState<GardenTheme>(() =>
    themeForHour(new Date().getHours()),
  );

  const theme: GardenTheme = mode === "auto" ? hourTheme : mode;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // auto 模式下每分钟检查一次时刻跨越（黄昏 18:00 / 清晨 6:00）。
  useEffect(() => {
    if (mode !== "auto") return;
    const id = window.setInterval(() => {
      setHourTheme(themeForHour(new Date().getHours()));
    }, 60_000);
    return () => window.clearInterval(id);
  }, [mode]);

  const cycle = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode =
        prev === "auto" ? "night" : prev === "night" ? "dawn" : "auto";
      try {
        if (next === "auto") localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // 存储失败无妨，会话内仍然生效
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ mode, theme, cycle }), [mode, theme, cycle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
