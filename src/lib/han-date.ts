/**
 * 汉字日期格式化。
 *
 * 花园里的日期有两种声音：
 * - 汉字长款（"二〇二六年七月七日"）用在需要仪式感的地方
 * - 短款点分（"2026.07.07"）用在列表元信息，等宽字体
 */
const HAN_DIGITS = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"] as const;
const HAN_WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"] as const;

function hanDigits(n: number): string {
  return String(n)
    .split("")
    .map((d) => HAN_DIGITS[Number(d)] ?? d)
    .join("");
}

/** 1..99 — 口语化汉字数字（"十"、"二十一"）。 */
function hanNumber(n: number): string {
  if (n < 10) return HAN_DIGITS[n];
  if (n < 20) return n === 10 ? "十" : `十${HAN_DIGITS[n - 10]}`;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? `${HAN_DIGITS[tens]}十` : `${HAN_DIGITS[tens]}十${HAN_DIGITS[ones]}`;
}

/** "二〇二六年七月七日 星期二" */
export function formatHanDate(iso: string | Date = new Date()): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const year = hanDigits(d.getFullYear());
  const month = hanNumber(d.getMonth() + 1);
  const day = hanNumber(d.getDate());
  const weekday = HAN_WEEKDAYS[d.getDay()];
  return `${year}年${month}月${day}日 星期${weekday}`;
}

/** "2026.07.07" — 列表元信息用，等宽。 */
export function formatDotDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${m}.${day}`;
}

/** "二〇二六年七月七日" — 文章落款。 */
export function formatArticleDateline(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const y = hanDigits(d.getFullYear());
  const m = hanNumber(d.getMonth() + 1);
  const day = hanNumber(d.getDate());
  return `${y}年${m}月${day}日`;
}

export { hanDigits, hanNumber };
