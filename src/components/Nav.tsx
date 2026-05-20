import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "FRONT", subLabel: "头版", end: true },
  { to: "/archives", label: "ARCHIVES", subLabel: "存档" },
  { to: "/categories", label: "SECTIONS", subLabel: "版块" },
  { to: "/tags", label: "INDEX", subLabel: "索引" },
  { to: "/notes", label: "OPINION", subLabel: "随笔" },
  { to: "/about", label: "MASTHEAD", subLabel: "编者" },
];

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
      <div className="container flex items-center justify-between">
        {/* Tiny sticky title when scrolled */}
        <Link to="/" className="font-masthead text-[18px] font-bold text-ink hover:text-stamp">
          The Curve Times
        </Link>

        {/* Desktop links */}
        <ul className="hidden divide-x divide-rule-soft/35 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "group flex flex-col items-center px-3 py-3 transition-colors",
                    isActive ? "text-stamp" : "text-ink hover:text-stamp",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="font-ui text-[12px] font-semibold uppercase">
                      {l.label}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 font-ui text-[12px] font-medium",
                        isActive ? "text-stamp" : "text-ink-muted group-hover:text-stamp",
                      )}
                    >
                      {l.subLabel}
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
                      "flex items-baseline justify-between py-3 transition-colors",
                      isActive ? "text-stamp" : "text-ink hover:text-stamp",
                    )
                  }
                >
                  <span className="font-ui text-[13px] font-semibold uppercase">
                    {l.label}
                  </span>
                  <span className="font-ui text-[13px] font-medium text-ink-muted">
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
