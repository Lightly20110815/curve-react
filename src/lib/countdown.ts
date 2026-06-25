/**
 * Countdown column — configured important dates.
 *
 * Edit `countdownEvents` below to add or change the dates shown on the
 * /countdown page. Each entry is a single important moment; past one-off
 * events fall to the bottom as "已过去", while `repeat: "yearly"` events
 * (birthdays, anniversaries) always roll forward to their next occurrence.
 */
export interface CountdownEvent {
  /** Display title, e.g. "高考" or "春节". */
  title: string;
  /** Optional one-line note shown under the title. */
  note?: string;
  /** Target date in ISO form: "2026-06-07" or "2026-06-07T09:00". */
  date: string;
  /** Repeat yearly (birthdays, festivals) — always counts to next occurrence. */
  repeat?: "yearly";
  /** Small emoji/glyph shown in the corner of the card. */
  emoji?: string;
}

/** ✏️ Configure your important dates here. */
export const countdownEvents: CountdownEvent[] = [
  {
    title: "元旦",
    note: "新的一年，新的开始",
    date: "2027-01-01",
    repeat: "yearly",
    emoji: "🎉",
  },
  {
    title: "我的生日",
    note: "Happy Birthday！",
    date: "2026-08-15",
    repeat: "yearly",
    emoji: "🎂",
  },
];

export interface CountdownStatus {
  event: CountdownEvent;
  /** The concrete target date this countdown points at (after yearly roll-forward). */
  target: Date;
  /** Whole days remaining (>= 0). 0 means it is today. */
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Total milliseconds remaining; negative if the (one-off) event has passed. */
  diffMs: number;
  /** True when a one-off event's date is in the past. */
  isPast: boolean;
  /** True when the target is the current calendar day. */
  isToday: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Midnight (local) of the day `date` falls on. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Resolve the concrete target date for an event relative to `now`.
 * For `repeat: "yearly"` events this rolls the month/day forward to the
 * next future (or today) occurrence.
 */
function resolveTarget(event: CountdownEvent, now: Date): Date {
  const base = new Date(event.date);
  if (event.repeat !== "yearly") return base;

  const todayStart = startOfDay(now);
  const candidate = new Date(now.getFullYear(), base.getMonth(), base.getDate(), base.getHours(), base.getMinutes());
  if (startOfDay(candidate) < todayStart) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }
  return candidate;
}

/** Compute the live status for a single event. */
export function getCountdownStatus(event: CountdownEvent, now: Date = new Date()): CountdownStatus {
  const target = resolveTarget(event, now);
  const diffMs = target.getTime() - now.getTime();

  const isToday = startOfDay(target).getTime() === startOfDay(now).getTime();
  const isPast = event.repeat !== "yearly" && diffMs < 0 && !isToday;

  const abs = Math.max(diffMs, 0);
  const days = Math.floor(abs / MS_PER_DAY);
  const hours = Math.floor((abs % MS_PER_DAY) / (1000 * 60 * 60));
  const minutes = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((abs % (1000 * 60)) / 1000);

  return { event, target, days, hours, minutes, seconds, diffMs, isPast, isToday };
}

/**
 * Status for every configured event, sorted by urgency:
 * today first, then nearest upcoming, then past one-off events last.
 */
export function getCountdownStatuses(now: Date = new Date()): CountdownStatus[] {
  return countdownEvents
    .map((event) => getCountdownStatus(event, now))
    .sort((a, b) => {
      if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
      return a.target.getTime() - b.target.getTime();
    });
}
