/**
 * Shown while a lazily-loaded route chunk is in flight.
 *
 * Deliberately quiet: a typesetting rule and a mono label, sized to roughly
 * one text block so the shell does not jump when the real page swaps in.
 * Hidden from assistive tech — route changes are announced by the focus move
 * and document.title update in RootLayout, so a live region here would double up.
 */
export function RouteFallback() {
  return (
    <div
      aria-hidden="true"
      className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24"
    >
      <span className="h-px w-16 bg-rule-soft/70 motion-safe:animate-[route-rule_1.4s_ease-in-out_infinite]" />
      <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink-muted">
        Typesetting
      </span>
      <span className="font-serif text-[13px] text-ink-muted">排版中</span>
    </div>
  );
}

export default RouteFallback;
