import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "FRONT", subLabel: "头版", end: true, width: "min-w-[68px]" },
  { to: "/archives", label: "ARCHIVES", subLabel: "存档", end: false, width: "min-w-[82px]" },
  { to: "/categories", label: "SECTIONS", subLabel: "版块", end: false, width: "min-w-[74px]" },
  { to: "/tags", label: "INDEX", subLabel: "索引", end: false, width: "min-w-[72px]" },
  { to: "/notes", label: "OPINION", subLabel: "随笔", end: false, width: "min-w-[78px]" },
  { to: "/links", label: "LINKS", subLabel: "友链", end: false, width: "min-w-[68px]" },
  { to: "/about", label: "MASTHEAD", subLabel: "编者", end: false, width: "min-w-[70px]" },
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
        <Link to="/" className="font-masthead text-[16px] font-bold tracking-tight text-ink transition-colors hover:text-stamp">
          Curve
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-end gap-2 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "group flex flex-col items-center border-b-[4px] border-transparent px-3 py-2 transition-colors",
                    l.width,
                    isActive ? "border-stamp text-stamp" : "text-ink hover:text-stamp",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "font-ui text-[13px] tracking-[0.1em]",
                        isActive
                          ? "font-black text-stamp"
                          : "font-semibold text-ink-strong group-hover:text-stamp",
                      )}
                    >
                      {l.subLabel}
                    </span>
                    <span
                      className={cn(
                        "mt-1 font-ui text-[11px] font-medium uppercase tracking-[0.14em]",
                        isActive ? "text-stamp/85" : "text-ink-muted group-hover:text-stamp/70",
                      )}
                    >
                      {l.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center text-ink md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="切换菜单"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="border-t border-rule bg-paper md:hidden">
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
                  <span className="font-ui text-[13px] font-semibold">
                    {l.subLabel}
                  </span>
                  <span className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                    {l.label}
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
