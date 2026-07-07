/**
 * 人生进度 — 把时间的流逝变成一组进度条。
 *
 * 修改下方 `birthDate` / `lifeExpectancyYears` 来个性化"人生"条。
 * 其余（今天/本周/本月/今年）纯粹由当前时刻推导，会自己走。
 */

/** ✏️ 生日，ISO 形式 "YYYY-MM-DD"。用于"人生"进度条。 */
export const birthDate = "2011-08-15";

/** ✏️ 假定的寿命年数 — 半开玩笑，仅用于"人生"条。 */
export const lifeExpectancyYears = 15;

export interface ProgressItem {
  /** React 列表的稳定 key。 */
  key: string;
  /** 条的标签，如"今年"。 */
  label: string;
  /** 条下方的短说明，如"2026"。 */
  caption: string;
  /** 已经过的比例，钳制到 [0, 1]。 */
  fraction: number;
  /** 人类可读的剩余量，如"还剩 189 天"。 */
  remaining: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** date 当天的本地零点。 */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** now 在 [start, end) 中已经过的比例，钳制到 [0, 1]。 */
function spanFraction(start: number, end: number, now: number): number {
  if (end <= start) return 0;
  return Math.min(Math.max((now - start) / (end - start), 0), 1);
}

/** now 到未来 end 之间的整天数（向上取整，>= 0）。 */
function daysLeft(end: number, now: number): number {
  return Math.max(Math.ceil((end - now) / MS_PER_DAY), 0);
}

/** 计算给定时刻的所有进度条。 */
export function getProgressItems(now: Date = new Date()): ProgressItem[] {
  const t = now.getTime();
  const items: ProgressItem[] = [];

  // 今天 — 零点到零点。
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

  // 本周 — 周一零点到下周一零点。
  {
    const mondayOffset = (now.getDay() + 6) % 7; // 0 = 周一 … 6 = 周日
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

  // 本月 — 1 号到下月 1 号。
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

  // 今年 — 1 月 1 日到明年 1 月 1 日。
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

  // 人生 — 出生到出生 + lifeExpectancyYears。
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
