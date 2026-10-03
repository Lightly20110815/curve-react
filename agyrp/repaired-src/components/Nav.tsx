import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * 修复版 Nav (已去除机械全大写双语眉标)
 *
 * 核心整改：
 * 1. 移除每个导航项下方悬挂的冗余全大写英文（EPHEIA / FRONT / ARCHIVES...）；
 * 2. 导航回归单行中文，版面呼吸感倍增；
 * 3. 彻底解决 768px~1160px 区间双行换行溢出问题；
 * 4. 当前页为下划线印章红，无多余毛玻璃花哨渐变。
 */
const links = [
  { to: "/epheia", label: "依菲雅", end: false },
  { to: "/", label: "头版", end: true },
  { to: "/archives", label: "存档", end: false },
  { to: "/categories", label: "版块", end: false },
  { to: "/tags", label: "索引", end: false },
  { to: "/notes", label: "随笔", end: false },
  { to: "/photos", label: "光影", end: false },
  { to: "/countdown", label: "倒计时", end: false },
  { to: "/links", label: "友链", end: false },
  { to: "/about", label: "编者", end: false },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 160);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav
      className={cn(
        "sticky top-0 z-40 border-b border-rule bg-paper transition-shadow",
        scrolled && "shadow-[0_2px_0_0_hsl(var(--rule)/0.25)]",
      )}
    >
      <div className="container flex items-center justify-between gap-4">
        {/* Tiny sticky title when scrolled */}
        <Link
          to="/"
          className="font-masthead text-[16px] font-bold tracking-tight text-ink transition-colors hover:text-stamp"
        >
          The Curve Times
        </Link>

        {/* Desktop links — clean single-line Chinese navigation */}
        <ul className="hidden min-w-0 flex-wrap items-center justify-center gap-x-1 md:flex lg:gap-x-2">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "block border-b-2 px-2.5 py-3 font-ui text-[13.5px] font-semibold transition-colors lg:px-3.5",
                    isActive
                      ? "border-stamp text-stamp"
                      : "border-transparent text-ink hover:text-stamp",
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Theme toggle (desktop) */}
        <div className="hidden md:block">
          <ThemeToggle className="h-9 w-9" />
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center text-ink"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="切换菜单"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="absolute left-0 top-full w-full border-b border-rule bg-paper shadow-lg md:hidden">
          <ul className="container divide-y divide-rule-soft/30 py-2">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between border-l-2 py-3 pl-3 font-ui text-[14px] font-semibold transition-colors",
                      isActive
                        ? "border-stamp text-stamp"
                        : "border-transparent text-ink hover:text-stamp",
                    )
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
