import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableWithin(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

interface FocusTrapOptions {
  /**
   * Set false when the caller already moves focus into the dialog and restores
   * it on close (the two canvas darkrooms do). The trap and the background
   * `inert` still apply.
   */
  manageFocus?: boolean;
}

/**
 * Confine keyboard focus to an open overlay.
 *
 * Does what `aria-modal="true"` alone does not:
 *  1. moves focus into the dialog on open (unless `manageFocus: false`),
 *  2. cycles Tab / Shift+Tab inside it instead of escaping into the page behind,
 *  3. marks `#root` inert when the dialog is portalled outside it, so the covered
 *     page leaves both the tab order and the accessibility tree,
 *  4. restores focus to the trigger on close (unless `manageFocus: false`).
 *
 * The dialog element must be focusable as a fallback — give it `tabIndex={-1}`.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement>,
  active: boolean,
  { manageFocus = true }: FocusTrapOptions = {},
) {
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // A portalled dialog is a sibling of #root, so the page it covers can be
    // removed from the tab order and the accessibility tree wholesale.
    const root = document.getElementById("root");
    const rootWasInert = root?.inert ?? false;
    const shouldInertRoot = Boolean(root && !root.contains(node));
    if (root && shouldInertRoot) root.inert = true;

    if (manageFocus && !node.contains(document.activeElement)) {
      const [first] = focusableWithin(node);
      (first ?? node).focus({ preventScroll: true });
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const items = focusableWithin(node);
      if (items.length === 0) {
        event.preventDefault();
        node.focus({ preventScroll: true });
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const inside = current ? node.contains(current) : false;

      if (event.shiftKey && (!inside || current === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!inside || current === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      if (root && shouldInertRoot) root.inert = rootWasInert;
      if (manageFocus) previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [ref, active, manageFocus]);
}
