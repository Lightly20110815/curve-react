import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
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
import { ThemeProvider } from "@/hooks/useTheme";

function LayoutShell() {
  const { pathname } = useLocation();
  const { asOf } = useAsOf();
  const { isZen } = useZenMode();
  const outletDelay = useMemo(() => Math.round(200 + Math.random() * 800), [pathname]);
  const visiblePosts = useMemo(() => filterByAsOf(posts, asOf), [asOf]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {!isZen && <AsOfBanner />}
      {!isZen && (
        <div key={`header-${pathname}`} className="page-impression-header">
          <Masthead issueNo={visiblePosts.length} totalIssues={visiblePosts.length} />
          <Nav />
        </div>
      )}
      <main className="relative flex-1 overflow-x-clip">
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
