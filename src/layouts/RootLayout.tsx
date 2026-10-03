import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import { Masthead } from "@/components/Masthead";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ContextMenu } from "@/components/ContextMenu";
import { ArticleAiProvider } from "@/components/ArticleAiProvider";
import { AsOfBanner } from "@/components/AsOfBanner";
import { ZenModeProvider, useZenMode } from "@/components/ZenModeProvider";
import { posts } from "@/content/posts";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf } from "@/lib/as-of";
import { formatDocumentTitle } from "@/lib/route-meta";
import { ThemeProvider } from "@/hooks/useTheme";

function LayoutShell() {
  const { pathname } = useLocation();
  const { asOf } = useAsOf();
  const { isZen } = useZenMode();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathRef = useRef<string | null>(null);
  const outletDelay = useMemo(() => Math.round(60 + Math.random() * 180), [pathname]);
  const visiblePosts = useMemo(() => filterByAsOf(posts, asOf), [asOf]);

  // A client-side route change replaces the view without a page load, so the
  // tab title and the reading position both have to be moved by hand —
  // otherwise a screen-reader user gets no signal that anything happened.
  useEffect(() => {
    document.title = formatDocumentTitle(pathname);

    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;

    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    // Only move focus when the route genuinely changed. The previous-path
    // comparison (rather than a "first render" flag) also survives the
    // StrictMode double-invoke, which would otherwise steal focus on load.
    if (previousPath === null || previousPath === pathname) return;
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-rule focus:bg-paper focus:px-4 focus:py-2 focus:font-ui focus:text-[13px] focus:font-semibold focus:text-ink-strong"
      >
        跳到正文
      </a>
      {!isZen && <AsOfBanner />}
      {!isZen && (
        <div key={`header-${pathname}`} className="page-impression-header">
          <Masthead issueNo={visiblePosts.length} />
          <Nav />
        </div>
      )}
      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="relative flex-1 overflow-x-clip outline-none"
      >
        <div
          key={pathname}
          className="page-impression min-h-full"
          style={{ "--outlet-delay": `${outletDelay}ms` } as React.CSSProperties}
        >
          <Outlet />
        </div>
      </main>
      {!isZen && <Footer />}
      {!isZen && <MusicPlayer />}
      <ContextMenu />
    </div>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ZenModeProvider>
        <ArticleAiProvider>
          <LayoutShell />
        </ArticleAiProvider>
      </ZenModeProvider>
    </ThemeProvider>
  );
}
