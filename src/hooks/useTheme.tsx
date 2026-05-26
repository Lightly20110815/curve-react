import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getDelayUntilNextMinute,
  getInitialTimeTheme,
  getThemeChromeColor,
  getTimeTheme,
  getTimeThemeInfo,
  syncDocumentChromeColor,
  type ThemeMode,
  type TimeTheme,
} from "@/lib/time-theme";

export type Theme = ThemeMode;

const STORAGE_KEY = "curve-theme";

interface ThemeContextValue {
  theme: Theme;
  timeTheme: TimeTheme;
  timeThemeInfo: ReturnType<typeof getTimeThemeInfo>;
  toggle: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // Ignore storage failures and fall back to system preference.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [timeTheme, setTimeTheme] = useState<TimeTheme>(getInitialTimeTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    syncDocumentChromeColor(theme, timeTheme, root);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures and keep the UI functional.
    }
  }, [theme, timeTheme]);

  useEffect(() => {
    let timeoutId: number | null = null;

    const schedule = () => {
      timeoutId = window.setTimeout(() => {
        const nextTheme = getTimeTheme(new Date());
        setTimeTheme((prev) => (prev === nextTheme ? prev : nextTheme));
        schedule();
      }, getDelayUntilNextMinute());
    };

    schedule();

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (event: MediaQueryListEvent) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setTheme(event.matches ? "dark" : "light");
        }
      } catch {
        setTheme(event.matches ? "dark" : "light");
      }
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      timeTheme,
      timeThemeInfo: getTimeThemeInfo(timeTheme),
      toggle: () => setTheme((current) => (current === "light" ? "dark" : "light")),
      mounted,
    }),
    [mounted, theme, timeTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}

export function getInlineThemeChromeColor(mode: ThemeMode, date: Date = new Date()): string {
  return getThemeChromeColor(mode, getTimeTheme(date));
}
