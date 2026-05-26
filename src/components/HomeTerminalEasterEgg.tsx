import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Power, TerminalSquare, X } from "lucide-react";
import { buildTerminalAboutScript, type TerminalBootLine } from "@/lib/about-profile";
import { cn } from "@/lib/utils";

const KONAMI_CODE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
] as const;

interface RenderedLine extends TerminalBootLine {
  renderedText: string;
}

export function HomeTerminalEasterEgg() {
  const [open, setOpen] = useState(false);
  const [renderedLines, setRenderedLines] = useState<RenderedLine[]>([]);
  const [complete, setComplete] = useState(false);
  const sequenceIndexRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const script = useMemo(() => buildTerminalAboutScript(), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (isEditableTarget(target)) return;

      if (open) {
        if (event.key === "Escape") setOpen(false);
        return;
      }

      const key = event.key.toLowerCase();
      const expected = KONAMI_CODE[sequenceIndexRef.current];

      if (key === expected) {
        sequenceIndexRef.current += 1;
        if (sequenceIndexRef.current === KONAMI_CODE.length) {
          sequenceIndexRef.current = 0;
          setOpen(true);
        }
        return;
      }

      sequenceIndexRef.current = key === KONAMI_CODE[0] ? 1 : 0;
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("terminal-easter-egg-open");
    setRenderedLines([]);
    setComplete(false);

    let cancelled = false;
    let lineIndex = 0;
    let charIndex = 0;

    const step = () => {
      if (cancelled) return;
      const currentLine = script[lineIndex];
      if (!currentLine) {
        setComplete(true);
        return;
      }

      if (charIndex === 0) {
        setRenderedLines((prev) => [...prev, { ...currentLine, renderedText: "" }]);
      }

      charIndex += 1;
      const nextText = currentLine.text.slice(0, charIndex);
      setRenderedLines((prev) =>
        prev.map((entry, index) =>
          index === prev.length - 1 ? { ...entry, renderedText: nextText } : entry,
        ),
      );

      if (charIndex < currentLine.text.length) {
        timerRef.current = window.setTimeout(
          step,
          currentLine.kind === "system" ? 18 : currentLine.kind === "prompt" ? 14 : 12,
        );
        return;
      }

      lineIndex += 1;
      charIndex = 0;
      timerRef.current = window.setTimeout(step, currentLine.kind === "prompt" ? 180 : 120);
    };

    timerRef.current = window.setTimeout(step, 240);

    return () => {
      cancelled = true;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = null;
      document.body.style.overflow = "";
      document.documentElement.classList.remove("terminal-easter-egg-open");
    };
  }, [open, script]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "auto" });
  }, [open, renderedLines]);

  if (!open) return null;

  return (
    <div className="terminal-overlay fixed inset-0 z-[180] px-3 py-3 sm:px-5 sm:py-5">
      <div className="terminal-crt absolute inset-0" aria-hidden="true" />
      <div className="terminal-shell relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden border border-[#1dff8f]/35 bg-[#07130d]/96 shadow-[0_0_0_1px_rgba(29,255,143,0.12),0_24px_80px_rgba(0,0,0,0.6)]">
        <header className="flex items-center justify-between gap-3 border-b border-[#1dff8f]/22 bg-[#0a1911]/92 px-4 py-3">
          <div className="min-w-0">
            <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7fffc3]/88">
              Hidden Routine
            </p>
            <h2 className="mt-1 flex items-center gap-2 font-mono text-[15px] font-medium text-[#d6ffe5]">
              <TerminalSquare className="h-4 w-4 text-[#1dff8f]" />
              `curve://about --mode crt`
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/about"
              className="inline-flex h-9 items-center border border-[#1dff8f]/28 px-3 font-ui text-[11px] font-semibold uppercase tracking-[0.12em] text-[#d6ffe5] transition-colors hover:bg-[#1dff8f]/12"
            >
              Open /about
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center border border-[#1dff8f]/28 text-[#d6ffe5] transition-colors hover:bg-[#1dff8f]/12"
              aria-label="关闭终端彩蛋"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 md:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden border-r border-[#1dff8f]/18 bg-[#091711]/90 md:block">
            <div className="border-b border-[#1dff8f]/12 px-4 py-4">
              <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6ae3ad]/72">
                Access
              </p>
              <p className="mt-2 font-mono text-[13px] leading-[1.7] text-[#d6ffe5]">
                route.home
                <br />
                access.hidden
                <br />
                author.sy
              </p>
            </div>
            <div className="px-4 py-4">
              <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6ae3ad]/72">
                Trigger
              </p>
              <p className="mt-2 font-mono text-[12px] leading-[1.8] text-[#95f5c6]">
                ↑ ↑ ↓ ↓ ← →
                <br />
                ← → B A
              </p>
            </div>
            <div className="mt-auto border-t border-[#1dff8f]/12 px-4 py-4">
              <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6ae3ad]/72">
                Exit
              </p>
              <p className="mt-2 font-mono text-[12px] leading-[1.8] text-[#95f5c6]">
                ESC
                <br />
                power.off
              </p>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            <div className="grid gap-3 border-b border-[#1dff8f]/14 bg-[#08150f]/86 px-4 py-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6ae3ad]/76">
                  Terminal Output
                </p>
                <p className="mt-2 font-mono text-[12px] leading-[1.8] text-[#9fecc5]">
                  Easter egg unlocked. Rendering the masthead file as if the site just booted from an old phosphor monitor.
                </p>
              </div>
              <div className="border border-[#1dff8f]/18 bg-[#06110b]/88 px-3 py-3 font-mono text-[11px] leading-[1.8] text-[#8ff0bc]">
                STATUS: {complete ? "READY" : "PRINTING"}
                <br />
                CRT: SCANLINES ENABLED
                <br />
                MODE: PAPERLESS
              </div>
            </div>

            <div
              ref={scrollRef}
              className="terminal-output min-h-0 flex-1 overflow-y-auto px-4 py-4 font-mono text-[13px] leading-[1.8] text-[#d8ffe8]"
            >
              {renderedLines.map((line, index) => (
                <p key={`${line.kind}-${index}`} className={cn("terminal-line", toneClass(line.kind))}>
                  {line.renderedText}
                </p>
              ))}

              <p className="terminal-line text-[#d8ffe8]">
                <span className="terminal-cursor" aria-hidden="true" />
              </p>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1dff8f]/14 bg-[#08150f]/86 px-4 py-3">
              <div className="flex items-center gap-2 font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7fffc3]/82">
                <Power className="h-3.5 w-3.5" />
                Press ESC to return
              </div>
              <p className="font-mono text-[11px] text-[#8ff0bc]/88">
                No mouse required. This page still remembers you are an engineer.
              </p>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}

function isEditableTarget(target: HTMLElement | null): boolean {
  if (!target) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function toneClass(kind: TerminalBootLine["kind"]): string {
  switch (kind) {
    case "system":
      return "text-[#6ae3ad]";
    case "prompt":
      return "text-[#8fffd3]";
    case "accent":
      return "text-[#fff38a]";
    case "muted":
      return "text-[#60ba8d]";
    default:
      return "text-[#d8ffe8]";
  }
}
