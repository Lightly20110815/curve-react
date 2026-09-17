import {
  AMBER,
  BLACK,
  BONE,
  RED,
  TAU,
  WATER,
  backOut,
  clamp,
  drawHeadphoneCableFlow,
  drawSlashCut,
  easeIn,
  easeOut,
  hairline,
  ink,
  lerp,
  paintMask,
  revealAt,
  sampleMotif,
  seed,
  smooth,
  speedLines,
  type CharGlyph,
  type Stage,
} from "./draw";

import type { SceneCue, SceneKind } from "./score";

export type Frame = Stage & { cue: SceneCue; glyphs: CharGlyph[] };

function cycled(f: Frame, index: number): CharGlyph {
  return f.glyphs[index % f.glyphs.length];
}

function atChar(f: Frame, char: string): number {
  const found = f.glyphs.find((glyph) => glyph.char === char);
  return found?.start ?? f.cue.start + 0.5;
}

function wrap(value: number, size: number): number {
  return ((value % size) + size) % size;
}

// ===========================================================================
// ACT I: MEMORY REEL (海边、终点、镜中、碎片、房间、晚霞、咖啡、冷凝、人群、安静、逃离)
// ===========================================================================

/** 那个夏天去过的海边 */
function sea(f: Frame) {
  const { w, h, u } = f;

  // 1. 顶部夏日镜头光晕与元数据
  const sunGlare = f.reduced ? 0.3 : Math.sin(f.motion * 0.8) * 0.15 + 0.35;
  hairline(f, [[0, h * 0.18], [w, h * 0.18]], f.cue.palette.ink, sunGlare * 0.25);
  ink(f, "SUMMER 2026 // THE STILL SHORELINE", w * 0.5, h * 0.14, u * 0.018, {
    color: f.cue.palette.muted,
    mono: true,
    alpha: 0.7,
  });

  // 2. 动态海浪层叠（由波浪曲线与文字海沫组成）
  const waveLayers = 4;
  for (let layer = 0; layer < waveLayers; layer += 1) {
    const layerDepth = (layer + 1) / waveLayers;
    const baseY = h * (0.5 + layerDepth * 0.38);
    const waveAmp = u * (0.02 + layerDepth * 0.025);
    const waveFreq = 2.4 + layer * 1.1;
    const waveSpeed = (layer % 2 === 0 ? 1 : -0.8) * (f.reduced ? 0 : f.motion * 1.4);

    // 波浪线
    const wavePts: number[][] = [];
    const stepCount = 36;
    for (let s = 0; s <= stepCount; s += 1) {
      const px = (s / stepCount) * w;
      const py = baseY + Math.sin((s / stepCount) * waveFreq * TAU + waveSpeed) * waveAmp;
      wavePts.push([px, py]);
    }
    hairline(f, wavePts, layer === 0 ? f.cue.palette.accent : f.cue.palette.ink, 0.2 + layerDepth * 0.2, 1.5);

    // 浪花上的字符水滴
    for (let c = 0; c < 12; c += 1) {
      const p = wrap(c / 12 + (f.reduced ? 0.3 : f.motion * 0.08 * (layer + 1)), 1);
      const glyph = cycled(f, layer * 12 + c);
      const qx = p * w;
      const qy = baseY + Math.sin(p * waveFreq * TAU + waveSpeed) * waveAmp - u * 0.02;
      ink(f, glyph.char, qx, qy, u * (0.018 + layerDepth * 0.012), {
        alpha: (0.2 + seed(layer * 13 + c) * 0.4) * revealAt(f, glyph.start),
        color: layer === 0 ? f.cue.palette.accent : f.cue.palette.ink,
      });
    }
  }

  // 3. 核心歌词节拍爆发：巨型主视觉文字随演唱依次浪涌跃出水面
  const n = f.glyphs.length;
  const charSpacing = Math.min(u * 0.085, (w * 0.82) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.15;
    const pop = f.reduced ? 1 : backOut(clamp((f.time - glyph.start) / 0.28));
    const splashY = h * 0.44 - (active ? u * 0.04 : 0) - (1 - pop) * u * 0.05;
    const x = w * 0.5 + (index - (n - 1) / 2) * charSpacing;


    if (!f.reduced && active) {
      // 浪花飞溅水沫
      for (let sp = 0; sp < 4; sp += 1) {
        const angle = (sp / 4) * Math.PI + Math.PI;
        ink(f, "·", x + Math.cos(angle) * u * 0.04, splashY + Math.sin(angle) * u * 0.04, u * 0.025, {
          color: f.cue.palette.accent,
          alpha: 0.8,
        });
      }
    }

    ink(f, glyph.char, x, splashY, charSpacing * (active ? 1.25 : 1.05), {
      alpha: spoken ? 1 : 0.15,
      color: active ? f.cue.palette.accent : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: active ? 900 : 700,
      glow: active ? f.cue.palette.accent : undefined,
      glowBlur: active ? 16 : 0,
    });
  });

  // 4. 水平线图章
  ink(f, "海 边", w * 0.5, h * 0.62, u * 0.14, {
    color: f.cue.palette.muted,
    alpha: 0.12,
    weight: 900,
  });
}

/** 听闻过遥遥无期的终点 / 大概基于无法共情明天 */
function horizon(f: Frame) {
  const { w, h, u } = f;
  const isTomorrow = f.cue.variant === 1;
  const vpX = w * 0.5;
  const vpY = h * 0.38;

  // 1. 3D 无限延伸透视道路网格
  const lanes = 9;
  for (let l = 0; l <= lanes; l += 1) {
    const t = l / lanes;
    const bottomX = lerp(w * -0.2, w * 1.2, t);
    hairline(f, [[bottomX, h * 0.98], [vpX, vpY]], f.cue.palette.ink, 0.18);
  }

  // 2. 迎面飞驰而来的速度斑马线与字符
  const speed = f.reduced ? 0.2 : f.motion * 0.45;
  const roadWords = isTomorrow ? "共情明天" : "遥遥无期";
  for (let step = 0; step < 16; step += 1) {
    const p = wrap(step / 16 + speed, 1);
    const z = Math.pow(p, 2.6); // 非线性透视缩放
    const curY = lerp(vpY, h * 0.98, z);
    const curW = lerp(0, w * 0.85, z);
    hairline(f, [[vpX - curW * 0.5, curY], [vpX + curW * 0.5, curY]], f.cue.palette.muted, z * 0.35);

    // 道路两侧飞驰字符
    const wordChar = roadWords[step % roadWords.length];
    [-1, 1].forEach((side) => {
      const qx = vpX + side * curW * 0.54;
      ink(f, wordChar, qx, curY, u * (0.01 + z * 0.055), {
        alpha: z * 0.5,
        color: z > 0.6 ? f.cue.palette.accent : f.cue.palette.muted,
      });
    });
  }

  // 3. 消失点远方巨型发光标牌
  const focusWord = isTomorrow ? "明天" : "终点";
  const beaconPulse = f.reduced ? 0.7 : Math.sin(f.motion * 4) * 0.2 + 0.8;
  ink(f, focusWord, vpX, vpY - u * 0.06, u * 0.075, {
    color: f.cue.palette.accent,
    weight: 900,
    glow: f.cue.palette.accent,
    glowBlur: 20 * beaconPulse,
    alpha: 0.95,
  });

  // 4. 居中演唱文字：大字号醒目排版
  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    const enter = f.reduced ? 1 : backOut(clamp((f.time - glyph.start) / 0.25));
    const x = w * 0.5 + (index - (n - 1) / 2) * size * 1.06;
    const y = h * 0.74 - (1 - enter) * u * 0.04;

    ink(f, glyph.char, x, y, size * (active ? 1.2 : 1), {
      alpha: spoken ? 1 : 0.2,
      color: active ? f.cue.palette.accent : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
      glow: active ? f.cue.palette.accent : undefined,
      glowBlur: active ? 12 : 0,
    });
  });
}

/** 镜中她有些发青的眼睑 */
function mirror(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;

  // 1. 中央垂直镜面折痕与裂隙
  hairline(f, [[cx, h * 0.05], [cx, h * 0.95]], f.cue.palette.accent, 0.4, 2);
  hairline(f, [[cx - 2, h * 0.05], [cx - 2, h * 0.95]], WATER, 0.3, 1);

  // 2. 顶部微张微合的真实像素感眼睛
  const eyePoints = sampleMotif("eye", 38, 18);
  const eyeSpanX = u * 0.62;
  const eyeSpanY = u * 0.28;
  const blink = f.reduced ? 0.6 : (Math.sin(f.motion * 2.2) + 1) / 2;
  paintMask(f, f.glyphs, eyePoints, (pt) => {
    const isBruise = pt.y > 0.15; // 发青的下眼睑
    return {
      x: cx + pt.x * eyeSpanX * 0.5,
      y: h * 0.28 + pt.y * eyeSpanY * 0.5 * Math.max(0.12, blink),
      size: u * 0.015,
      alpha: isBruise ? 0.85 : 0.45,
      color: isBruise ? WATER : pt.rank % 4 === 0 ? f.cue.palette.accent : f.cue.palette.ink,
    };
  });

  // 3. 镜像对称的歌词呈现：左侧正像，右侧倒像色差错位
  const n = f.glyphs.length;
  const size = Math.min(u * 0.065, (h * 0.55) / n);
  const spacing = size * 1.15;
  const topY = h * 0.46;

  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    const y = topY + index * spacing;
    const sway = f.reduced ? 0 : Math.sin(f.motion * 2 + index * 0.4) * u * 0.008;

    // 左侧：正向
    ink(f, glyph.char, cx - u * 0.14 + sway, y, size * (active ? 1.15 : 1), {
      alpha: spoken ? 1 : 0.2,
      color: active ? f.cue.palette.accent : f.cue.palette.ink,
      weight: active ? 900 : 700,
    });

    // 右侧：镜面倒影（水平翻转 scaleX: -1，色调偏青发冷）
    ink(f, glyph.char, cx + u * 0.14 - sway, y, size * (active ? 1.15 : 1), {
      alpha: spoken ? 0.65 : 0.1,
      color: active ? WATER : f.cue.palette.muted,
      scaleX: -1,
      weight: 600,
    });
  });
}

/** 全部被红笔尖划成碎片 / 碎片在闪现 / 后来存在回忆的碎片 */
function shatter(f: Frame) {
  const { w, h, u } = f;
  const variant = f.cue.variant;
  const n = f.glyphs.length;

  if (variant === 0) {
    // 【全部被红笔尖划成碎片】核心设计：红笔横空斩裂全屏，文字断裂位移！
    const slashTime = atChar(f, "划");
    const isSlashed = f.time >= slashTime;
    const slashAge = f.reduced ? 1 : Math.max(0, f.time - slashTime);
    const cutProgress = f.reduced ? 1 : clamp(slashAge / 0.25);
    const splitDistance = f.reduced ? u * 0.08 : easeOut(clamp(slashAge / 0.55)) * u * 0.12;

    // 1. 斜斩光刃
    const cutStart = [w * 0.95, h * 0.15];
    const cutEnd = [w * 0.05, h * 0.85];
    if (isSlashed) {
      drawSlashCut(f, cutStart[0], cutStart[1], cutEnd[0], cutEnd[1], cutProgress, RED);
    }

    // 2. 被斩断为上下两半的文字碎片
    const perRow = Math.ceil(n / 2);
    const size = Math.min(u * 0.11, (w * 0.86) / (perRow * 1.1));

    f.glyphs.forEach((glyph, index) => {
      const spoken = f.time >= glyph.start;
      const row = index < perRow ? 0 : 1;
      const col = index % perRow;
      const baseX = w * 0.5 + (col - (perRow - 1) / 2) * size * 1.12;
      const baseY = row === 0 ? h * 0.42 : h * 0.62;

      // 斩裂后，上排往左上错位，下排往右下错位
      const offsetX = isSlashed ? (row === 0 ? -splitDistance : splitDistance) : 0;
      const offsetY = isSlashed ? (row === 0 ? -splitDistance * 0.6 : splitDistance * 0.6) : 0;
      const rot = isSlashed ? (seed(index * 7) - 0.5) * 0.35 * clamp(slashAge / 0.4) : 0;

      ink(f, glyph.char, baseX + offsetX, baseY + offsetY, size, {
        alpha: spoken ? 1 : 0.25,
        color: isSlashed && index >= n - 2 ? RED : spoken ? f.cue.palette.ink : f.cue.palette.muted,
        rotate: rot,
        weight: 900,
        glow: isSlashed ? RED : undefined,
        glowBlur: isSlashed ? 10 : 0,
      });
    });

    // 3. 喷溅红墨水滴碎片
    if (isSlashed && !f.reduced) {
      for (let i = 0; i < 18; i += 1) {
        const p = i / 18;
        const drift = slashAge * u * (0.2 + seed(i * 9) * 0.4);
        const sx = lerp(cutStart[0], cutEnd[0], p) + (seed(i * 13) - 0.5) * drift;
        const sy = lerp(cutStart[1], cutEnd[1], p) + (seed(i * 17) - 0.5) * drift;
        ink(f, "▲", sx, sy, u * (0.01 + seed(i) * 0.02), {
          color: RED,
          alpha: clamp(1 - slashAge / 0.8) * 0.8,
          rotate: slashAge * 5 + i,
        });
      }
    }
  } else if (variant === 1) {
    // 【碎片在闪现】频闪记忆切片
    const flash = f.reduced ? 1 : Math.sin(f.time * 16) > 0 ? 1 : 0.25;
    const size = Math.min(u * 0.12, (w * 0.8) / n);
    f.glyphs.forEach((glyph, index) => {
      const shiftX = (seed(index + Math.floor(f.time * 8)) - 0.5) * u * 0.03;
      const shiftY = (seed(index * 3 + Math.floor(f.time * 8)) - 0.5) * u * 0.03;
      ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.1 + shiftX, h * 0.5 + shiftY, size, {
        alpha: revealAt(f, glyph.start) * flash,
        color: index % 2 === 0 ? RED : BONE,
        weight: 900,
      });
    });
  } else {
    // 【后来存在回忆的碎片】轻柔飘散的纸页碎片
    const size = Math.min(u * 0.08, (w * 0.84) / n);
    f.glyphs.forEach((glyph, index) => {
      const floatY = f.reduced ? 0 : Math.sin(f.motion * 1.6 + index * 0.6) * u * 0.025;
      ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.1, h * 0.5 + floatY, size, {
        alpha: revealAt(f, glyph.start) * 0.9,
        color: f.cue.palette.ink,
        rotate: f.reduced ? 0 : Math.sin(f.motion + index) * 0.15,
      });
    });
  }
}

/** 空荡荡像场梦的房间 / 那么我的一切 */
function room(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.5;

  // 1. 3D 旋转透视线框立方体（空房间）
  const rot = f.reduced ? 0.2 : f.motion * 0.25;
  const cubeSize = u * 0.55;

  // 房间 8 个顶点透视变换
  const corners = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // 后墙
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1], // 前墙
  ].map(([x, y, z]) => {
    // Y轴旋转
    const rx = x * Math.cos(rot) - z * Math.sin(rot);
    const rz = x * Math.sin(rot) + z * Math.cos(rot) + 2.4;
    return [cx + (rx / rz) * cubeSize * 1.5, cy + (y / rz) * cubeSize * 1.5];
  });

  // 绘制房间骨架边框
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // 后框
    [4, 5], [5, 6], [6, 7], [7, 4], // 前框
    [0, 4], [1, 5], [2, 6], [3, 7], // 连接边
  ];
  edges.forEach(([a, b]) => {
    hairline(f, [corners[a], corners[b]], f.cue.palette.muted, 0.3, 1.5);
  });

  // 2. 房间中央投影字样
  ink(f, "空 荡 荡", cx, cy - u * 0.05, u * 0.16, {
    color: f.cue.palette.muted,
    alpha: 0.14,
    weight: 900,
  });

  // 3. 悬浮在三维空间内部的歌词
  const n = f.glyphs.length;
  const size = Math.min(u * 0.075, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    const enter = f.reduced ? 1 : backOut(clamp((f.time - glyph.start) / 0.25));
    const float = f.reduced ? 0 : Math.sin(f.motion * 2 + index * 0.5) * u * 0.015;

    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.65 + float - (1 - enter) * u * 0.04, size * (active ? 1.2 : 1), {
      alpha: spoken ? 1 : 0.2,
      color: active ? f.cue.palette.accent : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
    });
  });

}

/** 窗外晚霞迸发的诗篇 */
function windowPane(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.44;

  // 1. 窗外晚霞放射状光芒爆炸 (迸发诗篇)
  const burstProgress = f.reduced ? 1 : clamp((f.time - f.cue.start) / 0.8);
  const rays = 18;
  for (let r = 0; r < rays; r += 1) {
    const angle = (r / rays) * TAU + (f.reduced ? 0 : f.motion * 0.05);
    const rayLen = u * 0.65 * burstProgress;
    hairline(f, [[cx, cy], [cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen]], AMBER, 0.22, 2);

    // 沿光芒迸发的诗歌碎字
    const p = wrap(r / rays + (f.reduced ? 0.5 : f.motion * 0.1), 1);
    const glyph = cycled(f, r);
    ink(f, glyph.char, cx + Math.cos(angle) * rayLen * p, cy + Math.sin(angle) * rayLen * p, u * 0.022, {
      color: AMBER,
      alpha: (1 - p) * 0.7 * burstProgress,
    });
  }

  // 2. 窗格十字框架遮罩
  const frameW = u * 0.68;
  const frameH = u * 0.54;
  hairline(f, [[cx - frameW * 0.5, cy - frameH * 0.5], [cx + frameW * 0.5, cy - frameH * 0.5], [cx + frameW * 0.5, cy + frameH * 0.5], [cx - frameW * 0.5, cy + frameH * 0.5], [cx - frameW * 0.5, cy - frameH * 0.5]], f.cue.palette.ink, 0.45, 2.5);
  hairline(f, [[cx, cy - frameH * 0.5], [cx, cy + frameH * 0.5]], f.cue.palette.ink, 0.4, 2);
  hairline(f, [[cx - frameW * 0.5, cy], [cx + frameW * 0.5, cy]], f.cue.palette.ink, 0.4, 2);

  // 3. 前景晚霞诗篇排版
  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.78, size * (active ? 1.25 : 1), {
      alpha: spoken ? 1 : 0.2,
      color: active ? AMBER : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
      glow: active ? AMBER : undefined,
      glowBlur: active ? 16 : 0,
    });
  });
}

/** 咖啡液搅进厚重镜片 / 主观太纷扰 / 轮回中感受 */
function spiral(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.48;
  const variant = f.cue.variant;

  // 漩涡旋涡旋转动画
  const speed = f.reduced ? 0.3 : f.motion * (variant === 2 ? 1.4 : 1.1);
  const arms = variant === 1 ? 3 : 2;
  const pointsPerArm = 48;

  for (let a = 0; a < arms; a += 1) {
    const armOffset = (a * TAU) / arms;
    for (let p = 1; p <= pointsPerArm; p += 1) {
      const frac = p / pointsPerArm;
      const angle = frac * TAU * 2.5 + speed * (a % 2 === 0 ? 1 : -1) + armOffset;
      const radius = u * (0.04 + Math.pow(frac, 1.2) * 0.46);
      const glyph = cycled(f, a * pointsPerArm + p);

      const px = cx + Math.cos(angle) * radius * 1.15;
      const py = cy + Math.sin(angle) * radius * 0.9;
      ink(f, glyph.char, px, py, u * (0.012 + frac * 0.022), {
        alpha: (0.15 + frac * 0.6) * revealAt(f, glyph.start),
        color: frac > 0.75 ? f.cue.palette.accent : f.cue.palette.ink,
        rotate: angle + Math.PI / 2,
      });
    }
  }

  // 漩涡中心主文字
  const focusSize = u * 0.09;
  ink(f, f.cue.focus, cx, cy, focusSize, {
    color: f.cue.palette.accent,
    weight: 900,
    glow: f.cue.palette.accent,
    glowBlur: 16,
  });
}

/** 都罐装冷凝成怀念 */
function bottle(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.46;
  const bW = u * 0.42;
  const bH = u * 0.68;

  // 1. 瓶身外形绘制
  const topY = cy - bH * 0.5;
  const neckY = cy - bH * 0.32;
  const botY = cy + bH * 0.5;
  const neckW = bW * 0.35;

  hairline(f, [
    [cx - neckW * 0.5, topY], [cx + neckW * 0.5, topY],
    [cx + neckW * 0.5, neckY], [cx + bW * 0.5, neckY + u * 0.06],
    [cx + bW * 0.5, botY], [cx - bW * 0.5, botY],
    [cx - bW * 0.5, neckY + u * 0.06], [cx - neckW * 0.5, neckY],
    [cx - neckW * 0.5, topY],
  ], f.cue.palette.ink, 0.4, 2);

  // 2. 字符冷凝成液滴垂直掉入瓶中
  const dropProgress = f.reduced ? 0.6 : smooth(clamp((f.time - f.cue.start) / 1.5));
  const liquidLevel = botY - dropProgress * bH * 0.55;

  hairline(f, [[cx - bW * 0.48, liquidLevel], [cx + bW * 0.48, liquidLevel]], f.cue.palette.accent, 0.8, 2);

  // 瓶内液体晃动文字
  for (let i = 0; i < 16; i += 1) {
    const glyph = cycled(f, i);
    const slosh = f.reduced ? 0 : Math.sin(f.motion * 2.5 + i) * u * 0.012;
    const ly = lerp(liquidLevel + u * 0.03, botY - u * 0.03, i / 16);
    ink(f, glyph.char, cx + (seed(i * 7) - 0.5) * bW * 0.75, ly + slosh, u * 0.024, {
      color: i % 3 === 0 ? f.cue.palette.accent : WATER,
      alpha: 0.75,
    });
  }

  // 3. 底部“怀念”核心文字
  ink(f, "怀 念", cx, h * 0.86, u * 0.09, {
    color: f.cue.palette.accent,
    weight: 900,
    glow: f.cue.palette.accent,
    glowBlur: 14,
  });
}

/** 当又一次被人群遗忘 / 大概我也没什么特别 */
function crowd(f: Frame) {
  const { w, h, u } = f;
  const isSpecial = f.cue.variant === 1;
  const cx = w * 0.5;
  const cy = h * 0.5;

  // 1. 背景人群点阵穿流虚影
  const rows = 7;
  const cols = 15;
  const crowdSpeed = f.reduced ? 0 : f.motion * 0.35;
  for (let r = 0; r < rows; r += 1) {
    const rowY = h * (0.18 + (r / rows) * 0.68);
    const dir = r % 2 === 0 ? 1 : -1;
    for (let c = 0; c < cols; c += 1) {
      const p = wrap(c / cols + crowdSpeed * dir * 0.2, 1);
      const px = p * w;
      const isCenter = Math.hypot(px - cx, rowY - cy) < u * 0.18;
      if (isCenter) continue; // 留出中心孤独聚焦区

      ink(f, isSpecial ? "人" : "群", px, rowY, u * 0.025, {
        color: f.cue.palette.muted,
        alpha: 0.12 + seed(r * cols + c) * 0.18,
      });
    }
  }

  // 2. 中心聚光灯与孤独的“我”
  const spotPulse = f.reduced ? 0.7 : Math.sin(f.motion * 3) * 0.15 + 0.85;
  ctxSave(f, () => {
    f.ctx.strokeStyle = RED;
    f.ctx.lineWidth = 1.5;
    f.ctx.globalAlpha = 0.35 * spotPulse;
    f.ctx.beginPath();
    f.ctx.arc(cx, cy, u * 0.14, 0, TAU);
    f.ctx.stroke();
  });

  ink(f, "我", cx, cy, u * 0.15, {
    color: RED,
    weight: 900,
    glow: RED,
    glowBlur: 18,
  });

  // 3. 底部完整歌词
  const n = f.glyphs.length;
  const size = Math.min(u * 0.068, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.78, size * (active ? 1.2 : 1), {
      alpha: spoken ? 1 : 0.2,
      color: active ? RED : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
    });
  });
}

/** 也不见得有多哀伤 / 就为我而独自安静 / 也不见得有多肮脏 */
function quiet(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.5;

  // 极简日系禅意水波排版：一条水平细弦与水波涟漪
  const ripple = f.reduced ? 0.5 : (f.motion * 0.4) % 1;
  ctxSave(f, () => {
    f.ctx.strokeStyle = f.cue.palette.muted;
    f.ctx.lineWidth = 1;
    f.ctx.globalAlpha = (1 - ripple) * 0.35;
    f.ctx.beginPath();
    f.ctx.arc(cx, cy, ripple * u * 0.45, 0, TAU);
    f.ctx.stroke();
  });

  hairline(f, [[w * 0.1, cy], [w * 0.9, cy]], f.cue.palette.muted, 0.25);

  // 字符挂在弦上轻柔微摆
  const n = f.glyphs.length;
  const size = Math.min(u * 0.075, (w * 0.8) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    const sway = f.reduced ? 0 : Math.sin(f.motion * 1.2 + index * 0.4) * u * 0.015;
    const x = w * 0.5 + (index - (n - 1) / 2) * size * 1.1;

    hairline(f, [[x, cy], [x, cy + size * 0.6 + sway]], f.cue.palette.muted, 0.2);
    ink(f, glyph.char, x, cy + size * 0.9 + sway, size * (active ? 1.2 : 1), {
      alpha: spoken ? 0.95 : 0.18,
      color: active ? f.cue.palette.accent : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 700,
    });
  });
}

/** 带我走吧 */
function escape(f: Frame) {
  const { w, h, u } = f;
  // 超音速向右上弹射突破！
  speedLines(f, 32, "left", f.cue.palette.accent, 0.6);

  const n = f.glyphs.length;
  const size = Math.min(u * 0.14, (w * 0.8) / n);
  const launchAge = f.reduced ? 0 : Math.max(0, f.time - f.cue.start);
  const thrustX = launchAge * u * 0.4;
  const thrustY = -launchAge * u * 0.25;

  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const baseX = w * 0.5 + (index - (n - 1) / 2) * size * 1.12 + thrustX;
    const baseY = h * 0.52 + thrustY;

    // 尾焰拖影
    if (!f.reduced && launchAge > 0.05) {
      for (let tr = 1; tr <= 3; tr += 1) {
        ink(f, glyph.char, baseX - tr * u * 0.03, baseY + tr * u * 0.018, size, {
          alpha: 0.15 / tr,
          color: RED,
        });
      }
    }

    ink(f, glyph.char, baseX, baseY, size, {
      alpha: spoken ? 1 : 0.25,
      color: index >= 2 ? RED : BONE,
      weight: 900,
      glow: RED,
      glowBlur: 16,
    });
  });
}

// ===========================================================================
// ACT II: CLOSED NERVOUS SYSTEM (心跳、大脑、笼外、无线电、奔跑、倒数、理想、乌托邦)
// ===========================================================================

/** 切断视觉网不规则心跳 */
function pulse(f: Frame) {
  const { w, h, u } = f;
  const cutTime = atChar(f, "切");
  const isCut = f.time >= cutTime;
  const cutAge = f.reduced ? 1 : Math.max(0, f.time - cutTime);

  // 1. 荧光心电图示波网格与跳动波形
  const baseline = h * 0.5;
  hairline(f, [[0, baseline], [w, baseline]], RED, 0.2);

  const samples = 90;
  const ecgPts: number[][] = [];
  for (let i = 0; i <= samples; i += 1) {
    const px = (i / samples) * w;
    let spike = 0;
    // 心电图 P-Q-R-S-T 波形生成
    const beatPhase = wrap((px / w) * 3 - (f.reduced ? 0 : f.motion * 2.8), 1);
    if (!isCut || px < w * 0.6) {
      if (beatPhase > 0.4 && beatPhase < 0.46) spike = -u * 0.06; // Q
      else if (beatPhase >= 0.46 && beatPhase < 0.52) spike = u * 0.28; // R peak
      else if (beatPhase >= 0.52 && beatPhase < 0.58) spike = -u * 0.1; // S
      else if (beatPhase >= 0.65 && beatPhase < 0.78) spike = u * 0.05; // T
    } else if (isCut) {
      // 切断后的心电杂音平线
      spike = (seed(i * 7 + Math.floor(f.time * 24)) - 0.5) * u * 0.015;
    }
    ecgPts.push([px, baseline - spike]);
  }
  hairline(f, ecgPts, RED, 0.85, 2.5);

  // 2. 切断电弧电火花
  if (isCut && !f.reduced && cutAge < 0.5) {
    drawSlashCut(f, w * 0.58, baseline - u * 0.25, w * 0.62, baseline + u * 0.25, cutAge * 3, RED);
  }

  // 3. 巨型主文字震撼排版
  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.78, size * (active ? 1.25 : 1), {
      alpha: spoken ? 1 : 0.25,
      color: active ? RED : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
      glow: active ? RED : undefined,
      glowBlur: active ? 16 : 0,
    });
  });

  ink(f, "BPM: 138 [IRREGULAR]", w * 0.82, h * 0.18, u * 0.024, { color: RED, mono: true, alpha: 0.8 });
}

/** 所谓孤独只存活于大脑 */
function brain(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.44;

  // 1. 高精像素神经网络大脑轮廓
  const brainPts = sampleMotif("brain", 44, 28);
  const spanX = u * 0.76;
  const spanY = u * 0.62;

  // 突触放电脉冲
  const pulseNode = Math.floor((f.time * 6) % brainPts.length);
  paintMask(f, f.glyphs, brainPts, (pt, _glyph, idx) => {
    const isFiring = Math.abs(idx - pulseNode) < 4;
    return {
      x: cx + pt.x * spanX * 0.5,
      y: cy + pt.y * spanY * 0.5,
      size: u * 0.016,
      alpha: isFiring ? 1 : 0.35 + seed(idx) * 0.3,
      color: isFiring ? RED : pt.rank % 6 === 0 ? WATER : BONE,
    };
  });

  // 2. 神经电波文字排版
  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.82, size * (active ? 1.2 : 1), {
      alpha: spoken ? 1 : 0.2,
      color: active ? RED : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
    });
  });
}

/** 急需耳机线输液给心脏 / 麻木的爱上 / 昧着心到无力去抱怨 */
function heart(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.48;
  const isCabled = f.cue.variant === 0;

  // 1. 耳机线输液管：从顶部垂下，注入心脏
  if (isCabled) {
    drawHeadphoneCableFlow(f, w * 0.12, 0, cx - u * 0.1, cy - u * 0.15, 2.2, RED);
    ink(f, "3.5mm AUDIO INFUSION", w * 0.14, h * 0.1, u * 0.02, { color: AMBER, mono: true, alpha: 0.85 });
  }

  // 2. 巨型像素心脏：两段式节律搏动 (lub-dub)
  const beat = f.reduced ? 1 : 1 + Math.pow(Math.max(0, Math.sin(f.motion * 6.2)), 5) * 0.18;
  const heartPts = sampleMotif("heart", 36, 30);
  const span = u * 0.58 * beat;

  paintMask(f, f.glyphs, heartPts, (pt, _glyph, idx) => {
    const isCore = Math.hypot(pt.x, pt.y) < 0.4;

    return {
      x: cx + pt.x * span * 0.5,
      y: cy + pt.y * span * 0.5,
      size: u * 0.017 * beat,
      alpha: 0.4 + seed(idx) * 0.55,
      color: isCore ? RED : pt.rank % 3 === 0 ? AMBER : BONE,
    };
  });

  // 3. 歌词呈现
  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.84, size * (active ? 1.25 : 1), {
      alpha: spoken ? 1 : 0.2,
      color: active ? RED : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
      glow: active ? RED : undefined,
      glowBlur: active ? 16 : 0,
    });
  });
}

/** 笼外玻璃反射的夕阳光 */
function cage(f: Frame) {
  const { w, h, u } = f;

  // 1. 背景金黄夕阳光晕
  const duskGrad = f.ctx.createLinearGradient(0, 0, 0, h);
  duskGrad.addColorStop(0, "rgba(215, 167, 109, 0.35)");
  duskGrad.addColorStop(1, "rgba(230, 59, 50, 0.1)");
  f.ctx.fillStyle = duskGrad;
  f.ctx.fillRect(0, 0, w, h);

  // 2. 前景冰冷坚硬的牢笼铁栏
  const bars = 9;
  for (let b = 0; b <= bars; b += 1) {
    const bx = w * (0.1 + (b / bars) * 0.8);
    hairline(f, [[bx, 0], [bx, h]], BONE, 0.35, 4);
    hairline(f, [[bx + 1, 0], [bx + 1, h]], "#000000", 0.5, 2);
  }

  // 3. 栏后歌词反光
  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.5, size * (active ? 1.2 : 1), {
      alpha: spoken ? 0.95 : 0.25,
      color: active ? AMBER : spoken ? BONE : f.cue.palette.muted,
      weight: 900,
    });
  });
}

/** 无线电波剪影 / 叩击生命体的讯号 */
function signal(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.45;

  // 1. 同心雷达辐射电波
  const rings = 6;
  for (let r = 1; r <= rings; r += 1) {
    const progress = wrap(r / rings + (f.reduced ? 0.4 : f.motion * 0.35), 1);
    const radius = progress * u * 0.58;
    ctxSave(f, () => {
      f.ctx.strokeStyle = WATER;
      f.ctx.lineWidth = 1.5;
      f.ctx.globalAlpha = (1 - progress) * 0.55;
      f.ctx.beginPath();
      f.ctx.arc(cx, cy, radius, 0, TAU);
      f.ctx.stroke();
    });
  }

  // 2. 摩斯密码流
  const morse = "··· ——— ··· [EPHEIA CALLING]";
  ink(f, morse, cx, h * 0.16, u * 0.024, { color: WATER, mono: true, alpha: 0.85 });

  // 3. 歌词
  const n = f.glyphs.length;
  const size = Math.min(u * 0.085, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.78, size * (active ? 1.2 : 1), {
      alpha: spoken ? 1 : 0.2,
      color: active ? WATER : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
      glow: active ? WATER : undefined,
      glowBlur: active ? 14 : 0,
    });
  });
}

/** 无意义奔跑 */
function run(f: Frame) {
  const { w, h, u } = f;
  // 地面沥青倒退速度线
  speedLines(f, 36, "down", f.cue.palette.ink, 0.5);

  const n = f.glyphs.length;
  const size = Math.min(u * 0.15, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const stride = f.reduced ? 0 : Math.sin(f.motion * 8 + index * 1.2) * u * 0.03;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.1, h * 0.5 + stride, size, {
      alpha: spoken ? 1 : 0.3,
      color: spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
      rotate: f.reduced ? 0 : 0.08,
    });
  });
}

/** 记录倒数期待控制大脑 */
function countdown(f: Frame) {
  const { w, h, u } = f;
  const remaining = Math.max(0, Math.ceil(f.cue.end - f.time));
  const flash = f.reduced ? 1 : 1 - ((f.time * 2) % 1);

  // 巨型数码管 03 / 02 / 01 倒计时
  ink(f, `0${remaining}`, w * 0.5, h * 0.44, u * 0.32, {
    color: RED,
    mono: true,
    weight: 900,
    alpha: 0.85 * flash,
    glow: RED,
    glowBlur: 24,
  });

  ink(f, "OVERRIDE PROTOCOL // T-MINUS", w * 0.5, h * 0.18, u * 0.024, { color: RED, mono: true, alpha: 0.8 });

  // 歌词
  const n = f.glyphs.length;
  const size = Math.min(u * 0.078, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.78, size, {
      alpha: spoken ? 1 : 0.25,
      color: spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
    });
  });
}

/** 所谓理想主义者 / 针管笔做伴 / 他的文字总是标准答案 / 凝练成议论文的字眼 / 佐证她所说曾经的骄傲 */
function typeset(f: Frame) {
  const { w, h, u } = f;
  const n = f.glyphs.length;
  const size = Math.min(u * 0.09, (w * 0.85) / n);

  // 瑞士编辑排版网格背景
  for (let l = 0; l < 4; l += 1) {
    hairline(f, [[w * 0.08, h * (0.3 + l * 0.14)], [w * 0.92, h * (0.3 + l * 0.14)]], f.cue.palette.muted, 0.2);
  }

  // 逐字打字机敲击效果
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    const enter = f.reduced ? 1 : backOut(clamp((f.time - glyph.start) / 0.2));
    const x = w * 0.5 + (index - (n - 1) / 2) * size * 1.08;
    const y = h * 0.52 - (1 - enter) * u * 0.04;

    ink(f, glyph.char, x, y, size * (active ? 1.2 : 1), {
      alpha: spoken ? 1 : 0.15,
      color: active ? RED : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
    });
  });

  // 红笔打勾审阅印章
  ink(f, "✓ 评定合格", w * 0.82, h * 0.32, u * 0.03, { color: RED, weight: 700, alpha: 0.85 });
}

/** 构建我的乌托邦 / 不切实际的构想 / 空想世界永存 */
function city(f: Frame) {
  const { w, h, u } = f;
  const columns = 18;
  const baseY = h * 0.82;
  const colW = w / columns;

  // 赛博摩天楼排版都市
  for (let c = 0; c < columns; c += 1) {
    const floors = 4 + Math.floor(seed(c * 11) * 9);
    const towerH = floors * u * 0.045;
    const tx = c * colW + colW * 0.5;

    // 楼体方块
    ctxSave(f, () => {
      f.ctx.strokeStyle = WATER;
      f.ctx.lineWidth = 1;
      f.ctx.globalAlpha = 0.25;
      f.ctx.strokeRect(tx - colW * 0.45, baseY - towerH, colW * 0.9, towerH);
    });

    // 楼层亮灯窗口与字符
    for (let fl = 0; fl < floors; fl += 1) {
      const isLit = seed(c * 17 + fl) > 0.4;
      if (isLit) {
        ink(f, "■", tx, baseY - fl * u * 0.045 - u * 0.02, u * 0.016, {
          color: WATER,
          alpha: 0.45,
        });
      }
    }
  }

  // 浮空核心歌词
  const n = f.glyphs.length;
  const size = Math.min(u * 0.088, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.38, size * (active ? 1.25 : 1), {
      alpha: spoken ? 1 : 0.2,
      color: active ? WATER : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
      glow: active ? WATER : undefined,
      glowBlur: active ? 16 : 0,
    });
  });
}

/** 他们眼神早就充斥嘲笑 / 闭上眼睛吧 */
function eye(f: Frame) {
  const { w, h, u } = f;
  const cy = h * 0.5;
  const isClosing = f.cue.variant === 1;


  if (isClosing) {
    // 【闭上眼睛吧】巨幅眼帘上下闭合落幕
    const shut = f.reduced ? 0.3 : clamp((f.time - f.cue.start) / 1.1);
    ctxSave(f, () => {
      f.ctx.fillStyle = BLACK;
      f.ctx.fillRect(0, 0, w, h * 0.5 * shut);
      f.ctx.fillRect(0, h - h * 0.5 * shut, w, h * 0.5 * shut);
    });
    hairline(f, [[0, h * 0.5 * shut], [w, h * 0.5 * shut]], RED, 0.6, 2);
    hairline(f, [[0, h - h * 0.5 * shut], [w, h - h * 0.5 * shut]], RED, 0.6, 2);
  } else {
    // 【充斥嘲笑】多重监视之眼从黑暗中睁开
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (r === 1 && c === 1) continue; // 留出中心
        const ex = w * (0.2 + c * 0.3);
        const ey = h * (0.24 + r * 0.26);
        ink(f, "◎", ex, ey, u * 0.065, { color: RED, alpha: 0.45 });
      }
    }
  }

  // 歌词
  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, cy, size * (active ? 1.2 : 1), {
      alpha: spoken ? 1 : 0.2,
      color: active ? RED : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
    });
  });
}

/** 脑中枢发烫 */
function heat(f: Frame) {
  const { w, h, u } = f;
  // 全屏红色过热热浪与警告
  const shimmer = f.reduced ? 0 : Math.sin(f.motion * 8) * u * 0.015;
  ink(f, "TEMPERATURE CRITICAL // 42.5°C", w * 0.5, h * 0.22, u * 0.024, { color: RED, mono: true, alpha: 0.9 });

  const n = f.glyphs.length;
  const size = Math.min(u * 0.14, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.1, h * 0.52 + shimmer, size, {
      alpha: spoken ? 1 : 0.3,
      color: RED,
      weight: 900,
      glow: RED,
      glowBlur: 20,
    });
  });
}

// ===========================================================================
// ACT III: FRAGMENTED DRIFT (回忆、安眠、筛掉、微光点亮)
// ===========================================================================

/** 理想主义者的安眠 / 天也不会睡醒 */
function sleep(f: Frame) {
  const { w, h, u } = f;
  // 静谧深蓝星空与漂浮文字
  for (let s = 0; s < 24; s += 1) {
    const twinkle = f.reduced ? 0.5 : Math.sin(f.motion * 2 + s) * 0.3 + 0.5;
    ink(f, "·", w * seed(s * 11), h * seed(s * 17), u * 0.02, { color: WATER, alpha: twinkle * 0.6 });
  }

  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const floatY = f.reduced ? 0 : Math.sin(f.motion * 1.4 + index * 0.5) * u * 0.02;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.55 + floatY, size, {
      alpha: spoken ? 0.9 : 0.2,
      color: spoken ? WATER : f.cue.palette.muted,
      weight: 700,
    });
  });
}

/** 忘记沉默没停 / 把墙和座右铭通通赶走 */
function erase(f: Frame) {
  const { w, h, u } = f;
  const isWall = f.cue.variant === 1;

  if (isWall) {
    // 【把墙和座右铭通通赶走】冲击波震碎两侧巨墙
    const shock = f.reduced ? 1 : clamp((f.time - f.cue.start) / 0.7);
    const wallDisplace = easeOut(shock) * w * 0.45;

    ink(f, "墙", w * 0.12 - wallDisplace, h * 0.5, u * 0.25, { color: f.cue.palette.muted, alpha: 0.6 });
    ink(f, "墙", w * 0.88 + wallDisplace, h * 0.5, u * 0.25, { color: f.cue.palette.muted, alpha: 0.6 });
  } else {
    // 激光雨刷擦除画面
    const sweep = f.reduced ? w * 0.5 : ((f.motion * 0.6) % 1) * w;
    hairline(f, [[sweep, 0], [sweep, h]], RED, 0.7, 2);
  }

  // 歌词
  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.52, size, {
      alpha: spoken ? 1 : 0.2,
      color: spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
    });
  });
}

/** 当成为被筛掉的废料 */
function sieve(f: Frame) {
  const { w, h, u } = f;
  const cy = h * 0.52;

  // 筛网水平过滤网格
  hairline(f, [[w * 0.08, cy], [w * 0.92, cy]], f.cue.palette.muted, 0.4, 2);
  for (let k = 0; k < 20; k += 1) {
    const kx = w * (0.1 + (k / 20) * 0.8);
    hairline(f, [[kx, cy - u * 0.04], [kx, cy + u * 0.04]], f.cue.palette.muted, 0.3, 1);
  }

  // 字符穿过筛网过滤下坠
  const n = f.glyphs.length;
  const size = Math.min(u * 0.075, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const passes = index % 2 === 1;
    const fallY = passes ? cy + u * 0.24 : cy - u * 0.06;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, fallY, size, {
      alpha: revealAt(f, glyph.start),
      color: passes ? f.cue.palette.muted : f.cue.palette.ink,
      weight: passes ? 500 : 900,
    });
  });
}

/** 贪欢手心无人打扰的微光 / 也能将太暗的夜晚点亮 */
function light(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.45;
  const isBright = f.cue.variant === 1;

  // 掌心微光与全屏爆发亮起
  const power = isBright ? (f.reduced ? 1 : clamp((f.time - f.cue.start) / 0.8)) : 0.35;
  ctxSave(f, () => {
    const glow = f.ctx.createRadialGradient(cx, cy, 0, cx, cy, u * (0.2 + power * 0.8));
    glow.addColorStop(0, "rgba(255, 230, 180, 0.95)");
    glow.addColorStop(0.4, "rgba(215, 167, 109, 0.45)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    f.ctx.fillStyle = glow;
    f.ctx.fillRect(0, 0, w, h);
  });

  // 歌词
  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.78, size, {
      alpha: spoken ? 1 : 0.25,
      color: spoken ? (isBright ? "#ffffff" : AMBER) : f.cue.palette.muted,
      weight: 900,
      glow: AMBER,
      glowBlur: 14,
    });
  });
}

// ===========================================================================
// ACT IV: TERMINAL FREEFALL (秒针、呼吸、茧、标准答案、交换晚餐、自由落体、重力加速度一无所有)
// ===========================================================================

/** 秒针计生活 */
function clock(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.46;
  const radius = u * 0.32;

  // 巨大机械表盘外圈刻度
  ctxSave(f, () => {
    f.ctx.strokeStyle = f.cue.palette.ink;
    f.ctx.lineWidth = 2;
    f.ctx.globalAlpha = 0.3;
    f.ctx.beginPath();
    f.ctx.arc(cx, cy, radius, 0, TAU);
    f.ctx.stroke();
  });

  // 秒针扫射雷达刀刃
  const secAngle = -Math.PI / 2 + ((f.time % 60) / 60) * TAU;
  hairline(f, [[cx, cy], [cx + Math.cos(secAngle) * radius, cy + Math.sin(secAngle) * radius]], RED, 0.95, 2.5);

  // 歌词
  const n = f.glyphs.length;
  const size = Math.min(u * 0.12, (w * 0.8) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.12, h * 0.82, size, {
      alpha: spoken ? 1 : 0.2,
      color: spoken ? RED : f.cue.palette.muted,
      weight: 900,
    });
  });
}

/** 呼吸频率追不上的缺憾 */
function breath(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.45;

  // 呼吸急促膨胀与收缩圈
  const breathCycle = f.reduced ? 1 : Math.sin(f.motion * 4) * 0.25 + 1;
  ctxSave(f, () => {
    f.ctx.strokeStyle = RED;
    f.ctx.lineWidth = 2;
    f.ctx.globalAlpha = 0.45;
    f.ctx.beginPath();
    f.ctx.arc(cx, cy, u * 0.26 * breathCycle, 0, TAU);
    f.ctx.stroke();
  });

  const n = f.glyphs.length;
  const size = Math.min(u * 0.075, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.8, size, {
      alpha: spoken ? 1 : 0.2,
      color: spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
    });
  });
}

/** 字迹烙的茧 / 随中指侧皮肤一同溃烂 */
function scar(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.46;

  // 指尖指纹同心漩涡
  for (let ring = 1; ring <= 5; ring += 1) {
    const r = ring * u * 0.05;
    ctxSave(f, () => {
      f.ctx.strokeStyle = RED;
      f.ctx.lineWidth = 1.2;
      f.ctx.globalAlpha = 0.35;
      f.ctx.beginPath();
      f.ctx.arc(cx, cy, r, 0, TAU);
      f.ctx.stroke();
    });
  }

  // 歌词
  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.8, size, {
      alpha: spoken ? 1 : 0.2,
      color: spoken ? RED : f.cue.palette.muted,
      weight: 900,
    });
  });
}

/** 我的自以为是 / 可否拿来交换晚餐 / 是否还有存在的理由 */
function question(f: Frame) {
  const { w, h, u } = f;
  const cx = w * 0.5;
  const cy = h * 0.44;

  // 巨大疑问号问号天平
  ink(f, "？", cx, cy, u * 0.36, {
    color: f.cue.palette.muted,
    alpha: 0.25,
    weight: 900,
  });

  const n = f.glyphs.length;
  const size = Math.min(u * 0.08, (w * 0.85) / n);
  f.glyphs.forEach((glyph, index) => {
    const spoken = f.time >= glyph.start;
    const active = spoken && f.time <= glyph.end + 0.12;
    ink(f, glyph.char, w * 0.5 + (index - (n - 1) / 2) * size * 1.08, h * 0.78, size * (active ? 1.2 : 1), {
      alpha: spoken ? 1 : 0.2,
      color: active ? RED : spoken ? f.cue.palette.ink : f.cue.palette.muted,
      weight: 900,
    });
  });
}

/**
 * 自由落体（核心动画场景！）
 * Variant 0 (Line 52): 一万次自由落体的阵痛
 * Variant 1 (Line 57): 就随着重力加速度 一无所有 (用户需求标杆重点：从上往下竖着掉下去！)
 */
function fall(f: Frame) {
  const { w, h, u } = f;
  const n = f.glyphs.length;
  const variant = f.cue.variant;

  if (variant === 0) {
    // 【一万次自由落体的阵痛】：极速电梯失重穿梭！
    speedLines(f, 36, "up", RED, 0.75);

    // 落地冲击波振幅
    const cycle = 1.2;
    const phase = (f.time % cycle) / cycle;
    const dropY = easeIn(phase) * h * 0.75;

    f.glyphs.forEach((glyph, index) => {
      const x = w * 0.5 + (index - (n - 1) / 2) * u * 0.08;
      ink(f, glyph.char, x, dropY, u * 0.085, {
        color: RED,
        weight: 900,
        glow: RED,
        glowBlur: 14,
      });
    });

    ink(f, "LOOP: ×10,000 FREEFALL", w * 0.5, h * 0.15, u * 0.024, { color: RED, mono: true, alpha: 0.85 });
    return;
  }

  // =========================================================================
  // 【就随着重力加速度 一无所有】（终局高潮：从上往下竖着掉下去，物理重力加速度自由落体！）
  // =========================================================================
  const t = f.time - f.cue.start;

  // 1. 全速向上狂飙的高速下坠速度线（衬托垂直向下暴跌）

  speedLines(f, 54, "up", BONE, 0.85);

  // 2. 物理重力加速度常数与初速度计算
  // y = y0 + 0.5 * g * dt^2
  const g = u * 4.2; // 像素重力加速度
  const freefallStart = 0.45; // 演唱到“重力加速度”时刻启动下坠
  const dt = Math.max(0, t - freefallStart);
  const velocity = g * dt; // v = gt
  const distY = 0.5 * g * dt * dt;

  // 3. 右上角高精度测速雷达仪表盘 (显示真实重力加速度与终端速度)
  const currentSpeed = (velocity / u * 9.8).toFixed(1);
  ink(f, `GRAVITY: 9.80 m/s² · VELOCITY: ${currentSpeed} m/s`, w * 0.78, h * 0.12, u * 0.02, {
    color: RED,
    mono: true,
    alpha: 0.9,
  });
  ink(f, "TERMINAL FREEFALL // ACCELERATING", w * 0.78, h * 0.15, u * 0.016, {
    color: f.cue.palette.muted,
    mono: true,
    alpha: 0.7,
  });

  // 4. 文字呈现：从水平展开 -> 垂直竖直锁定 -> 垂直重力加速度狂暴下坠！
  const charSize = Math.min(u * 0.11, (h * 0.75) / n);
  const charSpacing = charSize * 1.12;
  const isVertical = t > 0.2; // 迅速收拢为垂直一纵列
  const startTopY = isVertical ? -charSpacing * n : h * 0.45;

  // 下坠基准 Y 坐标
  const curTopY = startTopY + distY;

  // 逐字垂直绘制并携带速度残影
  f.glyphs.forEach((glyph, index) => {
    // 字符逐一由于空气阻力微晃
    const sway = f.reduced ? 0 : Math.sin(f.motion * 8 + index) * u * 0.006;
    const charY = curTopY + index * charSpacing;
    const charX = w * 0.5 + sway;

    // 垂直极速运动模糊残影 (Motion Streaks)
    if (!f.reduced && dt > 0.1 && charY < h * 1.2) {
      for (let trail = 1; trail <= 3; trail += 1) {
        const pastDt = Math.max(0, dt - trail * 0.035);
        const pastY = startTopY + 0.5 * g * pastDt * pastDt + index * charSpacing;
        ink(f, glyph.char, charX, pastY, charSize, {
          alpha: (0.18 / trail) * (1 - clamp((charY - h) / (h * 0.3))),
          color: RED,
        });
      }
    }

    // 越往下接近虚无，渐隐消融
    const alphaFade = clamp(1 - Math.max(0, charY - h * 0.85) / (h * 0.25));

    ink(f, glyph.char, charX, charY, charSize, {
      alpha: revealAt(f, glyph.start) * alphaFade,
      color: index >= 7 ? RED : BONE, // “一无所有”为醒目鲜红
      weight: 900,
      glow: index >= 7 ? RED : undefined,
      glowBlur: index >= 7 ? 18 : 0,
    });
  });

  // 5. 底部虚空奇点地平线光带
  hairline(f, [[w * 0.5, 0], [w * 0.5, h]], RED, 0.15, 1);
  if (dt > 1.2) {
    ink(f, "一 无 所 有", w * 0.5, h * 0.5, u * 0.16, {
      color: f.cue.palette.muted,
      alpha: clamp((dt - 1.2) / 0.8) * 0.35,
      weight: 900,
    });
  }
}

function ctxSave(f: Frame, fn: () => void) {
  f.ctx.save();
  fn();
  f.ctx.restore();
}

export const sceneRenderers: Record<SceneKind, (frame: Frame) => void> = {
  sea,
  horizon,
  mirror,
  shatter,
  room,
  window: windowPane,
  spiral,
  bottle,
  crowd,
  quiet,
  escape,
  pulse,
  brain,
  cage,
  signal,
  run,
  countdown,
  type: typeset,
  eye,
  heat,
  heart,
  city,
  sleep,
  sieve,
  light,
  clock,
  breath,
  scar,
  fall,
  erase,
  question,
};
