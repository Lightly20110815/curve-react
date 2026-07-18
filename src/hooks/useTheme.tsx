import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getDelayUntilNextMinute,
  getInitialTimeTheme,
  getTimeTheme,
  getTimeThemeInfo,
  syncDocumentChromeColor,
  type ThemeMode,
  type ThemePreference,
  type TimeTheme,
} from "@/lib/time-theme";

export type Theme = ThemePreference;

const STORAGE_KEY = "curve-theme";
const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

interface ThemeContextValue {
  /** User preference — "auto" follows the OS, "light"/"dark" are manual locks. */
  theme: ThemePreference;
  /** The concrete mode actually applied to the DOM (always light/dark). */
  resolvedTheme: ThemeMode;
  /** True when the current resolved mode is dark. */
  isDark: boolean;
  /** Set an explicit preference (including back to "auto"). */
  setTheme: (pref: ThemePreference) => void;
  /** Quick light↔dark flip from the resolved mode (enters manual mode). */
  toggle: () => void;
  timeTheme: TimeTheme;
  timeThemeInfo: ReturnType<typeof getTimeThemeInfo>;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(SYSTEM_DARK_QUERY).matches;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && typeof document.startViewTransition === "function";
}

function resolveTheme(pref: ThemePreference, systemDark: boolean): ThemeMode {
  if (pref === "auto") return systemDark ? "dark" : "light";
  return pref;
}

function getInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "auto";

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "auto" || stored === "light" || stored === "dark") return stored;
  } catch {
    // Ignore storage failures and fall back to auto.
  }

  return "auto";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>(getInitialPreference);
  const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>(() =>
    resolveTheme(getInitialPreference(), systemPrefersDark()),
  );
  const [timeTheme, setTimeTheme] = useState<TimeTheme>(getInitialTimeTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const firstApply = useRef(true);

  // Apply the resolved mode to the DOM and sync chrome color. Animated via the
  // View Transitions API when available (circular reveal from the click point),
  // except on first mount or when the user prefers reduced motion.
  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      root.classList.toggle("dark", resolvedTheme === "dark");
      root.style.colorScheme = resolvedTheme;
      syncDocumentChromeColor(resolvedTheme, timeTheme, root);
    };

    if (firstApply.current || prefersReducedMotion() || !supportsViewTransitions()) {
      firstApply.current = false;
      apply();
      return;
    }

    firstApply.current = false;
    const vt = document.startViewTransition(apply);
    return () => {
      try {
        vt.skipTransition();
      } catch {
        // Transition may already be finished — safe to ignore.
      }
    };
  }, [resolvedTheme, timeTheme]);

  // Persist the user's preference (auto/light/dark).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures and keep the UI functional.
    }
  }, [theme]);

  // Whenever the preference changes, recompute the resolved mode from the
  // current OS preference.
  useEffect(() => {
    setResolvedTheme(resolveTheme(theme, systemPrefersDark()));
  }, [theme]);

  // Follow the OS in real time, but only while in "auto" mode.
  useEffect(() => {
    const mq = window.matchMedia(SYSTEM_DARK_QUERY);

    const handler = (event: MediaQueryListEvent) => {
      if (theme !== "auto") return;
      setResolvedTheme(event.matches ? "dark" : "light");
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

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

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === "dark",
      setTheme,
      toggle: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      timeTheme,
      timeThemeInfo: getTimeThemeInfo(timeTheme),
      mounted,
    }),
    [mounted, theme, resolvedTheme, timeTheme],
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
