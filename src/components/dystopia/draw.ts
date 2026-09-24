/**
 * draw.ts —《反乌托邦 Pt.2》纯矢量 Canvas 动画 PV 绘图引擎
 * 100% 程序化矢量几何、物理粒子、动态排版与歌词隐喻具象化渲染。不依赖任何外部位图。
 */
import type { Cue } from "./score";

export const DISPLAY = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", -apple-system, sans-serif';
export const SERIF = '"Noto Serif SC", "Songti SC", Georgia, serif';
export const MONO = '"JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace';

export const TAU = Math.PI * 2;

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeOut = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
export const easeIn = (p: number) => {
  const c = clamp(p);
  return c * c;
};
export const smooth = (p: number) => {
  const c = clamp(p);
  return c * c * (3 - 2 * c);
};
export const expoOut = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(p)));
export const backOut = (p: number) => {
  const c = clamp(p) - 1;
  return 1 + c * c * (2.70158 * c + 1.70158);
};
export const seed = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

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

export function cueGlyphs(cue: Cue): CharGlyph[] {
  const glyphs: CharGlyph[] = [];
  cue.words.forEach((w) => {
    Array.from(w.text).forEach((ch) => {
      if (!ch.trim()) return;
      glyphs.push({ char: ch, start: w.start, end: w.end, order: glyphs.length });
    });
  });
  if (glyphs.length === 0) {
    Array.from(cue.line.replace(/\s/g, "")).forEach((ch, idx) => {
      glyphs.push({ char: ch, start: cue.start + idx * 0.08, end: cue.end, order: idx });
    });
  }
  return glyphs;
}

export type InkOptions = {
  color?: string;
  alpha?: number;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  weight?: number;
  serif?: boolean;
  mono?: boolean;
  italic?: boolean;
  stroke?: string;
  strokeWidth?: number;
  glow?: string;
  glowBlur?: number;
};

export function ink(
  stage: Stage,
  value: string,
  x: number,
  y: number,
  size: number,
  options: InkOptions = {},
) {
  const alpha = options.alpha ?? 1;
  if (alpha <= 0.005 || size <= 0.5 || !value) return;
  const ctx = stage.ctx;
  ctx.save();
  ctx.translate(x, y);
  if (options.rotate) ctx.rotate(options.rotate);
  if (options.scaleX !== undefined || options.scaleY !== undefined) {
    ctx.scale(options.scaleX ?? 1, options.scaleY ?? 1);
  }
  ctx.globalAlpha = clamp(alpha);

  const weight = options.weight ?? 800;
  const style = options.italic ? "italic " : "";
  const family = options.mono ? MONO : options.serif ? SERIF : DISPLAY;
  ctx.font = `${style}${weight} ${Math.max(1, size)}px ${family}`;
  ctx.textAlign = options.align ?? "center";
  ctx.textBaseline = options.baseline ?? "middle";

  if (options.glow && options.glowBlur) {
    ctx.shadowColor = options.glow;
    ctx.shadowBlur = options.glowBlur;
  }
  if (options.stroke && options.strokeWidth) {
    ctx.strokeStyle = options.stroke;
    ctx.lineWidth = options.strokeWidth;
    ctx.strokeText(value, 0, 0);
  }
  ctx.fillStyle = options.color ?? "#ffffff";
  ctx.fillText(value, 0, 0);
  ctx.restore();
}

export function hairline(
  stage: Stage,
  points: number[][],
  color = "#ffffff",
  alpha = 0.3,
  width = 1,
) {
  if (points.length < 2 || alpha <= 0.01) return;
  const ctx = stage.ctx;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = clamp(alpha);
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();
  ctx.restore();
}

export function getCameraShake(
  time: number,
  triggerTime: number,
  duration = 0.32,
  maxAmp = 10,
): { x: number; y: number } {
  const dt = time - triggerTime;
  if (dt < 0 || dt > duration) return { x: 0, y: 0 };
  const decay = 1 - dt / duration;
  const freq = 42;
  return {
    x: Math.sin(dt * freq) * maxAmp * decay,
    y: Math.cos(dt * freq * 1.3) * maxAmp * decay,
  };
}

export function speedLines(
  stage: Stage,
  count = 32,
  direction: "down" | "up" | "left" | "right" | "radial" = "up",
  color = "#ffffff",
  maxAlpha = 0.45,
) {
  if (stage.reduced) return;
  const { w, h, ctx, time } = stage;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;

  if (direction === "radial") {
    const cx = w * 0.5;
    const cy = h * 0.5;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * TAU + time * 0.2;
      const alpha = (0.2 + seed(i * 17 + Math.floor(time * 18)) * 0.8) * maxAlpha;
      const r1 = Math.min(w, h) * (0.2 + seed(i * 31) * 0.15);
      const r2 = Math.min(w, h) * (0.55 + seed(i * 47) * 0.3);
      ctx.globalAlpha = clamp(alpha);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }
  } else {
    for (let i = 0; i < count; i += 1) {
      const alpha = (0.15 + seed(i * 31 + Math.floor(time * 18)) * 0.85) * maxAlpha;
      ctx.globalAlpha = clamp(alpha);
      if (direction === "up" || direction === "down") {
        const x = w * seed(i * 73 + 5);
        const len = h * (0.18 + seed(i * 47) * 0.4);
        const yBase = ((time * (direction === "up" ? -4.5 : 4.5) + seed(i * 29)) % 1 + 1) % 1;
        const y = yBase * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + (direction === "up" ? len : -len));
        ctx.stroke();
      } else {
        const y = h * seed(i * 73 + 5);
        const len = w * (0.18 + seed(i * 47) * 0.4);
        const xBase = ((time * (direction === "left" ? -4.5 : 4.5) + seed(i * 29)) % 1 + 1) % 1;
        const x = xBase * w;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (direction === "left" ? len : -len), y);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

export function drawSlashCut(
  stage: Stage,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  progress: number,
  color = "#ef4444",
) {
  const { ctx, u } = stage;
  const p = clamp(progress);
  if (p <= 0) return;
  const curX = lerp(x1, x2, p);
  const curY = lerp(y1, y2, p);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.lineWidth = u * 0.012;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(curX, curY);
  ctx.stroke();

  ctx.strokeStyle = "#ffffff";
  ctx.shadowBlur = 0;
  ctx.lineWidth = u * 0.0035;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(curX, curY);
  ctx.stroke();
  ctx.restore();
}

export function drawHeadphoneCableFlow(
  stage: Stage,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  flowSpeed = 2.0,
  glowColor = "#38bdf8",
) {
  const { ctx, u, time, reduced } = stage;
  const cp1x = lerp(startX, endX, 0.25) + (reduced ? 0 : Math.sin(time * 1.4) * u * 0.05);
  const cp1y = lerp(startY, endY, 0.35);
  const cp2x = lerp(startX, endX, 0.75) - (reduced ? 0 : Math.cos(time * 1.4) * u * 0.05);
  const cp2y = lerp(startY, endY, 0.65);

  ctx.save();
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = Math.max(3, u * 0.01);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
  ctx.stroke();

  ctx.strokeStyle = glowColor;
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = Math.max(1.5, u * 0.004);
  ctx.stroke();

  if (!reduced) {
    const packetCount = 7;
    for (let i = 0; i < packetCount; i += 1) {
      const t = ((time * flowSpeed * 0.35 + i / packetCount) % 1 + 1) % 1;
      const omt = 1 - t;
      const px =
        omt * omt * omt * startX +
        3 * omt * omt * t * cp1x +
        3 * omt * t * t * cp2x +
        t * t * t * endX;
      const py =
        omt * omt * omt * startY +
        3 * omt * omt * t * cp1y +
        3 * omt * t * t * cp2y +
        t * t * t * endY;
      ctx.fillStyle = glowColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(px, py, u * 0.008, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** 动态文字排版引擎：根据时间与节拍实现爆发、位移、光晕、断裂等动效 */
export type LyricLineOptions = {
  cx?: number;
  cy: number;
  size?: number;
  color?: string;
  activeColor?: string;
  mutedColor?: string;
  glowColor?: string;
  mode?: "punch" | "smash" | "streak" | "split" | "pulse" | "cascade" | "stamped";
  spacing?: number;
};

export function kineticLyricLine(
  stage: Stage,
  glyphs: CharGlyph[],
  cue: Cue,
  options: LyricLineOptions,
) {
  const { w, h, u, time, reduced } = stage;
  const n = glyphs.length;
  if (n === 0) return;

  const cx = options.cx ?? w * 0.5;
  const cy = options.cy;
  const baseSize = options.size ?? u * 0.07;
  const activeCol = options.activeColor ?? cue.palette.accent;
  const inColor = options.color ?? cue.palette.ink;
  const mutedCol = options.mutedColor ?? cue.palette.muted;
  const glowCol = options.glowColor ?? cue.palette.glow;
  const mode = options.mode ?? "punch";

  const charSpacing = options.spacing ?? Math.min(baseSize * 1.12, (w * 0.88) / n);

  glyphs.forEach((glyph, index) => {
    const isSpoken = time >= glyph.start;
    const isActive = isSpoken && time <= glyph.end + 0.14;
    const sinceStart = time - glyph.start;

    let x = cx + (index - (n - 1) / 2) * charSpacing;
    let y = cy;
    let scale = 1;
    let rot = 0;
    let charAlpha = isSpoken ? 1 : 0.22;
    const customColor = isActive ? activeCol : isSpoken ? inColor : mutedCol;
    const glowBlur = isActive ? 20 : 0;

    if (!reduced && isSpoken) {
      if (mode === "punch") {
        const pop = backOut(clamp(sinceStart / 0.25));
        scale = isActive ? 1.25 * pop : 1;
        y -= (1 - pop) * u * 0.03;
      } else if (mode === "smash") {
        const drop = easeIn(clamp(sinceStart / 0.18));
        const bounce = backOut(clamp((sinceStart - 0.18) / 0.22));
        if (sinceStart < 0.18) {
          y -= (1 - drop) * h * 0.35;
          charAlpha = drop;
        } else {
          y += (1 - bounce) * u * 0.02;
          scale = 1 + (1 - bounce) * 0.4;
        }
      } else if (mode === "streak") {
        const slide = easeOut(clamp(sinceStart / 0.28));
        x -= (1 - slide) * w * 0.3;
        charAlpha = slide;
        if (isActive) {
          ink(stage, glyph.char, x - u * 0.03, y, baseSize, {
            color: activeCol,
            alpha: 0.35,
            glow: glowCol,
            glowBlur: 10,
          });
        }
      } else if (mode === "pulse") {
        const wave = Math.sin(time * 5 + index * 0.6) * u * 0.025;
        y += wave;
        scale = isActive ? 1.3 : 1;
      } else if (mode === "split") {
        const slice = easeOut(clamp(sinceStart / 0.3));
        rot = (index % 2 === 0 ? 0.08 : -0.08) * (1 - slice);
        scale = isActive ? 1.22 : 1;
      } else if (mode === "cascade") {
        const stagger = index * 0.08;
        const p = easeOut(clamp((sinceStart - stagger) / 0.25));
        y += (1 - p) * u * 0.08;
        charAlpha = p;
      } else if (mode === "stamped") {
        const stamp = expoOut(clamp(sinceStart / 0.15));
        scale = 1 + (1 - stamp) * 0.9;
        rot = (seed(glyph.order * 19) - 0.5) * 0.15 * (1 - stamp);
      }
    }

    ink(stage, glyph.char, x, y, baseSize * scale, {
      color: customColor,
      alpha: charAlpha,
      rotate: rot,
      weight: isActive ? 900 : 700,
      glow: isActive ? glowCol : undefined,
      glowBlur,
    });

    if (isActive && !reduced) {
      hairline(
        stage,
        [
          [x - charSpacing * 0.4, y + baseSize * 0.65],
          [x + charSpacing * 0.4, y + baseSize * 0.65],
        ],
        activeCol,
        0.9,
        2.5,
      );
    }
  });
}

// ===========================================================================
// 纯矢量歌词具象化场景动效构件
// ===========================================================================

/** 1. 纯矢量工业天际线与闪烁雷达信标 */
export function drawCitySkyline(stage: Stage, alpha = 0.5) {
  const { ctx, w, h, u, time, reduced } = stage;
  ctx.save();
  ctx.globalAlpha = clamp(alpha);

  const baseY = h * 0.72;
  const towers = 16;
  for (let i = 0; i < towers; i += 1) {
    const tw = w * (0.04 + seed(i * 31) * 0.06);
    const th = h * (0.2 + seed(i * 59) * 0.3);
    const tx = (i / towers) * w * 1.1 - w * 0.05;
    ctx.fillStyle = i % 2 === 0 ? "#0c131a" : "#080c11";
    ctx.fillRect(tx, baseY - th, tw, th + h * 0.3);

    const blink = Math.sin(time * 3 + i * 1.5) > 0.3 ? 1 : 0.15;
    ctx.fillStyle = i % 3 === 0 ? "#ef4444" : "#f59e0b";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = blink > 0.5 ? 8 : 0;
    ctx.globalAlpha = blink * clamp(alpha);
    ctx.beginPath();
    ctx.arc(tx + tw * 0.5, baseY - th - 3, 2.5, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = clamp(alpha);
  }

  if (!reduced) {
    const smokeCount = 18;
    for (let s = 0; s < smokeCount; s += 1) {
      const p = ((time * 0.25 + s / smokeCount) % 1 + 1) % 1;
      const sx = w * 0.35 + Math.sin(p * 5 + s) * u * 0.04 + p * w * 0.1;
      const sy = baseY - h * 0.45 - p * h * 0.25;
      const r = u * (0.015 + p * 0.04);
      ctx.fillStyle = "#1e293b";
      ctx.globalAlpha = (1 - p) * 0.35 * clamp(alpha);
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** 2. 争夺：两只对冲的重型机械臂/铁爪碰撞产生火花冲击波 */
export function drawClashArms(stage: Stage, progress: number) {
  const { ctx, w, h, u, time, reduced } = stage;
  const p = clamp(progress);
  ctx.save();

  const travel = (1 - easeOut(p)) * w * 0.35;
  const leftX = w * 0.5 - travel;
  const rightX = w * 0.5 + travel;
  const armY = h * 0.45;

  // 左机械铁臂
  ctx.strokeStyle = "#94a3b8";
  ctx.fillStyle = "#1e293b";
  ctx.lineWidth = Math.max(3, u * 0.008);
  ctx.beginPath();
  ctx.moveTo(leftX - u * 0.3, armY - u * 0.08);
  ctx.lineTo(leftX - u * 0.05, armY - u * 0.04);
  ctx.lineTo(leftX, armY);
  ctx.lineTo(leftX - u * 0.05, armY + u * 0.04);
  ctx.lineTo(leftX - u * 0.3, armY + u * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 右机械铁臂
  ctx.beginPath();
  ctx.moveTo(rightX + u * 0.3, armY - u * 0.08);
  ctx.lineTo(rightX + u * 0.05, armY - u * 0.04);
  ctx.lineTo(rightX, armY);
  ctx.lineTo(rightX + u * 0.05, armY + u * 0.04);
  ctx.lineTo(rightX + u * 0.3, armY + u * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 撞击瞬间的爆破光晕与火花
  if (p > 0.3 && !reduced) {
    const burstR = u * (0.05 + (p - 0.3) * 0.4);
    ctx.strokeStyle = "#ef4444";
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 20;
    ctx.globalAlpha = (1 - p) * 0.9;
    ctx.beginPath();
    ctx.arc(w * 0.5, armY, burstR, 0, TAU);
    ctx.stroke();

    for (let i = 0; i < 16; i += 1) {
      const angle = (i / 16) * TAU + time * 5;
      const dist = burstR * (0.6 + seed(i * 19) * 0.6);
      ctx.fillStyle = i % 2 === 0 ? "#ffedd5" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(w * 0.5 + Math.cos(angle) * dist, armY + Math.sin(angle) * dist, u * 0.006, 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** 3. 敲碎成粉末：晶莹星辰被巨锤砸碎为漫天微粒 */
export function drawShatterPowder(stage: Stage, progress: number) {
  const { ctx, w, h, u, reduced } = stage;
  const p = clamp(progress);
  ctx.save();
  const cy = h * 0.42;

  if (p < 0.25) {
    // 尚未被砸碎前：中央发光的完整晶核
    const r = u * 0.08;
    ctx.strokeStyle = "#38bdf8";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 18;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(w * 0.5 - r * 0.5, cy - r * 0.5, r, r);
  } else {
    // 砸碎之后：数百颗发光粉末微粒从中央向外呈环形扩散
    const shatterAge = (p - 0.25) / 0.75;
    const count = reduced ? 20 : 60;
    for (let i = 0; i < count; i += 1) {
      const ang = seed(i * 47) * TAU;
      const spd = u * (0.1 + seed(i * 89) * 0.35);
      const dist = shatterAge * spd;
      const px = w * 0.5 + Math.cos(ang) * dist;
      const py = cy + Math.sin(ang) * dist + shatterAge * shatterAge * u * 0.15;
      const sz = u * (0.003 + seed(i * 23) * 0.005) * (1 - shatterAge * 0.5);

      ctx.fillStyle = i % 3 === 0 ? "#ffffff" : i % 2 === 0 ? "#ffb04a" : "#38bdf8";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = (1 - shatterAge) * 0.85;
      ctx.beginPath();
      ctx.arc(px, py, sz, 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** 4. 门锁与铁链：粗重铁链与锁扣合拢 */
export function drawChainsAndLock(stage: Stage, lockProgress: number) {
  const { ctx, w, h, u } = stage;
  const p = clamp(lockProgress);
  ctx.save();

  // 4 根从顶部落下的重型铁链
  [-0.3, -0.1, 0.1, 0.3].forEach((off) => {
    const lx = w * 0.5 + off * w;
    hairline(stage, [[lx, 0], [lx, h * 0.55]], "#64748b", 0.6, 3.5);
    // 链环装饰
    for (let y = 20; y < h * 0.55; y += 24) {
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.strokeRect(lx - 5, y, 10, 14);
    }
  });

  // 中央重型挂锁
  const lockY = h * 0.42;
  const lockW = u * 0.22;
  const lockH = u * 0.16;

  // 锁梁（下落扣合）
  const shackleDrop = (1 - easeOut(p)) * u * 0.06;
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = Math.max(3, u * 0.01);
  ctx.beginPath();
  ctx.arc(w * 0.5, lockY - lockH * 0.5 - shackleDrop, lockW * 0.35, Math.PI, 0);
  ctx.stroke();

  // 锁体
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#f59e0b";
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = p > 0.8 ? 14 : 0;
  ctx.lineWidth = 2.5;
  ctx.fillRect(w * 0.5 - lockW * 0.5, lockY - lockH * 0.5, lockW, lockH);
  ctx.strokeRect(w * 0.5 - lockW * 0.5, lockY - lockH * 0.5, lockW, lockH);

  // 钥匙孔
  ctx.fillStyle = "#090d12";
  ctx.beginPath();
  ctx.arc(w * 0.5, lockY - u * 0.01, u * 0.015, 0, TAU);
  ctx.rect(w * 0.5 - u * 0.008, lockY - u * 0.01, u * 0.016, u * 0.035);
  ctx.fill();

  ctx.restore();
}

/** 5. 暴雨与模糊灯火 */
export function drawRainAndLamps(stage: Stage, alpha = 0.55) {
  const { ctx, w, h, u, time, reduced } = stage;
  ctx.save();
  ctx.globalAlpha = clamp(alpha);

  // 斜风暴雨雨丝
  if (!reduced) {
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 45; i += 1) {
      const rx = (seed(i * 13) * w * 1.3 - time * 600) % w;
      const ry = (seed(i * 37) * h + time * 900) % h;
      ctx.globalAlpha = (0.1 + seed(i * 71) * 0.35) * clamp(alpha);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 15, ry + 30);
      ctx.stroke();
    }
  }

  // 远景失焦大散焦灯火光斑
  for (let i = 0; i < 14; i += 1) {
    const lx = w * seed(i * 43 + 3);
    const ly = h * (0.25 + seed(i * 67) * 0.45);
    const lr = u * (0.03 + seed(i * 19) * 0.05);
    const grad = ctx.createRadialGradient(lx, ly, 2, lx, ly, lr);
    grad.addColorStop(0, i % 2 === 0 ? "rgba(56, 189, 248, 0.6)" : "rgba(251, 191, 36, 0.6)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.globalAlpha = clamp(alpha);
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

/** 6. 良心称量天平 */
export function drawScaleBalance(stage: Stage, tilt = 0.25) {
  const { ctx, w, h, u } = stage;
  ctx.save();
  const cx = w * 0.5;
  const cy = h * 0.42;

  // 天平支柱
  hairline(stage, [[cx, cy - u * 0.15], [cx, cy + u * 0.15]], "#94a3b8", 0.7, 3);
  hairline(stage, [[cx - u * 0.1, cy + u * 0.15], [cx + u * 0.1, cy + u * 0.15]], "#94a3b8", 0.7, 4);

  // 倾斜衡梁
  const beamLen = u * 0.32;
  const leftX = cx - Math.cos(tilt) * beamLen;
  const leftY = cy - Math.sin(tilt) * beamLen;
  const rightX = cx + Math.cos(tilt) * beamLen;
  const rightY = cy + Math.sin(tilt) * beamLen;
  hairline(stage, [[leftX, leftY], [rightX, rightY]], "#cbd5e1", 0.85, 3);

  // 左托盘（良心：红亮）
  hairline(stage, [[leftX, leftY], [leftX - u * 0.05, leftY + u * 0.1]], "#64748b", 0.6, 1.5);
  hairline(stage, [[leftX, leftY], [leftX + u * 0.05, leftY + u * 0.1]], "#64748b", 0.6, 1.5);
  ctx.fillStyle = "#ef4444";
  ctx.shadowColor = "#ef4444";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(leftX, leftY + u * 0.08, u * 0.025, 0, TAU);
  ctx.fill();

  // 右托盘（金币筹码压低）
  hairline(stage, [[rightX, rightY], [rightX - u * 0.05, rightY + u * 0.1]], "#64748b", 0.6, 1.5);
  hairline(stage, [[rightX, rightY], [rightX + u * 0.05, rightY + u * 0.1]], "#64748b", 0.6, 1.5);
  ctx.fillStyle = "#f59e0b";
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 8;
  for (let c = 0; c < 3; c += 1) {
    ctx.fillRect(rightX - u * 0.03, rightY + u * 0.09 - c * u * 0.012, u * 0.06, u * 0.008);
  }

  ctx.restore();
}

/** 7. 跳动的纯矢量解剖机械心脏 */
export function drawMechanicalHeart(
  stage: Stage,
  cx: number,
  cy: number,
  radius: number,
  beatPower = 1.0,
) {
  const { ctx, u, time, reduced } = stage;
  ctx.save();
  ctx.translate(cx, cy);

  const beatCycle = (time * 2.2) % 1;
  const pulse = reduced
    ? 1
    : 1 + (Math.sin(beatCycle * Math.PI) > 0.7 ? 0.14 * beatPower : 0);
  ctx.scale(pulse, pulse);

  const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.5);
  grad.addColorStop(0, "rgba(239, 68, 68, 0.45)");
  grad.addColorStop(0.6, "rgba(245, 158, 11, 0.15)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.5, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#1c1917";
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = Math.max(2, u * 0.006);
  ctx.shadowColor = "#ef4444";
  ctx.shadowBlur = 12;

  ctx.beginPath();
  ctx.moveTo(0, radius * 0.85);
  ctx.bezierCurveTo(-radius * 0.9, radius * 0.2, -radius * 0.95, -radius * 0.7, 0, -radius * 0.4);
  ctx.bezierCurveTo(radius * 0.95, -radius * 0.7, radius * 0.9, radius * 0.2, 0, radius * 0.85);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = Math.max(1.5, u * 0.004);
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.35);
  ctx.lineTo(-radius * 0.3, 0);
  ctx.lineTo(0, radius * 0.4);
  ctx.lineTo(radius * 0.3, 0);
  ctx.closePath();
  ctx.stroke();

  [-0.35, 0, 0.35].forEach((offset) => {
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = Math.max(3, u * 0.008);
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(offset * radius, -radius * 0.5);
    ctx.lineTo(offset * radius * 1.3, -radius * 1.1);
    ctx.stroke();
  });

  ctx.restore();
}

/** 8. 激光牢笼收紧网格 */
export function drawLaserNet(stage: Stage, tension = 1.0, color = "#ef4444") {
  const { ctx, w, h, u, time, reduced } = stage;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.lineWidth = Math.max(1, u * 0.0025);

  const cols = 12;
  const rows = 8;
  const jitter = reduced ? 0 : Math.sin(time * 8) * u * 0.005 * tension;

  for (let c = 0; c <= cols; c += 1) {
    const x = (c / cols) * w;
    ctx.globalAlpha = 0.25 + (c % 2 === 0 ? 0.2 : 0);
    ctx.beginPath();
    ctx.moveTo(x + jitter, 0);
    ctx.lineTo(x - jitter, h);
    ctx.stroke();
  }

  for (let r = 0; r <= rows; r += 1) {
    const y = (r / rows) * h;
    ctx.globalAlpha = 0.25 + (r % 2 === 0 ? 0.2 : 0);
    ctx.beginPath();
    ctx.moveTo(0, y - jitter);
    ctx.lineTo(w, y + jitter);
    ctx.stroke();
  }

  if (!reduced) {
    for (let i = 0; i < 6; i += 1) {
      const sparkCol = Math.floor(seed(i * 13 + Math.floor(time * 12)) * cols);
      const sparkRow = Math.floor(seed(i * 29 + Math.floor(time * 12)) * rows);
      const sx = (sparkCol / cols) * w;
      const sy = (sparkRow / rows) * h;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(sx, sy, u * 0.006, 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** 9. 齿轮咬合旋转 */
export function drawIndustrialGears(
  stage: Stage,
  cx: number,
  cy: number,
  radius: number,
  speed = 1.0,
  teeth = 16,
) {
  const { ctx, u, time, reduced } = stage;
  ctx.save();
  ctx.translate(cx, cy);
  const rot = reduced ? 0 : time * speed;
  ctx.rotate(rot);

  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = Math.max(2, u * 0.005);

  ctx.beginPath();
  for (let i = 0; i < teeth; i += 1) {
    const a1 = (i / teeth) * TAU;
    const a2 = a1 + (0.5 / teeth) * TAU;
    const a3 = a1 + (0.75 / teeth) * TAU;
    const a4 = ((i + 1) / teeth) * TAU;

    const rOut = radius;
    const rIn = radius * 0.82;

    if (i === 0) ctx.moveTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn);
    else ctx.lineTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn);
    ctx.lineTo(Math.cos(a2) * rOut, Math.sin(a2) * rOut);
    ctx.lineTo(Math.cos(a3) * rOut, Math.sin(a3) * rOut);
    ctx.lineTo(Math.cos(a4) * rIn, Math.sin(a4) * rIn);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#090d12";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.35, 0, TAU);
  ctx.fill();
  ctx.stroke();

  for (let s = 0; s < 4; s += 1) {
    const sa = (s / 4) * TAU;
    hairline(
      stage,
      [
        [cx + Math.cos(sa + rot) * radius * 0.35, cy + Math.sin(sa + rot) * radius * 0.35],
        [cx + Math.cos(sa + rot) * radius * 0.8, cy + Math.sin(sa + rot) * radius * 0.8],
      ],
      "#64748b",
      0.6,
      2,
    );
  }

  ctx.restore();
}

/** 10. 扫射夜空的探照灯 */
export function drawSearchlights(stage: Stage, alpha = 0.4) {
  const { ctx, w, h, time, reduced } = stage;
  ctx.save();
  const beams = [
    { originX: w * 0.2, sweepSpeed: 0.6, offset: 0 },
    { originX: w * 0.5, sweepSpeed: -0.8, offset: 1.2 },
    { originX: w * 0.8, sweepSpeed: 0.5, offset: 2.5 },
  ];

  beams.forEach((b) => {
    const angle =
      -Math.PI * 0.5 + (reduced ? 0 : Math.sin(time * b.sweepSpeed + b.offset) * 0.55);
    const targetX = b.originX + Math.cos(angle) * h * 1.3;
    const targetY = h + Math.sin(angle) * h * 1.3;

    const grad = ctx.createRadialGradient(b.originX, h, 10, targetX, targetY, w * 0.25);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    grad.addColorStop(0.3, "rgba(56, 189, 248, 0.2)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.globalAlpha = clamp(alpha);
    ctx.beginPath();
    ctx.moveTo(b.originX - 15, h);
    ctx.lineTo(targetX - w * 0.15, 0);
    ctx.lineTo(targetX + w * 0.15, 0);
    ctx.lineTo(b.originX + 15, h);
    ctx.closePath();
    ctx.fill();
  });

  ctx.restore();
}

/** 11. 烧红的烙铁与飞溅火星 */
export function drawBurningIron(stage: Stage, cx: number, cy: number, heat = 1.0) {
  const { ctx, u, time, reduced } = stage;
  ctx.save();
  ctx.translate(cx, cy);

  const ironW = u * 0.35;
  const ironH = u * 0.14;

  const grad = ctx.createLinearGradient(0, -ironH * 0.5, 0, ironH * 0.5);
  grad.addColorStop(0, "#ffedd5");
  grad.addColorStop(0.3, "#f97316");
  grad.addColorStop(0.8, "#dc2626");
  grad.addColorStop(1, "#7f1d1d");

  ctx.fillStyle = grad;
  ctx.shadowColor = "#ff5722";
  ctx.shadowBlur = 24 * heat;
  ctx.fillRect(-ironW * 0.5, -ironH * 0.5, ironW, ironH);

  ctx.fillStyle = "#334155";
  ctx.shadowBlur = 0;
  ctx.fillRect(-u * 0.02, -ironH * 0.5 - u * 0.2, u * 0.04, u * 0.2);

  if (!reduced && heat > 0.2) {
    for (let i = 0; i < 18; i += 1) {
      const p = ((time * 2.5 + i / 18) % 1 + 1) % 1;
      const angle = seed(i * 41) * Math.PI + Math.PI;
      const dist = u * (0.05 + p * 0.22);
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist - p * u * 0.08;
      ctx.fillStyle = i % 2 === 0 ? "#ffedd5" : "#f59e0b";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 8;
      ctx.globalAlpha = (1 - p) * heat;
      ctx.beginPath();
      ctx.arc(sx, sy, u * (0.004 + (1 - p) * 0.004), 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** 12. 电吉他六弦律动与声谱柱 */
export function drawGuitarStaves(stage: Stage, cx: number, cy: number, length: number) {
  const { ctx, u, time, reduced } = stage;
  ctx.save();
  ctx.translate(cx, cy);

  const strings = 6;
  for (let s = 0; s < strings; s += 1) {
    const yOff = (s - (strings - 1) / 2) * u * 0.035;
    const vibAmp = reduced ? 0 : Math.sin(time * (18 + s * 6)) * u * 0.008;

    ctx.strokeStyle = s === 0 ? "#f59e0b" : "#38bdf8";
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 8;
    ctx.lineWidth = Math.max(1.2, u * (0.003 - s * 0.0003));
    ctx.globalAlpha = 0.85;

    ctx.beginPath();
    ctx.moveTo(-length * 0.5, yOff);
    ctx.quadraticCurveTo(0, yOff + vibAmp, length * 0.5, yOff);
    ctx.stroke();
  }

  const bars = 28;
  const barW = (length * 0.8) / bars;
  for (let b = 0; b < bars; b += 1) {
    const bx = -length * 0.4 + b * barW;
    const barH =
      u * (0.02 + Math.abs(Math.sin(time * 6 + b * 0.5)) * 0.08 * (reduced ? 0.3 : 1));
    ctx.fillStyle = b % 2 === 0 ? "#38bdf8" : "#fbbf24";
    ctx.globalAlpha = 0.45;
    ctx.fillRect(bx, u * 0.15 - barH, barW * 0.65, barH);
  }

  ctx.restore();
}

/** 13. 盛开的水晶折纸花朵 */
export function drawBloomingFlower(
  stage: Stage,
  cx: number,
  cy: number,
  radius: number,
  bloom = 1.0,
) {
  const { ctx, u, time, reduced } = stage;
  ctx.save();
  ctx.translate(cx, cy);

  const pBloom = clamp(bloom);
  const curR = radius * pBloom;

  const grad = ctx.createRadialGradient(0, 0, curR * 0.1, 0, 0, curR * 1.4);
  grad.addColorStop(0, "rgba(254, 240, 138, 0.8)");
  grad.addColorStop(0.5, "rgba(56, 189, 248, 0.3)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, curR * 1.4, 0, TAU);
  ctx.fill();

  const petals = 8;
  for (let p = 0; p < petals; p += 1) {
    const angle = (p / petals) * TAU + (reduced ? 0 : time * 0.1);
    ctx.save();
    ctx.rotate(angle);

    ctx.fillStyle = "rgba(186, 230, 253, 0.45)";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(1.5, u * 0.0035);
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(curR * 0.35, -curR * 0.25);
    ctx.lineTo(curR * 0.95, 0);
    ctx.lineTo(curR * 0.35, curR * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  if (!reduced && pBloom > 0.3) {
    for (let s = 0; s < 14; s += 1) {
      const sp = ((time * 0.5 + s / 14) % 1 + 1) % 1;
      const angle = seed(s * 73) * TAU;
      const dist = curR * (0.4 + sp * 0.8);
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist - sp * u * 0.15;
      ctx.fillStyle = "#fef08a";
      ctx.shadowColor = "#fef08a";
      ctx.shadowBlur = 6;
      ctx.globalAlpha = (1 - sp) * 0.9;
      ctx.beginPath();
      ctx.arc(sx, sy, u * 0.005, 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** 14. 签字笔手绘乌托邦房屋线稿 */
export function drawSketchUtopia(stage: Stage, progress: number) {
  const { ctx, w, h, u } = stage;
  const p = clamp(progress);
  ctx.save();
  const cx = w * 0.5;
  const cy = h * 0.45;
  const sz = u * 0.15;

  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 12;

  // 房体矩形
  if (p > 0.1) {
    ctx.strokeRect(cx - sz, cy, sz * 2, sz);
  }
  // 屋顶三角形
  if (p > 0.35) {
    ctx.beginPath();
    ctx.moveTo(cx - sz * 1.1, cy);
    ctx.lineTo(cx, cy - sz * 0.8);
    ctx.lineTo(cx + sz * 1.1, cy);
    ctx.closePath();
    ctx.stroke();
  }
  // 窗户与门
  if (p > 0.6) {
    ctx.strokeRect(cx - sz * 0.2, cy + sz * 0.3, sz * 0.4, sz * 0.7);
    ctx.strokeRect(cx - sz * 0.7, cy + sz * 0.2, sz * 0.3, sz * 0.3);
    ctx.strokeRect(cx + sz * 0.4, cy + sz * 0.2, sz * 0.3, sz * 0.3);
  }

  ctx.restore();
}

/** 15. 半平米暗室天窗斜射进来的朝阳光束与浮尘 */
export function drawSunbeamWindow(stage: Stage, alpha = 0.55) {
  const { ctx, w, h, u, time, reduced } = stage;
  ctx.save();
  ctx.globalAlpha = clamp(alpha);

  const winX = w * 0.12;
  const winY = h * 0.15;
  const winW = u * 0.2;
  const winH = u * 0.15;

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = Math.max(2, u * 0.005);
  ctx.strokeRect(winX, winY, winW, winH);

  const grad = ctx.createLinearGradient(winX, winY, winX + w * 0.65, winY + h * 0.7);
  grad.addColorStop(0, "rgba(254, 240, 138, 0.45)");
  grad.addColorStop(0.5, "rgba(251, 191, 36, 0.18)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(winX, winY);
  ctx.lineTo(winX + winW, winY);
  ctx.lineTo(winX + winW + w * 0.65, h * 0.95);
  ctx.lineTo(winX + w * 0.45, h * 0.95);
  ctx.closePath();
  ctx.fill();

  if (!reduced) {
    const dustCount = 35;
    for (let d = 0; d < dustCount; d += 1) {
      const dp = ((time * 0.15 + seed(d * 47)) % 1 + 1) % 1;
      const t = dp;
      const bx = lerp(winX + winW * 0.5, winX + w * 0.55, t) + (seed(d * 19) - 0.5) * u * 0.25;
      const by = lerp(winY + winH * 0.5, h * 0.85, t) + (seed(d * 83) - 0.5) * u * 0.15;
      const r = u * (0.003 + seed(d * 101) * 0.004);
      ctx.fillStyle = "#fef08a";
      ctx.shadowColor = "#fef08a";
      ctx.shadowBlur = 5;
      ctx.globalAlpha = (0.2 + seed(d * 31) * 0.8) * clamp(alpha);
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
}
