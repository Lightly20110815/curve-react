/**
 * 花园的时间感 — 时辰问候、主题时刻、月相。
 *
 * 主题默认跟随真实时间：夜里访问是「夜」，白天访问是「晨」。
 * 月相由已知新月历元推算（误差 < 1 天，足够点缀页面）。
 */

export type GardenTheme = "night" | "dawn";

/** 当前时刻应有的主题：18:00–5:59 是夜，其余是晨。 */
export function themeForHour(hour: number): GardenTheme {
  return hour >= 18 || hour < 6 ? "night" : "dawn";
}

export interface HourGreeting {
  /** 短问候，如"凌晨两点，露水正凉。" */
  text: string;
  /** 时段名，如"深夜"。 */
  period: string;
}

const HOUR_WORDS = [
  "零", "一", "两", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二",
] as const;

function hourWord(h12: number): string {
  return HOUR_WORDS[h12] ?? String(h12);
}

/** 按小时生成园中问候。 */
export function greetingForHour(hour: number): HourGreeting {
  if (hour >= 0 && hour < 3) {
    return { period: "深夜", text: `凌晨${hourWord(hour === 0 ? 12 : hour)}点，露水正凉。` };
  }
  if (hour < 5) {
    return { period: "拂晓前", text: "天快亮了，星星还没走。" };
  }
  if (hour < 7) {
    return { period: "清晨", text: "晨雾未散，园子刚醒。" };
  }
  if (hour < 11) {
    return { period: "上午", text: "日光落在叶子上，适合读点什么。" };
  }
  if (hour < 13) {
    return { period: "正午", text: "正午了，找个树荫坐一会儿。" };
  }
  if (hour < 17) {
    return { period: "下午", text: "下午的风很轻，时间走得也慢。" };
  }
  if (hour < 19) {
    return { period: "黄昏", text: "天色渐晚，园里的灯一盏盏亮了。" };
  }
  if (hour < 22) {
    return { period: "夜晚", text: `晚上${hourWord(hour - 12)}点，虫鸣渐起。` };
  }
  return { period: "深夜", text: "夜深了，萤火虫替星星值班。" };
}

export interface MoonPhase {
  /** 0..1：0 = 新月，0.5 = 满月。 */
  phase: number;
  /** 月相名，如"上弦月"。 */
  name: string;
  /** 月面被照亮的比例 0..1。 */
  illumination: number;
}

const SYNODIC_MONTH = 29.530588853; // 朔望月天数
// 已知新月历元：2000-01-06 18:14 UTC
const NEW_MOON_EPOCH_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

/** 推算给定日期的月相。 */
export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const days = (date.getTime() - NEW_MOON_EPOCH_MS) / 86400000;
  const phase = ((days / SYNODIC_MONTH) % 1 + 1) % 1;
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;

  let name: string;
  if (phase < 0.033 || phase >= 0.967) name = "新月";
  else if (phase < 0.216) name = "娥眉月";
  else if (phase < 0.284) name = "上弦月";
  else if (phase < 0.466) name = "盈凸月";
  else if (phase < 0.534) name = "满月";
  else if (phase < 0.716) name = "亏凸月";
  else if (phase < 0.784) name = "下弦月";
  else name = "残月";

  return { phase, name, illumination };
}
