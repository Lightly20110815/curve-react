import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Masthead } from "@/components/Masthead";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ContextMenu } from "@/components/ContextMenu";
import { posts } from "@/content/posts";

export default function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Masthead issueNo={posts.length} totalIssues={posts.length} />
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MusicPlayer />
      <ContextMenu />
    </div>
  );
}
