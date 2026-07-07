/**
 * 时光机 — "as-of" 机制。
 *
 * 任何路由带上 `?as-of=YYYY-MM-DD` 时，花园会退回那一天结束时的样子：
 * 之后种下的文字消失，统计数字回卷。
 * 主题与问候语刻意不回卷 — 设定是"现在的你，看当年的花园"。
 */

const AS_OF_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 校验 `?as-of=` 原始值，合法则返回规范 `YYYY-MM-DD`，否则 null。 */
export function parseAsOfParam(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!AS_OF_PATTERN.test(raw)) return null;
  const ms = Date.parse(`${raw}T00:00:00`);
  if (Number.isNaN(ms)) return null;
  return raw;
}

/** as-of 当日的包含式截止时刻。 */
function asOfCutoffMs(asOf: string): number {
  return Date.parse(`${asOf}T23:59:59.999`);
}

/** 某条目日期是否落在 as-of 截止之前（含当天）。 */
export function isBeforeAsOf(dateIso: string, asOf: string | null): boolean {
  if (!asOf) return true;
  const t = Date.parse(dateIso);
  if (Number.isNaN(t)) return true;
  return t <= asOfCutoffMs(asOf);
}

/** 按 as-of 截止过滤任何带日期的集合（文章、随笔）。 */
export function filterByAsOf<T extends { date: string }>(
  items: T[],
  asOf: string | null,
): T[] {
  if (!asOf) return items;
  return items.filter((item) => isBeforeAsOf(item.date, asOf));
}
