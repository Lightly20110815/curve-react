import lyrics from "../../content/freefall-lyrics.json";

export type LyricWord = {
  text: string;
  start: number;
  end: number;
};

export type LyricLine = {
  line: string;
  start: number;
  end: number;
  words: LyricWord[];
};

export type SceneKind =
  | "sea"
  | "horizon"
  | "mirror"
  | "shatter"
  | "room"
  | "window"
  | "spiral"
  | "bottle"
  | "crowd"
  | "quiet"
  | "escape"
  | "pulse"
  | "brain"
  | "cage"
  | "signal"
  | "run"
  | "countdown"
  | "type"
  | "eye"
  | "heat"
  | "heart"
  | "city"
  | "sleep"
  | "sieve"
  | "light"
  | "clock"
  | "breath"
  | "scar"
  | "fall"
  | "erase"
  | "question";

export type ScenePalette = {
  background: string;
  ink: string;
  accent: string;
  muted: string;
};

export type SceneCue = LyricLine & {
  index: number;
  kind: SceneKind;
  focus: string;
  palette: ScenePalette;
  variant: number;
  /** Scene boundaries; start/end above remain the untouched vocal timings. */
  cueStart: number;
  cueEnd: number;
};

const BLACK = "#090b0d";
const BONE = "#e9e6db";
const RED = "#e63b32";
const CYAN = "#91c9cc";
const AMBER = "#d7a76d";

const palettes = {
  night: { background: BLACK, ink: BONE, accent: RED, muted: "#777771" },
  sea: { background: BLACK, ink: CYAN, accent: BONE, muted: "#4e6c70" },
  dusk: { background: BLACK, ink: BONE, accent: AMBER, muted: "#75634c" },
  paper: { background: BONE, ink: BLACK, accent: RED, muted: "#929086" },
  fever: { background: BLACK, ink: RED, accent: BONE, muted: "#70362f" },
  flare: { background: RED, ink: BLACK, accent: BONE, muted: "#84271f" },
} satisfies Record<string, ScenePalette>;

type SceneDirection = {
  /** Keeping the lyric beside its direction makes edits safe to review. */
  line: string;
  kind: SceneKind;
  focus: string;
  palette: keyof typeof palettes;
  variant: number;
};

// A visual score, not a repeating carousel: the geometry comes from each lyric.
// Variants are intentional reprises; related images return changed in verse two.
const directions = [
  // I. A memory develops: water → horizon → mirror → torn paper → empty room.
  { line: "那个夏天去过的海边", kind: "sea", focus: "海边", palette: "sea", variant: 0 },
  { line: "听闻过遥遥无期的终点", kind: "horizon", focus: "遥遥无期", palette: "sea", variant: 0 },
  { line: "镜中她有些发青的眼睑", kind: "mirror", focus: "眼睑", palette: "sea", variant: 0 },
  { line: "全部被红笔尖划成碎片", kind: "shatter", focus: "碎片", palette: "paper", variant: 0 },
  { line: "空荡荡像场梦的房间", kind: "room", focus: "空荡荡", palette: "night", variant: 0 },
  { line: "窗外晚霞迸发的诗篇", kind: "window", focus: "晚霞", palette: "dusk", variant: 0 },
  { line: "咖啡液搅进厚重镜片", kind: "spiral", focus: "搅进", palette: "dusk", variant: 0 },
  { line: "都罐装冷凝成怀念", kind: "bottle", focus: "怀念", palette: "sea", variant: 0 },
  { line: "当又一次被人群遗忘", kind: "crowd", focus: "遗忘", palette: "night", variant: 0 },
  { line: "也不见得有多哀伤", kind: "quiet", focus: "哀伤", palette: "night", variant: 0 },
  { line: "带我走吧", kind: "escape", focus: "走", palette: "night", variant: 0 },

  // II. A closed nervous system: the cable becomes pulse, cage and a city.
  { line: "切断视觉网不规则心跳", kind: "pulse", focus: "心跳", palette: "fever", variant: 0 },
  { line: "所谓孤独只存活于大脑", kind: "brain", focus: "孤独", palette: "night", variant: 0 },
  { line: "麻木的爱上", kind: "heart", focus: "麻木", palette: "fever", variant: 1 },
  { line: "笼外玻璃反射的夕阳光", kind: "cage", focus: "笼外", palette: "dusk", variant: 0 },
  { line: "无线电波剪影", kind: "signal", focus: "无线电波", palette: "sea", variant: 0 },
  { line: "叩击生命体的讯号", kind: "signal", focus: "叩击", palette: "sea", variant: 1 },
  { line: "无意义奔跑", kind: "run", focus: "奔跑", palette: "night", variant: 0 },
  { line: "记录倒数期待控制大脑", kind: "countdown", focus: "倒数", palette: "fever", variant: 0 },
  { line: "所谓理想主义者", kind: "type", focus: "理想主义者", palette: "paper", variant: 0 },
  { line: "不切实际的构想", kind: "city", focus: "构想", palette: "night", variant: 0 },
  { line: "主观太纷扰", kind: "spiral", focus: "纷扰", palette: "night", variant: 1 },
  { line: "他们眼神早就充斥嘲笑", kind: "eye", focus: "嘲笑", palette: "paper", variant: 0 },
  { line: "脑中枢发烫", kind: "heat", focus: "发烫", palette: "fever", variant: 0 },
  { line: "急需耳机线输液给心脏", kind: "heart", focus: "心脏", palette: "fever", variant: 0 },
  { line: "碎片在闪现", kind: "shatter", focus: "碎片", palette: "night", variant: 1 },
  { line: "佐证她所说曾经的骄傲", kind: "type", focus: "骄傲", palette: "paper", variant: 1 },
  { line: "空想世界永存", kind: "city", focus: "永存", palette: "sea", variant: 1 },
  { line: "构建我的乌托邦", kind: "city", focus: "乌托邦", palette: "sea", variant: 2 },

  // III. The same images wear down: a memory becomes a rubric, then silence.
  { line: "后来存在回忆的碎片", kind: "shatter", focus: "回忆", palette: "night", variant: 2 },
  { line: "凝练成议论文的字眼", kind: "type", focus: "议论文", palette: "paper", variant: 2 },
  { line: "昧着心到无力去抱怨", kind: "heart", focus: "无力", palette: "night", variant: 2 },
  { line: "大概我也没什么特别", kind: "crowd", focus: "我", palette: "night", variant: 1 },
  { line: "理想主义者的安眠", kind: "sleep", focus: "安眠", palette: "sea", variant: 0 },
  { line: "大概基于无法共情明天", kind: "horizon", focus: "明天", palette: "sea", variant: 1 },
  { line: "忘记沉默没停", kind: "erase", focus: "沉默", palette: "night", variant: 0 },
  { line: "天也不会睡醒", kind: "sleep", focus: "睡醒", palette: "night", variant: 1 },
  { line: "就为我而独自安静", kind: "quiet", focus: "独自", palette: "night", variant: 1 },
  { line: "当成为被筛掉的废料", kind: "sieve", focus: "废料", palette: "paper", variant: 0 },
  { line: "也不见得有多肮脏", kind: "quiet", focus: "肮脏", palette: "night", variant: 2 },
  { line: "贪欢手心无人打扰的微光", kind: "light", focus: "微光", palette: "dusk", variant: 0 },
  { line: "也能将太暗的夜晚点亮", kind: "light", focus: "点亮", palette: "dusk", variant: 1 },

  // IV. The clock outruns breath; the written answer becomes falling matter.
  { line: "秒针计生活", kind: "clock", focus: "秒针", palette: "paper", variant: 0 },
  { line: "呼吸频率追不上的缺憾", kind: "breath", focus: "呼吸", palette: "night", variant: 0 },
  { line: "字迹烙的茧", kind: "scar", focus: "茧", palette: "paper", variant: 0 },
  { line: "随中指侧皮肤一同溃烂", kind: "scar", focus: "溃烂", palette: "fever", variant: 1 },
  { line: "针管笔做伴", kind: "type", focus: "针管笔", palette: "paper", variant: 3 },
  { line: "他的文字总是标准答案", kind: "type", focus: "标准答案", palette: "paper", variant: 4 },
  { line: "我的自以为是", kind: "question", focus: "自以为是", palette: "night", variant: 0 },
  { line: "可否拿来交换晚餐", kind: "question", focus: "交换", palette: "night", variant: 1 },
  { line: "轮回中感受", kind: "spiral", focus: "轮回", palette: "night", variant: 2 },
  { line: "一万次自由落体的阵痛", kind: "fall", focus: "自由落体", palette: "fever", variant: 0 },
  { line: "闭上眼睛吧", kind: "eye", focus: "闭上", palette: "night", variant: 1 },
  { line: "把墙和座右铭通通赶走", kind: "erase", focus: "赶走", palette: "night", variant: 1 },
  { line: "那么我的一切", kind: "room", focus: "一切", palette: "night", variant: 1 },
  { line: "是否还有存在的理由", kind: "question", focus: "存在", palette: "night", variant: 2 },
  { line: "就随着重力加速度 一无所有", kind: "fall", focus: "一无所有", palette: "night", variant: 1 },
] satisfies SceneDirection[];

const lines: LyricLine[] = lyrics;

// Very short vocal overlaps should not cut off the final sung character. Delay
// incoming geometry slightly while retaining every original word timestamp.
const cueStarts = lines.map((line, index) => {
  const previous = lines[index - 1];
  return previous
    ? Math.max(line.start, Math.min(previous.end, line.start + 0.22))
    : line.start;
});

export const sceneScore: SceneCue[] = lines.map((line, index) => {
  const direction = directions[index];
  if (!direction || direction.line !== line.line) {
    throw new Error(`Freefall visual score does not match lyric ${index + 1}.`);
  }

  const nextStart = cueStarts[index + 1];
  const cueEnd = nextStart === undefined
    ? line.end + 1.2
    : Math.max(line.end, Math.min(line.end + 0.9, nextStart));

  return {
    ...line,
    index,
    kind: direction.kind,
    focus: direction.focus,
    palette: palettes[direction.palette],
    variant: direction.variant,
    cueStart: cueStarts[index],
    cueEnd,
  };
});

/** No cue during the opening, instrumental break, or space after the coda. */
export function getSceneAt(time: number): SceneCue | null {
  // Source order lets the outgoing vocal finish in the rare remaining overlap.
  return sceneScore.find((cue) => time >= cue.cueStart && time < cue.cueEnd) ?? null;
}

function intervalProgress(start: number, end: number, time: number): number {
  if (time <= start) return 0;
  if (time >= end) return 1;
  return (time - start) / Math.max(0.001, end - start);
}

export function getWordProgress(word: LyricWord, time: number): number {
  return intervalProgress(word.start, word.end, time);
}

export function getLineProgress(line: LyricLine, time: number): number {
  return intervalProgress(line.start, line.end, time);
}

export function getSceneProgress(cue: SceneCue, time: number): number {
  return intervalProgress(cue.cueStart, cue.cueEnd, time);
}

export type ActInfo = {
  act: number;
  roman: string;
  title: string;
  subtitle: string;
  start: number;
  end: number;
};

export const acts: ActInfo[] = [
  { act: 1, roman: "ACT I", title: "记忆显影", subtitle: "MEMORY REEL · THE STILL SUMMER", start: 0, end: 58.12 },
  { act: 2, roman: "ACT II", title: "神经脉冲", subtitle: "CLOSED NERVOUS SYSTEM · CABLE INFUSION", start: 58.12, end: 91.22 },
  { act: 3, roman: "ACT III", title: "回忆残章", subtitle: "TORN ESSAY · SOLITARY LIGHT", start: 91.22, end: 141.03 },
  { act: 4, roman: "ACT IV", title: "重力加速度", subtitle: "TERMINAL VELOCITY · FREEFALL", start: 141.03, end: 168.75 },
  { act: 5, roman: "CODA", title: "虚空落幕", subtitle: "ZERO GRAVITY · STILL VOID", start: 168.75, end: 180 },
];

export function getActAt(time: number): ActInfo {
  return acts.find((a) => time >= a.start && time < a.end) ?? acts[acts.length - 1];
}