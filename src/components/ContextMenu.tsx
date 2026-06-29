import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Copy,
  Home,
  Languages,
  Mail,
  Pencil,
  RotateCw,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { useArticleAi } from "@/components/ArticleAiProvider";
import { AnalogClock } from "@/components/AnalogClock";
import { NowPlaying } from "@/components/NowPlaying";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  buildSelectionExcerpt,
  isMeaningfulSelection,
  type ArticleAiDocument,
} from "@/lib/article-ai";
import { siteContactMailHref } from "@/lib/site";
import { getTimeThemeInfo } from "@/lib/time-theme";
import { cn } from "@/lib/utils";

interface Position {
  x: number;
  y: number;
}

interface SelectionSnapshot {
  text: string;
  surroundingText: string;
  anchorRect: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
  };
}

/**
 * Custom right-click menu — a small newspaper-style editor's toolbox.
 *
 * Behavior:
 * - Intercepts contextmenu globally; replaces native menu with our own.
 * - Position-aware: flips toward top/left when near viewport edges.
 * - Dismisses on outside click, Escape, scroll, route change, or window blur.
 * - Disabled inside editable fields so the native Cut/Copy/Paste menu remains available.
 */
export function ContextMenu() {
  const [pos, setPos] = useState<Position | null>(null);
  const [selectionSnapshot, setSelectionSnapshot] = useState<SelectionSnapshot | null>(null);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { activeArticle, runSelectionAction } = useArticleAi();

  useEffect(() => {
    const isEditable = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      return false;
    };

    const close = () => {
      setPos(null);
      setSelectionSnapshot(null);
    };

    const onCtx = (event: MouseEvent) => {
      if (isEditable(event.target)) return;

      event.preventDefault();
      setSelectionSnapshot(getSelectionSnapshot(activeArticle));

      const width = 248;
      const height = 400;
      const x = event.clientX + width > window.innerWidth ? event.clientX - width : event.clientX;
      const y = event.clientY + height > window.innerHeight ? event.clientY - height : event.clientY;
      setPos({ x: Math.max(8, x), y: Math.max(8, y) });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("contextmenu", onCtx);
    document.addEventListener("click", close);
    document.addEventListener("scroll", close, true);
    window.addEventListener("blur", close);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", close, true);
      window.removeEventListener("blur", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeArticle]);

  if (!pos) return null;

  const go = (path: string) => () => navigate(path);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard may be unavailable in insecure contexts.
    }
  };

  const sendMail = () => {
    window.location.href = siteContactMailHref;
  };

  const reload = () => window.location.reload();

  const onSelectionAction = (action: "explain" | "translate") => async () => {
    if (!selectionSnapshot) return;

    await runSelectionAction({
      action,
      selectedText: selectionSnapshot.text,
      surroundingText: selectionSnapshot.surroundingText,
      anchorRect: selectionSnapshot.anchorRect,
    });

    setPos(null);
    setSelectionSnapshot(null);
  };

  return (
    <div
      ref={ref}
      role="menu"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(event) => event.preventDefault()}
      className="fixed z-[100] w-[248px] animate-fade-in border-2 border-ink bg-paper shadow-[4px_4px_0_0_hsl(var(--ink))]"
    >
      <div className="border-b-2 border-ink bg-ink px-3 py-2 text-paper">
        <p className="font-masthead text-[15px] font-black leading-none">THE CURVE TIMES</p>
        <p className="mt-1 font-ui text-[11px] font-medium uppercase text-paper/60">
          Editor&apos;s toolbox · 编报工具
        </p>
      </div>

      <MenuClock />

      <div className="border-b border-rule" onClick={(event) => event.stopPropagation()}>
        <NowPlaying />
      </div>

      <ul className="py-1">
        <Item icon={Home} onSelect={go("/")} label="回头版" hint="Front" />
        <Item icon={Archive} onSelect={go("/archives")} label="完整存档" hint="Archives" />
        <Item icon={ScrollText} onSelect={go("/notes")} label="读读随笔" hint="Notes" />
        <Item icon={Pencil} onSelect={go("/about")} label="编者按" hint="About" />
        <Divider />
        {selectionSnapshot ? (
          <>
            <Item
              icon={Sparkles}
              onSelect={onSelectionAction("explain")}
              label="让 AI 解释"
              hint="Explain"
            />
            <Item
              icon={Languages}
              onSelect={onSelectionAction("translate")}
              label="AI 翻译成中文"
              hint="Translate"
            />
            <Divider />
          </>
        ) : null}
        <Item icon={Copy} onSelect={copyLink} label="复制本页链接" hint="Copy URL" />
        <Item icon={RotateCw} onSelect={reload} label="重新印刷" hint="Reload" />
        <Divider />
        <Item icon={Mail} onSelect={sendMail} label="写信给编辑" hint="Mail" />
        <Divider />
        <li role="none" onClick={(event) => event.stopPropagation()}>
          <ThemeToggle variant="menu" />
        </li>
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
        <span className="font-ui text-[11px] font-medium uppercase opacity-60">{hint}</span>
      </button>
    </li>
  );
}

function Divider() {
  return (
    <li role="separator" aria-hidden="true" className="my-1 border-t border-rule-soft/30" />
  );
}

function MenuClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");
  const timeThemeInfo = getTimeThemeInfo(time);

  return (
    <div
      className="flex items-center justify-center gap-5 border-b border-rule bg-paper-warm/40 py-3.5"
      onClick={(event) => event.stopPropagation()}
    >
      <AnalogClock className="h-12 w-12 border-2 shadow-none" time={time} />
      <div className="flex flex-col justify-center">
        <span className="font-ui leading-none text-[17px] font-black tracking-[0.05em] text-ink-strong">
          {hh}
          <span className="animate-[pulse_1s_ease-in-out_infinite] text-stamp opacity-80">:</span>
          {mm}
          <span className="animate-[pulse_1s_ease-in-out_infinite] text-stamp opacity-80">:</span>
          {ss}
        </span>
        <span className="mt-1 font-ui text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          {timeThemeInfo.badge}
        </span>
        <span className="mt-1 font-serif text-[11px] italic leading-[1.4] text-ink-muted">
          {timeThemeInfo.clockHint}
        </span>
      </div>
    </div>
  );
}

function getSelectionSnapshot(activeArticle: ArticleAiDocument | null): SelectionSnapshot | null {
  if (!activeArticle) return null;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

  const text = selection.toString();
  if (!isMeaningfulSelection(text)) return null;

  const range = selection.getRangeAt(0);
  const articleRoot = getArticleRoot(range.commonAncestorContainer);
  if (!articleRoot) return null;
  if (!articleRoot.contains(range.startContainer) || !articleRoot.contains(range.endContainer)) {
    return null;
  }

  const rect = range.getBoundingClientRect();
  if (!rect.width && !rect.height) return null;

  return {
    text: text.replace(/\s+/g, " ").trim(),
    surroundingText: buildSelectionExcerpt(activeArticle, text),
    anchorRect: {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
  };
}

function getArticleRoot(node: Node): HTMLElement | null {
  const element = node instanceof HTMLElement ? node : node.parentElement;
  return element?.closest("[data-article-content='true']") ?? null;
}
