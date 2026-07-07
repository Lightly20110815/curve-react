import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AsOfBanner } from "@/components/AsOfBanner";
import { MusicDock } from "@/components/MusicDock";

export default function RootLayout() {
  const { pathname } = useLocation();

  // 路由切换回到顶部（浏览器前进后退除外，交给默认行为）
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    // bg-page 让整页由同一个不透明图层绘制，避免 P3 屏上跨图层的色差缝；
    // ambient-sky / film-grain 是全站的背景质感层（见 globals.css）
    <div className="flex min-h-[100dvh] flex-col bg-page">
      <div aria-hidden className="ambient-sky" />
      <Nav />
      <AsOfBanner />
      <main className="relative z-[1] flex-1">
        <Outlet />
      </main>
      <Footer className="relative z-[1]" />
      <MusicDock />
      <div aria-hidden className="film-grain" />
    </div>
  );
}
