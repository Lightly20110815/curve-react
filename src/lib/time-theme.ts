export type TimeTheme = "day" | "dawn" | "dusk" | "deep-night";
export type ThemeMode = "light" | "dark";
export type ThemePreference = "auto" | ThemeMode;

export interface TimeThemeInfo {
  id: TimeTheme;
  label: string;
  badge: string;
  clockHint: string;
  poetryInstruction: string;
}

const TIME_THEME_INFO: Record<TimeTheme, TimeThemeInfo> = {
  day: {
    id: "day",
    label: "日间",
    badge: "Day Edition",
    clockHint: "白昼常规版",
    poetryInstruction:
      "保持原本的两种气质即可：松弛豁达，或旧日寻常、家常温柔。",
  },
  dawn: {
    id: "dawn",
    label: "清晨",
    badge: "Morning Edition",
    clockHint: "清晨薄光版",
    poetryInstruction:
      "优先选择带晨雾、初醒、微光、风露感的句子，语气要轻，不要太喧闹。",
  },
  dusk: {
    id: "dusk",
    label: "黄昏",
    badge: "Dusk Edition",
    clockHint: "黄昏归途版",
    poetryInstruction:
      "优先选择带余晖、归途、收束、灯火初上的句子，要温暖克制，不要过分悲切。",
  },
  "deep-night": {
    id: "deep-night",
    label: "深夜",
    badge: "Night Edition",
    clockHint: "深夜静读版",
    poetryInstruction:
      "优先选择安抚、静谧、适合深夜阅读的句子，可以有月色、灯下、松弛、自我安放的感觉；避免惊烈、喧闹、悲壮决绝。",
  },
};

const CHROME_COLORS: Record<ThemeMode, Record<TimeTheme, string>> = {
  light: {
    day: "#e3d3ab",
    dawn: "#efe1be",
    dusk: "#dcc197",
    "deep-night": "#d8dbdf",
  },
  dark: {
    day: "#1a1a1a",
    dawn: "#241b14",
    dusk: "#21160f",
    "deep-night": "#10191d",
  },
};

export function getTimeTheme(date: Date = new Date()): TimeTheme {
  const hour = date.getHours();

  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 17 && hour < 20) return "dusk";
  if (hour >= 22 || hour < 5) return "deep-night";

  return "day";
}

export function getTimeThemeInfo(input: TimeTheme | Date = new Date()): TimeThemeInfo {
  const theme = input instanceof Date ? getTimeTheme(input) : input;
  return TIME_THEME_INFO[theme];
}

export function getThemeChromeColor(mode: ThemeMode, timeTheme: TimeTheme): string {
  return CHROME_COLORS[mode][timeTheme];
}

export function getInitialTimeTheme(): TimeTheme {
  if (typeof window === "undefined") return "day";
  return getTimeTheme(new Date());
}

export function getDocumentThemeMode(root: HTMLElement = document.documentElement): ThemeMode {
  return root.classList.contains("dark") ? "dark" : "light";
}

export function syncDocumentChromeColor(
  mode: ThemeMode,
  timeTheme: TimeTheme,
  root: HTMLElement = document.documentElement,
) {
  root.dataset.timeTheme = timeTheme;

  const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (meta) {
    meta.setAttribute("content", getThemeChromeColor(mode, timeTheme));
  }
}

export function getDelayUntilNextMinute(date: Date = new Date()): number {
  return (60 - date.getSeconds()) * 1000 - date.getMilliseconds() + 32;
}
