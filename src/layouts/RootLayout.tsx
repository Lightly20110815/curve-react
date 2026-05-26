import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Masthead } from "@/components/Masthead";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ContextMenu } from "@/components/ContextMenu";
import { ArticleAiProvider } from "@/components/ArticleAiProvider";
import { posts } from "@/content/posts";

export default function RootLayout() {
  const { pathname } = useLocation();
  const outletDelay = useMemo(() => Math.round(200 + Math.random() * 800), [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <ArticleAiProvider>
      <div className="flex min-h-screen flex-col bg-paper">
        <div key={`header-${pathname}`} className="page-impression-header">
          <Masthead issueNo={posts.length} totalIssues={posts.length} />
          <Nav />
        </div>
        <main className="relative flex-1 overflow-x-clip">
          <div
            key={pathname}
            className="page-impression min-h-full"
            style={{ "--outlet-delay": `${outletDelay}ms` } as React.CSSProperties}
          >
            <Outlet />
          </div>
        </main>
        <Footer />
        <MusicPlayer />
        <ContextMenu />
      </div>
    </ArticleAiProvider>
  );
}
