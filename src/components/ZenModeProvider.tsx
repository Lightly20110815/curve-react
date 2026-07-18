import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

interface ZenModeState {
  isZen: boolean;
  enterZen: () => void;
  exitZen: () => void;
  toggleZen: () => void;
}

const ZenModeContext = createContext<ZenModeState | null>(null);

/**
 * Zen Mode — immersive reading state.
 *
 * Hides the masthead/nav/footer/music chrome so only the article body
 * (plus the reading progress bar and TOC) remains. Auto-exits whenever
 * the user navigates to a different route, so the state is always
 * scoped to "this one article".
 */
export function ZenModeProvider({ children }: { children: ReactNode }) {
  const [isZen, setIsZen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setIsZen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isZen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsZen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isZen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("zen-mode", isZen);
    return () => {
      document.body.classList.remove("zen-mode");
    };
  }, [isZen]);

  const enterZen = useCallback(() => setIsZen(true), []);
  const exitZen = useCallback(() => setIsZen(false), []);
  const toggleZen = useCallback(() => setIsZen((v) => !v), []);

  const value = useMemo<ZenModeState>(
    () => ({ isZen, enterZen, exitZen, toggleZen }),
    [isZen, enterZen, exitZen, toggleZen],
  );

  return <ZenModeContext.Provider value={value}>{children}</ZenModeContext.Provider>;
}

export function useZenMode(): ZenModeState {
  const ctx = useContext(ZenModeContext);
  if (!ctx) {
    throw new Error("useZenMode must be used inside <ZenModeProvider>");
  }
  return ctx;
}
