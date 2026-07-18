import { useEffect, useState, type RefObject } from "react";

interface Props {
  /** Element whose scroll progress we're tracking. Defaults to the document. */
  targetRef?: RefObject<HTMLElement>;
}

/**
 * Thin progress bar fixed at the very top of the viewport.
 *
 * If `targetRef` is supplied, progress is measured against that element's
 * vertical span (0% when its top hits the viewport top, 100% when its
 * bottom leaves the viewport bottom). Otherwise it tracks document scroll.
 */
export function ReadingProgress({ targetRef }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function compute(): number {
      const el = targetRef?.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const viewportH = window.innerHeight || document.documentElement.clientHeight;
        const totalScrollable = rect.height - viewportH;
        if (totalScrollable <= 0) return rect.bottom <= viewportH ? 1 : 0;
        const passed = Math.min(Math.max(-rect.top, 0), totalScrollable);
        return passed / totalScrollable;
      }
      const doc = document.documentElement;
      const totalScrollable = doc.scrollHeight - doc.clientHeight;
      if (totalScrollable <= 0) return 0;
      return Math.min(Math.max(doc.scrollTop / totalScrollable, 0), 1);
    }

    let ticking = false;
    const update = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setProgress(compute());
        ticking = false;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetRef]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
    >
      <div
        className="h-full origin-left bg-stamp transition-[transform] duration-150 ease-out"
        style={{ transform: `scaleX(${progress})`, width: "100%" }}
      />
    </div>
  );
}
