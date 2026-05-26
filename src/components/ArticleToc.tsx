import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { ChevronRight, List, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface Props {
  /** Container element whose headings we're indexing (e.g. the article body). */
  containerRef: RefObject<HTMLElement>;
  /**
   * Re-extract on this key change (e.g. post slug). Headings are pulled from
   * the live DOM after dangerouslySetInnerHTML, so we need a trigger.
   */
  contentKey: string;
}

const HEADING_SELECTOR = "h2[id], h3[id]";

/**
 * Sticky table of contents for the current article.
 *
 * - Reads h2/h3 with ids (rehype-slug provides them at build time)
 * - IntersectionObserver tracks which heading is currently in view
 * - Floating toggle on the right edge of the viewport opens the panel
 * - Click a heading to smooth-scroll there
 */
export function ArticleToc({ containerRef, contentKey }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Extract headings whenever the article content changes.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setHeadings([]);
      return;
    }
    const nodes = Array.from(
      container.querySelectorAll<HTMLHeadingElement>(HEADING_SELECTOR),
    );
    const next: Heading[] = nodes.map((node) => ({
      id: node.id,
      text: (node.textContent ?? "").trim(),
      level: Number(node.tagName.slice(1)) || 2,
    }));
    setHeadings(next);
    setActiveId(next[0]?.id ?? null);
  }, [containerRef, contentKey]);

  // Track which heading is currently most relevant by its viewport position.
  useEffect(() => {
    if (headings.length === 0) return;
    const container = containerRef.current;
    if (!container) return;

    const nodes = headings
      .map((h) => container.querySelector<HTMLHeadingElement>(`#${CSS.escape(h.id)}`))
      .filter((n): n is HTMLHeadingElement => n !== null);

    function pickActive() {
      // Find the last heading whose top is above the 1/3-viewport mark.
      const threshold = window.innerHeight * 0.32;
      let current: string | null = nodes[0]?.id ?? null;
      for (const node of nodes) {
        const top = node.getBoundingClientRect().top;
        if (top - threshold <= 0) {
          current = node.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        pickActive();
        ticking = false;
      });
    };

    pickActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [containerRef, headings]);

  // Click-outside closes the floating panel.
  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!panelRef.current) return;
      if (panelRef.current.contains(event.target as Node)) return;
      const trigger = (event.target as HTMLElement).closest(
        "[data-toc-trigger='true']",
      );
      if (trigger) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  function handleJump(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  }

  const flat = useMemo(() => headings, [headings]);

  if (flat.length < 2) return null;

  return (
    <>
      {/* Trigger — small dot on right edge */}
      <button
        type="button"
        data-toc-trigger="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-1 border border-rule-soft/55 bg-paper/95 px-2 py-2 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted shadow-sm transition-colors hover:border-stamp hover:text-stamp md:inline-flex",
          open && "border-stamp text-stamp",
        )}
        aria-label="目录"
        aria-expanded={open}
      >
        <List className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">目录</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed right-3 top-1/2 z-40 hidden max-h-[70vh] w-[280px] -translate-y-1/2 flex-col border border-rule-soft/60 bg-paper/97 shadow-[0_10px_30px_hsl(var(--ink)/0.12)] backdrop-blur md:flex"
          role="dialog"
          aria-label="文章目录"
        >
          <header className="flex items-center justify-between border-b border-rule-soft/45 px-3 py-2">
            <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              目录 · Contents
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-6 w-6 items-center justify-center text-ink-muted transition-colors hover:text-stamp"
              aria-label="收起目录"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </header>
          <ol className="flex-1 overflow-y-auto py-1.5">
            {flat.map((h) => {
              const isActive = h.id === activeId;
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => handleJump(h.id)}
                    className={cn(
                      "group flex w-full items-start gap-1.5 border-l-2 border-transparent px-3 py-1.5 text-left font-serif text-[13px] leading-[1.55] transition-colors",
                      h.level === 3 && "pl-7 text-[12.5px]",
                      isActive
                        ? "border-stamp bg-[hsl(var(--stamp-soft))]/55 text-stamp"
                        : "text-ink-body hover:bg-paper-warm/55 hover:text-stamp",
                    )}
                  >
                    <ChevronRight
                      className={cn(
                        "mt-1 h-3 w-3 flex-shrink-0 transition-transform",
                        isActive ? "translate-x-0 text-stamp" : "-translate-x-0.5 text-ink-faded",
                      )}
                    />
                    <span className="min-w-0 break-words">{h.text}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </>
  );
}
