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
import { getPostBySlug } from "@/content/posts";
import { isBeforeAsOf } from "@/lib/as-of";
import { useAsOf } from "@/hooks/useAsOf";

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
 * scoped to "this one article". 文章 frontmatter 里 zen: true 的篇目，
 * 点进来时默认就是禅模式——由这里按目标路由裁决，
 * 因为子组件的 effect 总先于 Provider 执行，交给页面自己进会被重置。
 */
export function ZenModeProvider({ children }: { children: ReactNode }) {
  const [isZen, setIsZen] = useState(false);
  const { pathname } = useLocation();
  const { asOf } = useAsOf();

  useEffect(() => {
    const match = /^\/posts\/([^/]+)\/?$/.exec(pathname);
    const post = match ? getPostBySlug(match[1]) : undefined;
    // 时间旅行里尚未刊登的文章显示占位页，不默认进禅
    const hidden = !!(post && asOf && !isBeforeAsOf(post.date, asOf));
    setIsZen(Boolean(post?.zen) && !hidden);
  }, [pathname, asOf]);

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
