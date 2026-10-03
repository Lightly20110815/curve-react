import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * Ten sections with two-line labels need ~1160px to sit on one row. Below that
 * they overflowed the viewport — 294px of horizontal scroll at 768px, which cut
 * off 倒计时 / 友链 / 编者 entirely. The strip now wraps into two rows from md
 * and returns to a single row at xl.
 *
 * The `min-w` floors are xl-only for the same reason: they were what stopped
 * the items shrinking, so with them applied at md the row could not compress.
 */
const links = [
  { to: "/epheia", label: "EPHEIA", subLabel: "依菲雅", end: false, width: "xl:min-w-[76px]" },
  { to: "/", label: "FRONT", subLabel: "头版", end: true, width: "xl:min-w-[68px]" },
  { to: "/archives", label: "ARCHIVES", subLabel: "存档", end: false, width: "xl:min-w-[82px]" },
  { to: "/categories", label: "SECTIONS", subLabel: "版块", end: false, width: "xl:min-w-[74px]" },
  { to: "/tags", label: "INDEX", subLabel: "索引", end: false, width: "xl:min-w-[72px]" },
  { to: "/notes", label: "OPINION", subLabel: "随笔", end: false, width: "xl:min-w-[78px]" },
  { to: "/photos", label: "GALLERY", subLabel: "光影", end: false, width: "xl:min-w-[76px]" },
  { to: "/countdown", label: "COUNTDOWN", subLabel: "倒计时", end: false, width: "xl:min-w-[84px]" },
  { to: "/links", label: "LINKS", subLabel: "友链", end: false, width: "xl:min-w-[68px]" },
  { to: "/about", label: "MASTHEAD", subLabel: "编者", end: false, width: "xl:min-w-[70px]" },
] as const;

/**
 * Sub-navigation strip — sits under the masthead.
 * Sticky on scroll. Newspaper section labels with Chinese sub-labels.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
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
        "sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur transition-shadow",
        scrolled && "shadow-[0_2px_0_0_hsl(var(--rule)/0.3)]",
      )}
    >
      <div className="container flex items-center justify-between gap-4">
        {/* Tiny sticky title when scrolled */}
        <Link to="/" className="font-masthead text-[16px] font-bold tracking-tight text-ink transition-colors hover:text-stamp text-glow-sub">
          Curve
        </Link>

        {/* Desktop links */}
        <ul className="hidden min-w-0 flex-wrap items-end justify-center gap-x-0.5 gap-y-0.5 md:flex xl:gap-x-2">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "group flex flex-col items-center border-b-[3px] border-transparent px-1 py-1 transition-colors xl:px-3 xl:py-1.5",
                    l.width,
                    isActive ? "border-stamp text-stamp" : "text-ink hover:text-stamp",
                  )
                }
              >
                {({ isActive }) => (
                  <span
                    className={cn(
                      "font-ui text-[13px] xl:text-[14px]",
                      isActive
                        ? "font-black text-stamp"
                        : "font-semibold text-ink-strong group-hover:text-stamp",
                    )}
                  >
                    {l.subLabel}
                  </span>
                )}
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
                      "flex items-baseline justify-between border-l-2 border-transparent py-3 pl-2 transition-colors",
                      isActive ? "border-stamp text-stamp" : "text-ink hover:text-stamp",
                    )
                  }
                >
                  <span className="font-ui text-[15px] font-semibold">
                    {l.subLabel}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
