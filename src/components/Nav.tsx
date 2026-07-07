/**
 * 顶部导航 — 安静的一行。
 *
 * 首页顶部透明地浮在夜空上，滚动后贴顶并加毛玻璃。
 * 移动端汉堡展开为全屏遮罩，链接逐个浮现。
 */
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "首页", end: true },
  { to: "/archives", label: "文字", end: false },
  { to: "/notes", label: "随笔", end: false },
  { to: "/countdown", label: "花期", end: false },
  { to: "/links", label: "友邻", end: false },
  { to: "/about", label: "关于", end: false },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // 路由变化时收起移动端菜单
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        // 只过渡颜色，不过渡 backdrop-filter —— 滤镜过渡会让合成器持续持有快照图层
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-300",
        scrolled
          ? "border-b border-line bg-page/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 md:px-8">
        <Link
          to="/"
          className="text-[17px] font-bold tracking-wide text-ink-strong transition-colors hover:text-firefly"
        >
          Sy 的数字花园
        </Link>

        {/* 桌面端链接 */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3.5 py-1.5 text-[14.5px] transition-colors duration-200",
                  isActive
                    ? "text-firefly"
                    : "text-mist hover:bg-veil hover:text-ink-strong",
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          <span className="mx-2 h-4 w-px bg-line" aria-hidden />
          <ThemeToggle />
        </nav>

        {/* 移动端按钮 */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "收起菜单" : "展开菜单"}
            className="pressable flex h-10 w-10 items-center justify-center rounded-full text-ink-strong"
          >
            {open ? <X size={22} weight="light" /> : <List size={22} weight="light" />}
          </button>
        </div>
      </div>

      {/* 移动端全屏菜单 */}
      {open && (
        <div className="fixed inset-0 top-16 z-40 bg-page/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1 px-8 pt-10" aria-label="移动端导航">
            {links.map((l, i) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "menu-item-rise rounded-xl px-4 py-3.5 text-[22px]",
                    isActive ? "text-firefly" : "text-ink-strong",
                  )
                }
                style={{ animationDelay: `${i * 45}ms` }}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
