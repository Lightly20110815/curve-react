import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Copy,
  Home,
  Mail,
  RotateCw,
  ScrollText,
  Pencil,
} from "lucide-react";
import { siteContactMailHref } from "@/lib/site";
import { cn } from "@/lib/utils";

interface Position {
  x: number;
  y: number;
}

/**
 * Custom right-click menu — a small newspaper-style "editor's toolbox".
 *
 * Behavior:
 * - Intercepts contextmenu globally; replaces native menu with our own.
 * - Position-aware: flips toward top/left when near viewport edges.
 * - Dismisses on outside click, Escape, scroll, route change, or window blur.
 * - Disabled inside <input>/<textarea>/contentEditable areas so the user
 *   can still get the native "Cut/Copy/Paste" menu when editing text.
 */
export function ContextMenu() {
  const [pos, setPos] = useState<Position | null>(null);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isEditable = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      return false;
    };

    const onCtx = (e: MouseEvent) => {
      if (isEditable(e.target)) return; // let the browser handle text inputs
      e.preventDefault();
      const W = 248;
      const H = 320; // upper bound; flip-anchor handles real height
      const x = e.clientX + W > window.innerWidth ? e.clientX - W : e.clientX;
      const y = e.clientY + H > window.innerHeight ? e.clientY - H : e.clientY;
      setPos({ x: Math.max(8, x), y: Math.max(8, y) });
    };

    const close = () => setPos(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("contextmenu", onCtx);
    document.addEventListener("click", close);
    document.addEventListener("scroll", close, true);
    window.addEventListener("blur", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", close, true);
      window.removeEventListener("blur", close);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!pos) return null;

  const go = (path: string) => () => navigate(path);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      /* clipboard may be blocked in insecure contexts — fail silently */
    }
  };

  const sendMail = () => {
    window.location.href = siteContactMailHref;
  };

  const reload = () => window.location.reload();

  return (
    <div
      ref={ref}
      role="menu"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed z-[100] w-[248px] animate-fade-in border-2 border-ink bg-paper shadow-[4px_4px_0_0_hsl(var(--ink))]"
    >
      {/* Mini-masthead header */}
      <div className="border-b-2 border-ink bg-ink px-3 py-2 text-paper">
        <p className="font-masthead text-[15px] font-black leading-none">THE CURVE TIMES</p>
        <p className="mt-1 font-ui text-[11px] font-medium uppercase text-paper/60">
          Editor's toolbox · 编报工具
        </p>
      </div>

      <ul className="py-1">
        <Item icon={Home} onSelect={go("/")} label="回头版" hint="Front" />
        <Item icon={Archive} onSelect={go("/archives")} label="完整存档" hint="Archives" />
        <Item icon={ScrollText} onSelect={go("/notes")} label="读读随笔" hint="Notes" />
        <Item icon={Pencil} onSelect={go("/about")} label="编者按" hint="About" />
        <Divider />
        <Item icon={Copy} onSelect={copyLink} label="复制本页链接" hint="Copy URL" />
        <Item icon={RotateCw} onSelect={reload} label="重新印刷" hint="Reload" />
        <Divider />
        <Item icon={Mail} onSelect={sendMail} label="写信给编辑" hint="Mail" />
      </ul>

      <p className="border-t border-rule bg-paper-warm/50 px-3 py-1.5 text-center font-ui text-[11px] font-medium uppercase text-ink-faded">
        Right-click anywhere · ESC to close
      </p>
    </div>
  );
}

function Item({
  icon: Icon,
  onSelect,
  label,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  label: string;
  hint: string;
}) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors",
          "hover:bg-ink hover:text-paper",
          "focus-visible:bg-ink focus-visible:text-paper focus-visible:outline-none",
        )}
      >
        <span className="flex items-center gap-2.5">
          <Icon className="h-3.5 w-3.5" />
          <span className="font-serif text-[14px] leading-none">{label}</span>
        </span>
        <span className="font-ui text-[11px] font-medium uppercase opacity-60">
          {hint}
        </span>
      </button>
    </li>
  );
}

function Divider() {
  return (
    <li role="separator" aria-hidden="true" className="my-1 border-t border-rule-soft/30" />
  );
}
