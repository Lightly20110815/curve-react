/**
 * score.ts —《反乌托邦 Pt.2》动画 PV 视觉总谱
 * 每一句歌词精确对齐到 SceneKind、变体、调色板及时间区间。
 */
import lyrics from "../../content/dystopia-lyrics.json";

export type LyricWord = { text: string; start: number; end: number };
export type LyricLine = {
  line: string;
  start: number;
  end: number;
  backing?: boolean;
  words: LyricWord[];
};

export type SceneKind =
  | "intro"
  | "clash"
  | "powder"
  | "lock"
  | "lamps"
  | "reach"
  | "cascade"
  | "plea"
  | "dialog"
  | "price"
  | "conveyor"
  | "iron"
  | "glare"
  | "blocked"
  | "magnet"
  | "terms"
  | "gear"
  | "insomnia"
  | "because"
  | "heart"
  | "net"
  | "lights"
  | "burn"
  | "maze"
  | "knife"
  | "sing"
  | "anthem"
  | "guitar"
  | "songaway"
  | "sweep"
  | "somewhere"
  | "pen"
  | "clock8"
  | "flower"
  | "me"
  | "specimen"
  | "duality"
  | "nullify"
  | "extrude"
  | "coldtype"
  | "bones"
  | "stamp"
  | "bloodwarm"
  | "fadeasp"
  | "niceworld"
  | "question"
  | "whisper"
  | "lie"
  | "drip"
  | "loop"
  | "crossroads"
  | "vanish"
  | "soupquote"
  | "soup"
  | "murderer"
  | "hope"
  | "carry"
  | "window"
  | "outro"
  | "within";

export type ScenePalette = {
  background: string;
  ink: string;
  accent: string;
  muted: string;
  glow: string;
  highlight: string;
};

export const PALETTES: Record<string, ScenePalette> = {
  boot: {
    background: "#04070a",
    ink: "#96e6b9",
    accent: "#ffb04a",
    muted: "#264236",
    glow: "#4ade80",
    highlight: "#ffffff",
  },
  machine: {
    background: "#060b0e",
    ink: "#b0ffd1",
    accent: "#ffb04a",
    muted: "#284238",
    glow: "#34d399",
    highlight: "#ffffff",
  },
  alarm: {
    background: "#0e0506",
    ink: "#f1f5f9",
    accent: "#ef4444",
    muted: "#5a2024",
    glow: "#f87171",
    highlight: "#ffffff",
  },
  fever: {
    background: "#0f0708",
    ink: "#ff6e65",
    accent: "#ffe2b0",
    muted: "#5c2826",
    glow: "#fb923c",
    highlight: "#ffffff",
  },
  dusk: {
    background: "#08090d",
    ink: "#ffe2b0",
    accent: "#38bdf8",
    muted: "#4e4230",
    glow: "#67e8f9",
    highlight: "#ffffff",
  },
  ice: {
    background: "#080a0d",
    ink: "#d6e4ee",
    accent: "#38bdf8",
    muted: "#343e4a",
    glow: "#60a5fa",
    highlight: "#ffffff",
  },
  steel: {
    background: "#080a0c",
    ink: "#cbd5e1",
    accent: "#94a3b8",
    muted: "#334155",
    glow: "#94a3b8",
    highlight: "#ffffff",
  },
  anthem: {
    background: "#05090a",
    ink: "#befedc",
    accent: "#f59e0b",
    muted: "#244036",
    glow: "#fbbf24",
    highlight: "#ffffff",
  },
  final: {
    background: "#06050a",
    ink: "#fed7aa",
    accent: "#a78bfa",
    muted: "#463c50",
    glow: "#c084fc",
    highlight: "#ffffff",
  },
};

type Dir = { line: string; kind: SceneKind; pal: keyof typeof PALETTES; variant: number };

const dirs: Dir[] = [
  { line: "（即便）", kind: "intro", pal: "boot", variant: 0 },
  { line: "（我们）", kind: "intro", pal: "boot", variant: 1 },
  { line: "（都在）", kind: "intro", pal: "boot", variant: 2 },
  { line: "（这黑暗漫长的反乌托邦）", kind: "intro", pal: "boot", variant: 3 },
  { line: "反乌托邦中的争夺", kind: "clash", pal: "alarm", variant: 0 },
  { line: "把愿望敲碎成粉末", kind: "powder", pal: "machine", variant: 0 },
  { line: "心灵也被挂上门锁", kind: "lock", pal: "machine", variant: 0 },
  { line: "看不清灯火", kind: "lamps", pal: "ice", variant: 0 },
  { line: "但我还想做些什么", kind: "reach", pal: "machine", variant: 0 },
  { line: "其实还想要说很多", kind: "cascade", pal: "machine", variant: 0 },
  { line: "请你等等我", kind: "plea", pal: "machine", variant: 0 },
  { line: "那就好好聊一聊吧", kind: "dialog", pal: "machine", variant: 0 },
  { line: "我的良心究竟值多少钱？", kind: "price", pal: "machine", variant: 0 },
  { line: "打包带走吧我没得选", kind: "conveyor", pal: "machine", variant: 0 },
  { line: "他们举着早已烧红的烙铁", kind: "iron", pal: "fever", variant: 0 },
  { line: "打我脸上面的阳光着实刺眼", kind: "glare", pal: "alarm", variant: 0 },
  { line: "可却怎么都照不到我心里面", kind: "blocked", pal: "ice", variant: 0 },
  { line: "失去作用的一块磁铁", kind: "magnet", pal: "steel", variant: 0 },
  { line: "又有什么资格来跟他讲条件", kind: "terms", pal: "steel", variant: 0 },
  { line: "活成任人摆弄的零件……", kind: "gear", pal: "machine", variant: 0 },
  { line: "睡个好觉都成了我的夙愿……", kind: "insomnia", pal: "ice", variant: 0 },
  { line: "只因为", kind: "because", pal: "machine", variant: 0 },
  { line: "你那渴望自由的心脏", kind: "heart", pal: "fever", variant: 0 },
  { line: "困在一张没空隙的网", kind: "net", pal: "machine", variant: 0 },
  { line: "我们的周围并非没光亮", kind: "lights", pal: "dusk", variant: 0 },
  { line: "只是太耀眼将我们灼伤", kind: "burn", pal: "alarm", variant: 0 },
  { line: "在这个世界难免会迷茫", kind: "maze", pal: "machine", variant: 0 },
  { line: "但别再把小刀带在身上", kind: "knife", pal: "alarm", variant: 0 },
  { line: "至少我还在为你而歌唱", kind: "sing", pal: "dusk", variant: 0 },
  { line: "在黑暗漫长的反乌托邦", kind: "anthem", pal: "anthem", variant: 0 },
  { line: "就把我吉他带走吧", kind: "guitar", pal: "dusk", variant: 0 },
  { line: "就把我的歌也带走吧", kind: "songaway", pal: "dusk", variant: 0 },
  { line: "连同我的理想我的人生统统都带走吧", kind: "sweep", pal: "machine", variant: 0 },
  { line: "也许某个看不见的地方", kind: "somewhere", pal: "dusk", variant: 0 },
  { line: "签字笔画出了乌托邦", kind: "pen", pal: "dusk", variant: 0 },
  { line: "我会八小时清醒八小时做梦", kind: "clock8", pal: "machine", variant: 0 },
  { line: "八小时种朵花", kind: "flower", pal: "dusk", variant: 0 },
  { line: "我", kind: "me", pal: "steel", variant: 0 },
  { line: "是个典型的例子", kind: "specimen", pal: "steel", variant: 0 },
  { line: "对与错", kind: "duality", pal: "steel", variant: 0 },
  { line: "对于我来说", kind: "duality", pal: "steel", variant: 1 },
  { line: "都是无关的", kind: "nullify", pal: "steel", variant: 0 },
  { line: "生硬地挤出来", kind: "extrude", pal: "steel", variant: 0 },
  { line: "没感情的句子", kind: "coldtype", pal: "steel", variant: 0 },
  { line: "任由", kind: "extrude", pal: "steel", variant: 1 },
  { line: "命运在沉默中敲击骨骼", kind: "bones", pal: "alarm", variant: 0 },
  { line: "对于那些结果", kind: "stamp", pal: "steel", variant: 0 },
  { line: "我曾热血过", kind: "bloodwarm", pal: "fever", variant: 0 },
  { line: "结果就是我不再向往了", kind: "fadeasp", pal: "steel", variant: 0 },
  { line: "美好的世界", kind: "niceworld", pal: "dusk", variant: 0 },
  { line: "它究竟存在么", kind: "question", pal: "machine", variant: 0 },
  { line: "还是说你一直在用", kind: "whisper", pal: "steel", variant: 0 },
  { line: "谎言来骗我", kind: "lie", pal: "alarm", variant: 0 },
  { line: "迷茫沮丧的", kind: "drip", pal: "steel", variant: 0 },
  { line: "一天一如既往", kind: "loop", pal: "steel", variant: 0 },
  { line: "该去向哪儿啊？", kind: "crossroads", pal: "machine", variant: 0 },
  { line: "都不知去向", kind: "vanish", pal: "steel", variant: 0 },
  { line: "“总会好起来…”", kind: "soupquote", pal: "dusk", variant: 0 },
  { line: "别喂我鸡汤", kind: "soup", pal: "machine", variant: 0 },
  { line: "真正的凶手", kind: "murderer", pal: "alarm", variant: 0 },
  { line: "是你藏嘴里的希望", kind: "hope", pal: "alarm", variant: 0 },
  { line: "只因为", kind: "because", pal: "machine", variant: 1 },
  { line: "你那渴望自由的心脏", kind: "heart", pal: "fever", variant: 1 },
  { line: "困在一张没空隙的网", kind: "net", pal: "machine", variant: 1 },
  { line: "我们的周围并非没光亮", kind: "lights", pal: "dusk", variant: 1 },
  { line: "只是太耀眼将我们灼伤", kind: "burn", pal: "alarm", variant: 1 },
  { line: "在这个世界难免会迷茫", kind: "maze", pal: "machine", variant: 1 },
  { line: "但别再把小刀带在身上", kind: "knife", pal: "alarm", variant: 1 },
  { line: "至少我还在为你而歌唱", kind: "sing", pal: "dusk", variant: 1 },
  { line: "在黑暗漫长的反乌托邦", kind: "anthem", pal: "anthem", variant: 1 },
  { line: "就把我迷茫带走吧", kind: "carry", pal: "machine", variant: 0 },
  { line: "就把我孤单也带走吧", kind: "carry", pal: "machine", variant: 1 },
  { line: "连同我的困惑我的不安统统都带走吧", kind: "sweep", pal: "machine", variant: 1 },
  { line: "至少你还在为我歌唱", kind: "sing", pal: "dusk", variant: 2 },
  { line: "半平米照亮了乌托邦", kind: "window", pal: "dusk", variant: 0 },
  { line: "我会八小时前行八小时做梦", kind: "clock8", pal: "machine", variant: 1 },
  { line: "八小时种朵花", kind: "flower", pal: "dusk", variant: 1 },
  { line: "活下去", kind: "outro", pal: "dusk", variant: 0 },
  { line: "（不想活成没用的零件）", kind: "outro", pal: "dusk", variant: 0 },
  { line: "活下去", kind: "outro", pal: "dusk", variant: 1 },
  { line: "（胡乱唱着却没人能听见）", kind: "outro", pal: "dusk", variant: 1 },
  { line: "活下去", kind: "outro", pal: "dusk", variant: 2 },
  { line: "（不想活成没用的零件）", kind: "outro", pal: "dusk", variant: 2 },
  { line: "活下去", kind: "outro", pal: "dusk", variant: 3 },
  { line: "（但你的歌声我永远能听见）", kind: "outro", pal: "dusk", variant: 3 },
  { line: "在这反乌托邦里", kind: "within", pal: "final", variant: 0 },
];

const lines = lyrics as LyricLine[];

if (dirs.length !== lines.length) {
  throw new Error(`反乌托邦视觉总谱 ${dirs.length} 行与歌词 ${lines.length} 行不一致`);
}

const cueStarts = lines.map((l, i) => {
  const prev = lines[i - 1];
  return prev ? Math.max(l.start, Math.min(prev.end, l.start + 0.16)) : l.start;
});

export type Cue = LyricLine & {
  index: number;
  kind: SceneKind;
  variant: number;
  palette: ScenePalette;
  cueStart: number;
  cueEnd: number;
};

export const score: Cue[] = lines.map((l, i) => {
  const nextStart = cueStarts[i + 1];
  let cueEnd =
    nextStart === undefined ? l.end + 0.8 : Math.max(l.end, Math.min(l.end + 0.7, nextStart));
  // 句尾被钉到下一句起点、中间是长器乐时，提前收尾，把时间还给间奏
  if (nextStart !== undefined && nextStart - l.end < 0.05 && nextStart - l.start > 5) {
    cueEnd = Math.min(cueEnd, l.start + 3.2);
  }
  return {
    ...l,
    index: i,
    kind: dirs[i].kind,
    variant: dirs[i].variant,
    palette: PALETTES[dirs[i].pal],
    cueStart: cueStarts[i],
    cueEnd,
  };
});

export function getCueAt(time: number): Cue | null {
  return score.find((c) => time >= c.cueStart && time < c.cueEnd) ?? null;
}

export type ActInfo = { code: string; title: string; en: string; start: number; end: number };

export const acts: ActInfo[] = [
  { code: "ACT I", title: "碾碎与标价", en: "CRUSHED & PRICED", start: 0, end: 58.32 },
  { code: "ACT II", title: "困网与歌唱", en: "THE NET & THE SONG", start: 58.32, end: 100.02 },
  { code: "ACT III", title: "典型零件", en: "TYPICAL PART No.0000", start: 100.02, end: 125.37 },
  { code: "ACT IV", title: "再唱一次", en: "SING IT AGAIN", start: 125.37, end: 158.61 },
  { code: "ACT V", title: "活下去", en: "KEEP ON LIVING", start: 158.61, end: 180.09 },
];

export function getActAt(time: number): ActInfo {
  return acts.find((a) => time >= a.start && time < a.end) ?? acts[acts.length - 1];
}
