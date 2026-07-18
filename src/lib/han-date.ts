/**
 * Newspaper-style date / number formatters.
 *
 * Chinese newspapers traditionally use 汉数字 (Han numerals) in masthead dates:
 *   "二〇二六年五月二十日 星期三"
 *
 * These helpers produce that voice; Latin/Arabic versions are kept for the
 * issue-number line where mono digits look right.
 */
const HAN_DIGITS = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"] as const;
const HAN_WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"] as const;

function hanDigits(n: number): string {
  return String(n)
    .split("")
    .map((d) => HAN_DIGITS[Number(d)] ?? d)
    .join("");
}

/** 1..10..99 — colloquial Chinese number form ("十", "二十一" etc.). */
function hanNumber(n: number): string {
  if (n < 10) return HAN_DIGITS[n];
  if (n < 20) return n === 10 ? "十" : `十${HAN_DIGITS[n - 10]}`;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? `${HAN_DIGITS[tens]}十` : `${HAN_DIGITS[tens]}十${HAN_DIGITS[ones]}`;
}

/** "二〇二六年五月二十日 星期三" */
export function formatMastheadDate(iso: string | Date = new Date()): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const year = hanDigits(d.getFullYear());
  const month = hanNumber(d.getMonth() + 1);
  const day = hanNumber(d.getDate());
  const weekday = HAN_WEEKDAYS[d.getDay()];
  return `${year}年${month}月${day}日 星期${weekday}`;
}

/** "二〇二六年春季号" */
export function formatIssueSeason(iso: string | Date = new Date()): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const y = hanDigits(d.getFullYear());
  const m = d.getMonth() + 1;
  const season = m <= 3 ? "冬季" : m <= 6 ? "春季" : m <= 9 ? "夏季" : "秋季";
  return `${y}年${season}号`;
}

/** "贰〇贰陆 · 五月" — used in article datelines */
export function formatArticleDateline(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const y = hanDigits(d.getFullYear());
  const m = hanNumber(d.getMonth() + 1);
  const day = hanNumber(d.getDate());
  return `${y}年${m}月${day}日`;
}

export { hanDigits, hanNumber };
