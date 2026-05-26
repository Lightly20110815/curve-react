/**
 * Time Machine — the "as-of" mechanism.
 *
 * When `?as-of=YYYY-MM-DD` is present on any route, the site behaves as if
 * the reader is browsing the issue that was current at the end of that day:
 * later posts and notes vanish, "今年/累计" stats roll back, and articles
 * dated after the as-of show a "本期尚未刊登" placeholder.
 *
 * The time-aware theme and the editor's-desk quotes are intentionally NOT
 * rewound — the conceit is "you, now, holding an old paper", not "you, then".
 */

const AS_OF_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse and validate a raw `?as-of=` value. Returns the canonical
 * `YYYY-MM-DD` string when valid; `null` otherwise.
 *
 * Invalid values are dropped silently — the banner simply doesn't appear.
 */
export function parseAsOfParam(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!AS_OF_PATTERN.test(raw)) return null;
  const ms = Date.parse(`${raw}T00:00:00`);
  if (Number.isNaN(ms)) return null;
  return raw;
}

/** Inclusive end-of-day cutoff for an as-of date. */
function asOfCutoffMs(asOf: string): number {
  return Date.parse(`${asOf}T23:59:59.999`);
}

/** Whether an item's date falls on or before the as-of cutoff. */
export function isBeforeAsOf(dateIso: string, asOf: string | null): boolean {
  if (!asOf) return true;
  const t = Date.parse(dateIso);
  if (Number.isNaN(t)) return true;
  return t <= asOfCutoffMs(asOf);
}

/** Filter any date-bearing collection (posts, notes) by the as-of cutoff. */
export function filterByAsOf<T extends { date: string }>(
  items: T[],
  asOf: string | null,
): T[] {
  if (!asOf) return items;
  return items.filter((item) => isBeforeAsOf(item.date, asOf));
}
