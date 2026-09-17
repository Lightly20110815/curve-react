import type { SceneCue } from "./score";

export const DISPLAY = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
export const SERIF = '"Noto Serif SC", "Songti SC", serif';
export const MONO = '"JetBrains Mono", "SFMono-Regular", ui-monospace, monospace';

export const TAU = Math.PI * 2;
export const BONE = "#e9e6db";
export const BLACK = "#090b0d";
export const RED = "#e63b32";
export const WATER = "#91c9cc";
export const AMBER = "#d7a76d";

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

export const easeOut = (progress: number) => 1 - Math.pow(1 - clamp(progress), 3);
export const easeIn = (progress: number) => {
  const p = clamp(progress);
  return p * p;
};
export const smooth = (progress: number) => {
  const p = clamp(progress);
  return p * p * (3 - 2 * p);
};
export const expoOut = (progress: number) =>
  progress >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(progress));
export const backOut = (progress: number) => {
  const p = clamp(progress) - 1;
  return 1 + p * p * (2.70158 * p + 1.70158);
};
export const seed = (index: number) => {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

/** Everything a scene needs to draw one frame. `motion` freezes under reduced motion. */
export type Stage = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  u: number;
  time: number;
  motion: number;
  age: number;
  progress: number;
  reduced: boolean;
};

export type CharGlyph = { char: string; start: number; end: number; order: number };

/** The lyric itself, flattened to timed characters. These are the pixels of the film. */
export function cueGlyphs(cue: SceneCue): CharGlyph[] {
  const glyphs: CharGlyph[] = [];
  cue.words.forEach((word) => {
    Array.from(word.text).forEach((char) => {
      if (!char.trim()) return;
      glyphs.push({ char, start: word.start, end: word.end, order: glyphs.length });
    });
  });
  if (glyphs.length === 0) {
    Array.from(cue.line.replace(/\s/g, "")).forEach((char, index) => {
      glyphs.push({ char, start: cue.start + index * 0.1, end: cue.end, order: index });
    });
  }
  return glyphs;
}

/** Give an un-timed phrase (title cards, foreshadowing) evenly spaced timings. */
export function spreadGlyphs(text: string, from: number, to: number): CharGlyph[] {
  const chars = Array.from(text).filter((char) => char.trim());
  const count = Math.max(1, chars.length);
  const span = Math.max(0.001, to - from);
  return chars.map((char, index) => ({
    char,
    start: from + (index / count) * span,
    end: from + ((index + 1) / count) * span,
    order: index,
  }));
}

/** 0→1 arrival envelope; always complete when reduced motion is requested. */
export function revealAt(stage: Stage, start: number, duration = 0.28): number {
  return stage.reduced ? 1 : easeOut((stage.time - start) / duration);
}

export type InkOptions = {
  color?: string;
  alpha?: number;
  align?: CanvasTextAlign;
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  weight?: number;
  serif?: boolean;
  mono?: boolean;
  stroke?: string;
  strokeWidth?: number;
  glow?: string;
  glowBlur?: number;
};

export type Placement = InkOptions & { x: number; y: number; size: number };

export function ink(
  stage: Stage,
  value: string,
  x: number,
  y: number,
  size: number,
  options: InkOptions = {},
) {
  const alpha = options.alpha ?? 1;
  if (alpha <= 0.004 || size <= 0.4 || !value) return;
  const ctx = stage.ctx;
  ctx.save();
  ctx.translate(x, y);
  if (options.rotate) ctx.rotate(options.rotate);
  if (options.scaleX || options.scaleY) ctx.scale(options.scaleX ?? 1, options.scaleY ?? 1);
  ctx.globalAlpha = clamp(alpha);
  const weight = options.weight ?? (options.serif ? 500 : 900);
  const family = options.mono ? MONO : options.serif ? SERIF : DISPLAY;
  ctx.font = `${weight} ${Math.max(1, size)}px ${family}`;
  ctx.textAlign = options.align ?? "center";
  ctx.textBaseline = "middle";

  if (options.glow && options.glowBlur) {
    ctx.shadowColor = options.glow;
    ctx.shadowBlur = options.glowBlur;
  }
  if (options.stroke && options.strokeWidth) {
    ctx.strokeStyle = options.stroke;
    ctx.lineWidth = options.strokeWidth;
    ctx.strokeText(value, 0, 0);
  }
  ctx.fillStyle = options.color ?? BONE;
  ctx.fillText(value, 0, 0);
  ctx.restore();
}

/** Render characters aligned vertically in a column */
export function verticalInk(
  stage: Stage,
  text: string,
  x: number,
  topY: number,
  charSize: number,
  spacing: number,
  options: InkOptions = {},
) {
  const chars = Array.from(text);
  chars.forEach((char, index) => {
    ink(stage, char, x, topY + index * spacing, charSize, options);
  });
}

/** High-speed motion streak lines for anime PV acceleration */
export function speedLines(
  stage: Stage,
  count = 28,
  direction: "down" | "up" | "left" | "right" = "up",
  color = BONE,
  maxAlpha = 0.4,
) {
  if (stage.reduced) return;
  const { w, h, ctx, time } = stage;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < count; i += 1) {
    const alpha = (0.15 + seed(i * 31 + Math.floor(time * 16)) * 0.85) * maxAlpha;
    ctx.globalAlpha = clamp(alpha);
    if (direction === "up" || direction === "down") {
      const x = w * seed(i * 73 + 3);
      const len = h * (0.15 + seed(i * 47) * 0.45);
      const yBase = ((time * (direction === "up" ? -3.5 : 3.5) + seed(i * 29)) % 1 + 1) % 1;
      const y = yBase * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + (direction === "up" ? len : -len));
      ctx.stroke();
    } else {
      const y = h * seed(i * 73 + 3);
      const len = w * (0.15 + seed(i * 47) * 0.45);
      const xBase = ((time * (direction === "left" ? -3.5 : 3.5) + seed(i * 29)) % 1 + 1) % 1;
      const x = xBase * w;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (direction === "left" ? len : -len), y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Draw a razor sharp laser slash blade across canvas */
export function drawSlashCut(
  stage: Stage,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  progress: number,
  color = RED,
) {
  const { ctx, u } = stage;
  const p = clamp(progress);
  if (p <= 0) return;
  const curX = lerp(x1, x2, p);
  const curY = lerp(y1, y2, p);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.lineWidth = u * 0.008;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(curX, curY);
  ctx.stroke();
  ctx.strokeStyle = "#ffffff";
  ctx.shadowBlur = 0;
  ctx.lineWidth = u * 0.003;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(curX, curY);
  ctx.stroke();
  ctx.restore();
}


/** Draw smooth curved headphone cord with animated flowing fluid packets */
export function drawHeadphoneCableFlow(
  stage: Stage,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  flowSpeed = 1.8,
  glowColor = RED,
) {
  const { ctx, u, time, reduced } = stage;
  const cp1x = lerp(startX, endX, 0.25) + (reduced ? 0 : Math.sin(time * 1.2) * u * 0.04);
  const cp1y = lerp(startY, endY, 0.4);
  const cp2x = lerp(startX, endX, 0.75) - (reduced ? 0 : Math.cos(time * 1.2) * u * 0.04);
  const cp2y = lerp(startY, endY, 0.7);

  ctx.save();
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = Math.max(2.5, u * 0.009);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
  ctx.stroke();

  ctx.strokeStyle = glowColor;
  ctx.globalAlpha = 0.65;
  ctx.lineWidth = Math.max(1.2, u * 0.0035);
  ctx.stroke();

  if (!reduced) {
    const packetCount = 6;
    for (let i = 0; i < packetCount; i += 1) {
      const t = ((time * flowSpeed * 0.35 + i / packetCount) % 1 + 1) % 1;
      const omt = 1 - t;
      const px = omt * omt * omt * startX + 3 * omt * omt * t * cp1x + 3 * omt * t * t * cp2x + t * t * t * endX;
      const py = omt * omt * omt * startY + 3 * omt * omt * t * cp1y + 3 * omt * t * t * cp2y + t * t * t * endY;
      ctx.fillStyle = AMBER;
      ctx.shadowColor = AMBER;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(px, py, u * 0.007, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Calculate camera shake on heavy impact moments */
export function getCameraShake(time: number, triggerTime: number, duration = 0.35, maxAmp = 10): { x: number; y: number } {
  const dt = time - triggerTime;
  if (dt < 0 || dt > duration) return { x: 0, y: 0 };
  const decay = 1 - dt / duration;
  const freq = 38;
  return {
    x: Math.sin(dt * freq) * maxAmp * decay,
    y: Math.cos(dt * freq * 1.25) * maxAmp * decay,
  };
}



export function paintGlyphs(
  stage: Stage,
  glyphs: CharGlyph[],
  place: (glyph: CharGlyph, index: number, count: number) => Placement | null,
) {
  for (let index = 0; index < glyphs.length; index += 1) {
    const placement = place(glyphs[index], index, glyphs.length);
    if (!placement) continue;
    ink(stage, glyphs[index].char, placement.x, placement.y, placement.size, placement);
  }
}

export type MaskPoint = { x: number; y: number; index: number; rank: number };

const maskCache = new Map<string, MaskPoint[]>();

export function sampleMask(
  id: string,
  inside: (x: number, y: number) => boolean,
  columns = 46,
  rows = 30,
): MaskPoint[] {
  const key = `${id}:${columns}x${rows}`;
  const cached = maskCache.get(key);
  if (cached) return cached;
  const points: MaskPoint[] = [];
  let rank = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = (column / (columns - 1)) * 2 - 1;
      const y = (row / (rows - 1)) * 2 - 1;
      if (inside(x, y)) points.push({ x, y, index: row * columns + column, rank: rank++ });
    }
  }
  maskCache.set(key, points);
  return points;
}

export function paintMask(
  stage: Stage,
  glyphs: CharGlyph[],
  points: MaskPoint[],
  place: (
    point: MaskPoint,
    glyph: CharGlyph,
    index: number,
    count: number,
  ) => Placement | null,
) {
  if (glyphs.length === 0) return;
  for (let index = 0; index < points.length; index += 1) {
    const glyph = glyphs[index % glyphs.length];
    const placement = place(points[index], glyph, index, points.length);
    if (!placement) continue;
    ink(stage, glyph.char, placement.x, placement.y, placement.size, placement);
  }
}

export function hairline(
  stage: Stage,
  points: number[][],
  color: string,
  alpha = 1,
  width = 1,
) {
  const ctx = stage.ctx;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = clamp(alpha);
  ctx.lineWidth = width;
  ctx.beginPath();
  points.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();
}

export type Motif =
  | "wave"
  | "eye"
  | "lid"
  | "heart"
  | "brain"
  | "room"
  | "window"
  | "bottle"
  | "city"
  | "cage"
  | "hand"
  | "cable"
  | "plug"
  | "question"
  | "clock"
  | "sun"
  | "cocoon"
  | "mesh";

export function sampleMotif(kind: Motif, columns = 46, rows = 30): MaskPoint[] {
  return sampleMask(kind, (x, y) => motifInside(kind, x, y), columns, rows);
}

/** Normalized pixel-art stencils; scenes fill them with the lyric's own characters. */
export function motifInside(kind: Motif, x: number, y: number): boolean {
  switch (kind) {
    case "wave": {
      const surface = -0.18 + Math.sin(x * 3.6) * 0.14 + Math.sin(x * 8.3 + 1.7) * 0.05;
      return y > surface;
    }
    case "eye": {
      const lid = Math.pow(Math.max(0, 1 - x * x), 0.72) * 0.55;
      const outline = Math.abs(Math.abs(y) - lid) < 0.085;
      const iris = x * x * 3.6 + y * y * 1.2;
      const pupil = Math.hypot(x, y * 1.1) < 0.13;
      const seam = Math.abs(y) < 0.015 && Math.abs(x) < 0.95;
      return outline || (iris < 0.3 && iris > 0.045 && !pupil) || pupil || seam;
    }
    case "lid":
      return Math.abs(y - (0.04 + x * x * 0.2)) < 0.14 && Math.abs(x) < 0.92;
    case "heart": {
      const hx = x * 1.35;
      const hy = -y * 1.35 - 0.1;
      return Math.pow(hx * hx + hy * hy - 1, 3) - hx * hx * hy * hy * hy < 0;
    }
    case "brain": {
      const side = Math.pow((Math.abs(x) - 0.35) / 0.5, 2) + Math.pow(y / 0.85, 2);
      return side < 1 && Math.abs(x) > 0.045 && (side > 0.7 || Math.sin(x * 21 + Math.sin(y * 16) * 2) > 0.2);
    }
    case "room": {
      const border = Math.abs(Math.abs(x) - 0.9) < 0.06 || Math.abs(Math.abs(y) - 0.82) < 0.06;
      const inner =
        (Math.abs(Math.abs(x) - 0.34) < 0.05 && Math.abs(y) < 0.35) ||
        (Math.abs(Math.abs(y) - 0.34) < 0.05 && Math.abs(x) < 0.34);
      return border || inner || (Math.abs(Math.abs(x) - Math.abs(y) * 1.1) < 0.04 && Math.abs(x) > 0.36);
    }
    case "window":
      return (
        Math.abs(x) < 0.82 &&
        Math.abs(y) < 0.88 &&
        (Math.abs(x) < 0.04 ||
          Math.abs(y) < 0.04 ||
          Math.abs(x) > 0.76 ||
          Math.abs(y) > 0.82 ||
          (x > 0.06 && y < -0.06))
      );
    case "bottle": {
      const half = y < -0.45 ? 0.24 : y < -0.2 ? 0.24 + (y + 0.45) * 1.3 : 0.57;
      return (
        Math.abs(y) < 0.88 &&
        Math.abs(x) < half &&
        (y > 0.05 || Math.abs(x) > half - 0.08 || y < -0.79)
      );
    }
    case "city": {
      const column = Math.floor((x + 1) * 9);
      const roof = -0.15 - seed(column + 41) * 0.7;
      return (
        y > roof &&
        y < 0.86 &&
        (Math.abs((((x + 1) * 9) % 1) - 0.5) > 0.18 || Math.floor(y * 12) % 3 === 0)
      );
    }
    case "cage":
      return (
        Math.abs(x) < 0.9 &&
        y > -0.8 + 0.45 * x * x &&
        y < 0.85 &&
        (Math.abs((((x + 1) * 5) % 1) - 0.5) < 0.11 ||
          y > 0.78 ||
          y < -0.7 + 0.45 * x * x)
      );
    case "hand": {
      const palm = (x * x) / 0.3 + ((y - 0.4) * (y - 0.4)) / 0.23 < 1;
      const fingers =
        x > -0.65 &&
        x < 0.65 &&
        y > -0.72 + Math.abs(x) * 0.6 &&
        y < 0.3 &&
        Math.abs((((x + 0.65) * 4) % 1) - 0.5) < 0.3;
      return palm || fingers;
    }
    case "cable": {
      const path = 0.1 + Math.pow(x, 2) * 0.5 + Math.sin(x * 4.4) * 0.07;
      const cable = Math.abs(y - path) < 0.1 && x < 0.5;
      const plug = x >= 0.5 && x < 0.95 && Math.abs(y - 0.72) < 0.13;
      return cable || plug;
    }
    case "plug":
      return (
        (y > -0.18 && y < 0.18 && x > -0.85 && x < 0.2) ||
        (x >= 0.2 && x < 0.7 && Math.abs(y) < 0.18 * (1 - (x - 0.2) / 0.5))
      );
    case "question": {
      const arc = Math.abs(Math.hypot(x, y + 0.28) - 0.36);
      const hook = arc < 0.12 && y < 0.06 && y > -0.6;
      const stem = Math.abs(x) < 0.1 && y > -0.1 && y < 0.26;
      const dot = Math.hypot(x, y - 0.6) < 0.11;
      return hook || stem || dot;
    }
    case "clock": {
      const radius = Math.hypot(x, y);
      const ring = Math.abs(radius - 0.76) < 0.07;
      const ticks =
        radius > 0.55 &&
        radius < 0.67 &&
        Math.abs(((Math.atan2(y, x) / TAU) * 12) % 1 - 0.5) < 0.09;
      return ring || ticks || radius < 0.08;
    }
    case "sun": {
      const radius = Math.hypot(x, y);
      const core = radius < 0.4;
      const rays =
        radius > 0.52 &&
        radius < 0.92 &&
        Math.abs(((Math.atan2(y, x) / TAU) * 20) % 1 - 0.5) < 0.05;
      return core || rays;
    }
    case "cocoon": {
      const body = (x * x) / 0.24 + (y * y) / 0.8 < 1;
      return body && Math.abs((((y + 1) * 9) % 1) - 0.5) < 0.16;
    }
    case "mesh": {
      const gx = Math.abs((((x + 1) * 5) % 1) - 0.5) < 0.08;
      const gy = Math.abs((((y + 1) * 5) % 1) - 0.5) < 0.08;
      return gx || gy;
    }
  }
}
