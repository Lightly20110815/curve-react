import {
  BLACK,
  BONE,
  RED,
  TAU,
  WATER,
  clamp,
  drawHeadphoneCableFlow,
  easeIn,
  easeOut,
  hairline,
  ink,
  lerp,
  sampleMotif,
  seed,
  speedLines,
  type Stage,
} from "./draw";


const wrap = (value: number, size: number) => ((value % size) + size) % size;

function makeStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  reduced: boolean,
): Stage {
  return {
    ctx,
    w: width,
    h: height,
    u: Math.min(width, height),
    time,
    motion: reduced ? 0 : time,
    age: reduced ? 2 : time,
    progress: 0.5,
    reduced,
  };
}

/** 0–8s: 3.5mm 耳机线自虚空垂下，开始注入心脏 */
function cablePrelude(st: Stage) {
  const { w, h, u } = st;
  const cx = w * 0.5;
  const cy = h * 0.52;

  // 1. 镀金插头与灵动耳机线垂入注入
  const dropProgress = st.reduced ? 1 : easeOut(clamp(st.time / 3));
  const cableEndY = lerp(-u * 0.2, cy - u * 0.12, dropProgress);
  drawHeadphoneCableFlow(st, cx, 0, cx, cableEndY, 1.6, RED);
  const heartBeat = st.reduced ? 1 : 1 + Math.pow(Math.max(0, Math.sin(st.time * 5)), 6) * 0.15;
  const heartPts = sampleMotif("heart", 30, 24);
  const span = u * 0.38 * heartBeat * dropProgress;

  heartPts.forEach((pt) => {
    ink(st, "■", cx + pt.x * span * 0.5, cy + pt.y * span * 0.5 + u * 0.08, u * 0.012, {
      color: pt.y < -0.1 ? RED : BONE,
      alpha: 0.65 * dropProgress,
    });
  });
}

/** 8–16s: 震撼片头——「自 由 落 体」重磅砸击屏幕！ */
function fallingTitle(st: Stage) {
  const { w, h, u } = st;
  const title = ["自", "由", "落", "体"];
  const floorY = h * 0.48;

  // 垂直速度冲线
  speedLines(st, 24, "down", RED, 0.4);

  // 4个巨型汉字按节奏砸击地面
  const charSize = Math.min(u * 0.2, w * 0.22);
  title.forEach((char, index) => {
    const dropDelay = index * 0.18;
    const dropAge = Math.max(0, st.time - 8.2 - dropDelay);
    const fall = st.reduced ? 1 : easeIn(clamp(dropAge / 0.45));
    const curY = lerp(-charSize * 1.5, floorY, fall);
    const isImpact = dropAge > 0.45 && dropAge < 0.8;
    const x = w * 0.5 + (index - 1.5) * charSize * 1.06;

    // 落地扬起尘埃粒子
    if (!st.reduced && isImpact) {
      for (let d = 0; d < 4; d += 1) {
        ink(st, "·", x + (seed(index * 4 + d) - 0.5) * u * 0.15, floorY + charSize * 0.4, u * 0.03, {
          color: RED,
          alpha: 0.7,
        });
      }
    }

    ink(st, char, x, curY, charSize, {
      color: char === "落" || char === "体" ? RED : BONE,
      weight: 900,
      alpha: clamp(dropAge * 4),
      glow: char === "落" ? RED : undefined,
      glowBlur: 18,
    });
  });

  // 片头副标题
  ink(st, "FREEFALL // TEXT PV · REMIX", w * 0.5, h * 0.76, u * 0.03, {
    color: WATER,
    mono: true,
    weight: 700,
    alpha: clamp((st.time - 9.8) / 1.2) * 0.9,
  });
  ink(st, "依 菲 雅 专 辑 视 觉 动 画", w * 0.5, h * 0.82, u * 0.022, {
    color: BONE,
    serif: true,
    alpha: clamp((st.time - 10.4) / 1.2) * 0.7,
  });
}

/** 16–26.62s: 心跳示波带预热，第一幕即将开演 */
function heartbeatBed(st: Stage) {
  const { w, h, u } = st;
  const baseline = h * 0.42;

  // 1. 示波器滚动机架
  const scroll = st.reduced ? 0 : st.motion * 0.28;
  const samples = 120;
  const pts: number[][] = [];
  for (let i = 0; i <= samples; i += 1) {
    const p = i / samples;
    const waveX = p * w;
    const wavePhase = wrap(p * 4 - scroll, 1);
    let amp = 0;
    if (wavePhase > 0.45 && wavePhase < 0.55) {
      amp = Math.sin((wavePhase - 0.45) * 10 * Math.PI) * u * 0.18;
    }
    pts.push([waveX, baseline - amp]);
  }
  hairline(st, pts, WATER, 0.75, 2);

  // 2. 预备提示：第一幕即将开演
  ink(st, "ACT I : THE STILL SHORELINE // 海边", w * 0.5, h * 0.72, u * 0.032, {
    color: BONE,
    serif: true,
    weight: 700,
    alpha: 0.9,
  });
  ink(st, "VOCAL INCOMING...", w * 0.5, h * 0.78, u * 0.02, {
    color: RED,
    mono: true,
    alpha: st.reduced ? 0.7 : Math.sin(st.time * 6) * 0.3 + 0.6,
  });
}

/** 92.12–103.4s: 间奏钢琴段落——记忆粒子星尘旋转 */
function memoryDissolve(st: Stage) {
  const { w, h, u } = st;
  const cx = w * 0.5;
  const cy = h * 0.48;
  const t = st.time - 92.12;

  // 1. 缓慢旋转的星轨同心圆
  for (let ring = 1; ring <= 3; ring += 1) {
    const r = ring * u * 0.16;
    ctxSave(st, () => {
      st.ctx.strokeStyle = WATER;
      st.ctx.lineWidth = 1;
      st.ctx.globalAlpha = 0.25;
      st.ctx.beginPath();
      st.ctx.arc(cx, cy, r, 0, TAU);
      st.ctx.stroke();
    });
  }

  // 2. 散落漂浮的回忆碎屑文字
  const memoryWords = Array.from("后来存在回忆的碎片");
  memoryWords.forEach((char, idx) => {
    const angle = (idx / memoryWords.length) * TAU + (st.reduced ? 0 : t * 0.35);
    const rad = u * (0.12 + (idx % 3) * 0.09);
    ink(st, char, cx + Math.cos(angle) * rad * 1.3, cy + Math.sin(angle) * rad * 0.9, u * 0.04, {
      color: idx % 2 === 0 ? BONE : WATER,
      alpha: 0.8,
      weight: 700,
      rotate: angle,
    });
  });

  // 3. 间奏技术标识
  ink(st, "ACT III : INTERLUDE // RECOLLECTION", cx, h * 0.82, u * 0.024, {
    color: fPaletteMuted(BONE),
    mono: true,
    alpha: 0.7,
  });
}

/** ≥ 168.75s: 终局落幕——重力失重后的纯黑虚无与依菲雅档案归档 */
function coda(st: Stage) {
  const { w, h, u } = st;
  const cx = w * 0.5;
  const cy = h * 0.46;
  const t = st.time - 168.75;

  // 1. 虚空中微弱漂浮的几颗消逝星光
  for (let s = 0; s < 12; s += 1) {
    const fade = clamp(1 - (t - s * 0.3) / 8);
    if (fade > 0) {
      ink(st, "·", w * seed(s * 19), h * seed(s * 23), u * 0.02, {
        color: WATER,
        alpha: fade * 0.45,
      });
    }
  }

  // 2. 最终诗句留白
  const lineFade = clamp(t / 1.5) * (1 - clamp((t - 9) / 3));
  ink(st, "夏天结束了", cx, cy, u * 0.065, {
    color: BONE,
    serif: true,
    alpha: lineFade * 0.9,
    weight: 700,
  });
  ink(st, "“还会再来吗？” “还会，但 Epheia 不会了”", cx, cy + u * 0.09, u * 0.028, {
    color: RED,
    serif: true,
    alpha: lineFade * 0.8,
  });

  // 3. 放映结束打字机光标
  const blink = st.reduced ? 1 : Math.sin(t * 4) > 0 ? 1 : 0;
  ink(st, `EPHEIA ARCHIVE // TRANSMISSION TERMINATED _`, cx, h * 0.82, u * 0.018, {
    color: BONE,
    mono: true,
    alpha: clamp(t / 2) * blink * 0.65,
  });
}

/** 未命中秒数的安全防线 */
function voidDrift(st: Stage) {
  const { w, h, u } = st;
  ink(st, "自 由 落 体", w * 0.5, h * 0.5, u * 0.045, { color: BONE, alpha: 0.3, serif: true });
}

function fPaletteMuted(color: string): string {
  return color;
}

function ctxSave(st: Stage, fn: () => void) {
  st.ctx.save();
  fn();
  st.ctx.restore();
}

/**
 * 间奏与转场总调度
 */
export function drawInterlude(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  reducedMotion: boolean,
): void {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, width, height);
  if (width <= 0 || height <= 0 || !Number.isFinite(time)) {
    ctx.restore();
    return;
  }
  const stage = makeStage(ctx, width, height, Math.max(0, time), reducedMotion);
  if (time < 8) {
    cablePrelude(stage);
  } else if (time < 16) {
    fallingTitle(stage);
  } else if (time < 26.62) {
    heartbeatBed(stage);
  } else if (time >= 92.12 && time < 103.4) {
    memoryDissolve(stage);
  } else if (time >= 168.75) {
    coda(stage);
  } else {
    voidDrift(stage);
  }
  ctx.restore();
}
