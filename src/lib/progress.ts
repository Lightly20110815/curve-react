/**
 * Life progress — turn the passage of time into a set of progress bars.
 *
 * Edit `birthDate` / `lifeExpectancyYears` below to personalize the "人生"
 * bar. Everything else (day / week / month / year) is derived purely from
 * the current moment, so the bars tick forward on their own.
 */

/** ✏️ Your birthday, ISO form "YYYY-MM-DD". Used for the 人生 progress bar. */
export const birthDate = "2011-08-15";

/** ✏️ Assumed lifespan in years — half-serious, for the 人生 bar only. */
export const lifeExpectancyYears = 15;

export interface ProgressItem {
  /** Stable key for React lists. */
  key: string;
  /** Bar label, e.g. "今年". */
  label: string;
  /** Short caption under the bar, e.g. "2026". */
  caption: string;
  /** Fraction elapsed, clamped to [0, 1]. */
  fraction: number;
  /** Human remainder, e.g. "还剩 189 天". */
  remaining: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Midnight (local) of the day `date` falls on. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Fraction of [start, end) that `now` has passed through, clamped to [0, 1]. */
function spanFraction(start: number, end: number, now: number): number {
  if (end <= start) return 0;
  return Math.min(Math.max((now - start) / (end - start), 0), 1);
}

/** Whole days between `now` and a future `end` timestamp (rounded up, >= 0). */
function daysLeft(end: number, now: number): number {
  return Math.max(Math.ceil((end - now) / MS_PER_DAY), 0);
}

/** Compute every progress bar for the given moment. */
export function getProgressItems(now: Date = new Date()): ProgressItem[] {
  const t = now.getTime();
  const items: ProgressItem[] = [];

  // 今天 — midnight to midnight.
  {
    const start = startOfDay(now).getTime();
    const end = start + MS_PER_DAY;
    const hoursLeft = Math.floor((end - t) / (1000 * 60 * 60));
    const minutesLeft = Math.floor(((end - t) % (1000 * 60 * 60)) / (1000 * 60));
    items.push({
      key: "day",
      label: "今天",
      caption: `${now.getMonth() + 1} 月 ${now.getDate()} 日`,
      fraction: spanFraction(start, end, t),
      remaining: `还剩 ${hoursLeft} 时 ${minutesLeft} 分`,
    });
  }

  // 本周 — Monday 00:00 to next Monday 00:00.
  {
    const mondayOffset = (now.getDay() + 6) % 7; // 0 = Monday … 6 = Sunday
    const start = startOfDay(now).getTime() - mondayOffset * MS_PER_DAY;
    const end = start + 7 * MS_PER_DAY;
    items.push({
      key: "week",
      label: "本周",
      caption: `周${"一二三四五六日"[mondayOffset]}`,
      fraction: spanFraction(start, end, t),
      remaining: `还剩 ${daysLeft(end, t)} 天`,
    });
  }

  // 本月 — first day to first day of next month.
  {
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    items.push({
      key: "month",
      label: "本月",
      caption: `${now.getMonth() + 1} 月`,
      fraction: spanFraction(start, end, t),
      remaining: `还剩 ${daysLeft(end, t)} 天`,
    });
  }

  // 今年 — Jan 1 to next Jan 1.
  {
    const start = new Date(now.getFullYear(), 0, 1).getTime();
    const end = new Date(now.getFullYear() + 1, 0, 1).getTime();
    items.push({
      key: "year",
      label: "今年",
      caption: String(now.getFullYear()),
      fraction: spanFraction(start, end, t),
      remaining: `还剩 ${daysLeft(end, t)} 天`,
    });
  }

  // 人生 — birth to birth + lifeExpectancyYears.
  {
    const birth = new Date(birthDate);
    const start = birth.getTime();
    const end = new Date(
      birth.getFullYear() + lifeExpectancyYears,
      birth.getMonth(),
      birth.getDate(),
    ).getTime();
    const years = (t - start) / (365.2425 * MS_PER_DAY);
    items.push({
      key: "life",
      label: "人生",
      caption: `${years.toFixed(1)} 岁`,
      fraction: spanFraction(start, end, t),
      remaining: `假设活到 ${lifeExpectancyYears} 岁`,
    });
  }

  return items;
}
