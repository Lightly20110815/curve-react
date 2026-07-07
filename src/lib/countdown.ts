/**
 * 花期 — 配置的重要日子。
 *
 * 编辑下方 `countdownEvents` 来增改 /countdown 页展示的日期。
 * 一次性的过去事件沉到底部标"已过去"；`repeat: "yearly"` 的事件
 * （生日、节日）总是滚动到下一次。
 */
export interface CountdownEvent {
  /** 展示标题，如"高考"或"春节"。 */
  title: string;
  /** 标题下方的一行小注。 */
  note?: string;
  /** 目标日期，ISO 形式："2026-06-07" 或 "2026-06-07T09:00"。 */
  date: string;
  /** 每年重复（生日、节日）— 总是数到下一次。 */
  repeat?: "yearly";
  /** 卡片角落的小字符。 */
  emoji?: string;
}

/** ✏️ 在这里配置你的重要日子。 */
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
  /** 该倒计时实际指向的具体日期（yearly 滚动之后）。 */
  target: Date;
  /** 剩余整天数（>= 0），0 表示就是今天。 */
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** 剩余毫秒数；一次性事件已过去时为负。 */
  diffMs: number;
  /** 一次性事件的日期已过去。 */
  isPast: boolean;
  /** 目标就是今天。 */
  isToday: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** date 当天的本地零点。 */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * 相对 now 解析事件的具体目标日期。
 * yearly 事件把月/日滚动到下一次未来（或今天）的出现。
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

/** 计算单个事件的实时状态。 */
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
 * 所有事件的状态，按紧迫度排序：
 * 今天的最前，然后是最近的将来，一次性的过去事件最后。
 */
export function getCountdownStatuses(now: Date = new Date()): CountdownStatus[] {
  return countdownEvents
    .map((event) => getCountdownStatus(event, now))
    .sort((a, b) => {
      if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
      return a.target.getTime() - b.target.getTime();
    });
}
