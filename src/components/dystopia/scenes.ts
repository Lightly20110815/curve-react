/**
 * scenes.ts —《反乌托邦 Pt.2》逐句纯矢量电影级动画 PV 场景渲染器
 * 86 句歌词对应 100% 紧扣歌词意象的纯矢量程序化动画，完全移除外部图片。
 */
import {
  TAU,
  clamp,
  drawBloomingFlower,
  drawBurningIron,
  drawChainsAndLock,
  drawClashArms,
  drawCitySkyline,
  drawGuitarStaves,
  drawHeadphoneCableFlow,
  drawIndustrialGears,
  drawLaserNet,
  drawMechanicalHeart,
  drawRainAndLamps,
  drawScaleBalance,
  drawSearchlights,
  drawShatterPowder,
  drawSketchUtopia,
  drawSlashCut,
  drawSunbeamWindow,
  hairline,
  ink,
  kineticLyricLine,
  seed,
  speedLines,
  type CharGlyph,
  type Stage,
} from "./draw";
import { getActAt, type Cue, type SceneKind } from "./score";

export type Frame = Stage & {
  cue: Cue;
  glyphs: CharGlyph[];
};

/** 工业 HUD 标题与角标 */
export function drawTechHud(stage: Stage, cue: Cue) {
  const { w, h, u, time } = stage;
  const act = getActAt(time);

  // 顶部左侧工业扇区标记
  ink(stage, "SECTOR 07 // 反乌托邦 PT.2", w * 0.08, h * 0.06, u * 0.016, {
    mono: true,
    align: "left",
    color: cue.palette.muted,
    alpha: 0.8,
  });

  // 顶部右侧幕别
  ink(stage, `${act.code} · ${act.title}`, w * 0.92, h * 0.06, u * 0.016, {
    mono: true,
    align: "right",
    color: cue.palette.muted,
    alpha: 0.8,
  });

  // 底部左侧 CUE 编号
  ink(
    stage,
    `CUE ${String(cue.index + 1).padStart(2, "0")}/086 // ${cue.kind.toUpperCase()}`,
    w * 0.08,
    h * 0.94,
    u * 0.015,
    {
      mono: true,
      align: "left",
      color: cue.palette.muted,
      alpha: 0.7,
    },
  );
}

export const sceneRenderers: Record<SceneKind, (f: Frame) => void> = {
  // =========================================================================
  // ACT I: CRUSHED & PRICED (碾碎与标价)
  // =========================================================================

  intro: (f) => {
    const { w, h, u, time } = f;
    drawCitySkyline(f, 0.45);
    drawSearchlights(f, 0.35);

    // 示波器雷达波纹扩散
    const rip = (time * 0.8) % 1;
    f.ctx.strokeStyle = "#34d399";
    f.ctx.lineWidth = 1.5;
    f.ctx.globalAlpha = (1 - rip) * 0.5;
    f.ctx.beginPath();
    f.ctx.arc(w * 0.5, h * 0.42, u * 0.35 * rip, 0, TAU);
    f.ctx.stroke();

    const scale = 1 + f.cue.variant * 0.15;
    ink(f, f.cue.line.replace(/[（）()]/g, ""), w * 0.5, h * 0.4, u * 0.12 * scale, {
      weight: 900,
      color: f.cue.palette.ink,
      alpha: 0.85,
      glow: f.cue.palette.glow,
      glowBlur: 24,
    });

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.62,
      size: u * 0.05,
      mode: "pulse",
    });
  },

  clash: (f) => {
    const { w, h, u, time } = f;
    speedLines(f, 32, "up", "#ef4444", 0.5);

    // 歌词意象：双机械臂强力对冲争夺碰撞！
    drawClashArms(f, (time - f.cue.cueStart) / 0.4);
    drawSlashCut(f, 0, h * 0.2, w, h * 0.8, (time - f.cue.cueStart) / 0.4, "#ef4444");

    ink(f, "争 夺", w * 0.5, h * 0.35, u * 0.22, {
      weight: 900,
      color: f.cue.palette.accent,
      alpha: 0.15,
    });

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.68,
      size: u * 0.075,
      mode: "smash",
    });
  },

  powder: (f) => {
    const { w, h, u, time } = f;
    drawCitySkyline(f, 0.25);

    // 歌词意象：发光星辰被敲碎为漫天粉末
    drawShatterPowder(f, (time - f.cue.cueStart) / 1.2);

    ink(f, "愿 望 → 粉 末", w * 0.5, h * 0.28, u * 0.06, {
      weight: 900,
      mono: true,
      color: f.cue.palette.muted,
      alpha: 0.4,
    });

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.62,
      size: u * 0.07,
      mode: "split",
    });
  },

  lock: (f) => {
    const { h, u, time } = f;
    // 歌词意象：重型铁链与门锁扣死心灵
    drawChainsAndLock(f, (time - f.cue.cueStart) / 0.6);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.66,
      size: u * 0.07,
      mode: "stamped",
    });
  },

  lamps: (f) => {
    const { h, u } = f;
    // 歌词意象：斜风暴雨中模糊摇曳的远景灯火
    drawRainAndLamps(f, 0.75);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.58,
      size: u * 0.07,
      mode: "pulse",
    });
  },

  reach: (f) => {
    const { w, h, u } = f;
    drawCitySkyline(f, 0.3);
    // 歌词意象：耳机线向前奋力延伸穿透
    drawHeadphoneCableFlow(f, w * 0.05, h * 0.42, w * 0.95, h * 0.42, 2.8, f.cue.palette.accent);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.62,
      size: u * 0.07,
      mode: "streak",
    });
  },

  cascade: (f) => {
    const { w, h, u, time, reduced } = f;
    // 歌词意象：喉咙深处溢出的无数话语
    if (!reduced) {
      for (let i = 0; i < 18; i += 1) {
        const cx = w * seed(i * 31);
        const cy = ((time * 1.6 + seed(i * 19)) % 1) * h;
        ink(f, "VOICE", cx, cy, u * 0.016, {
          mono: true,
          color: f.cue.palette.muted,
          alpha: 0.35,
        });
      }
    }

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.52,
      size: u * 0.07,
      mode: "cascade",
    });
  },

  plea: (f) => {
    const { w, h, u, time } = f;
    drawCitySkyline(f, 0.3);

    // 歌词意象：挽留与追赶的时间慢动作波纹
    const ripple = (time * 1.5) % 1;
    f.ctx.strokeStyle = f.cue.palette.accent;
    f.ctx.lineWidth = 2.5;
    f.ctx.globalAlpha = (1 - ripple) * 0.7;
    f.ctx.beginPath();
    f.ctx.arc(w * 0.5, h * 0.45, u * 0.45 * ripple, 0, TAU);
    f.ctx.stroke();

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.45,
      size: u * 0.08,
      mode: "punch",
    });
  },

  dialog: (f) => {
    const { w, h, u, time } = f;
    // 歌词意象：两人面对面的音频示波波形
    const steps = 48;
    const pts1: number[][] = [];
    const pts2: number[][] = [];
    for (let s = 0; s <= steps; s += 1) {
      const px = (s / steps) * w;
      const amp1 = Math.sin(s * 0.5 + time * 6) * u * 0.035;
      const amp2 = Math.cos(s * 0.5 + time * 5) * u * 0.035;
      pts1.push([px, h * 0.38 + amp1]);
      pts2.push([px, h * 0.46 + amp2]);
    }
    hairline(f, pts1, f.cue.palette.accent, 0.7, 2.5);
    hairline(f, pts2, f.cue.palette.ink, 0.7, 2.5);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.65,
      size: u * 0.07,
      mode: "pulse",
    });
  },

  price: (f) => {
    const { h, u } = f;
    // 歌词意象：良心与金钱的失衡天平称量
    drawScaleBalance(f, 0.28);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.68,
      size: u * 0.065,
      mode: "stamped",
    });
  },

  conveyor: (f) => {
    const { w, h, u, time } = f;
    // 歌词意象：无情传送带打包推走
    const beltY = h * 0.45;
    hairline(f, [[0, beltY], [w, beltY]], "#64748b", 0.8, 4);
    hairline(f, [[0, beltY + u * 0.06], [w, beltY + u * 0.06]], "#64748b", 0.8, 4);

    const boxes = 6;
    for (let b = 0; b < boxes; b += 1) {
      const bx = ((time * 0.35 + b / boxes) % 1) * w * 1.2 - w * 0.1;
      f.ctx.strokeStyle = f.cue.palette.accent;
      f.ctx.lineWidth = 2;
      f.ctx.globalAlpha = 0.75;
      f.ctx.strokeRect(bx, beltY - u * 0.06, u * 0.09, u * 0.06);
      ink(f, `PACK_${b + 1}`, bx + u * 0.045, beltY - u * 0.03, u * 0.014, {
        mono: true,
        color: f.cue.palette.accent,
      });
    }

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.68,
      size: u * 0.07,
      mode: "streak",
    });
  },

  iron: (f) => {
    const { w, h, u } = f;
    // 歌词意象：烧红的烙铁
    drawBurningIron(f, w * 0.5, h * 0.35, 1.0);
    speedLines(f, 24, "down", "#ff5722", 0.45);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.64,
      size: u * 0.07,
      mode: "smash",
      activeColor: "#ffedd5",
      glowColor: "#ff5722",
    });
  },

  glare: (f) => {
    const { w, h, u } = f;
    // 歌词意象：刺眼的惨白过曝强光
    const grad = f.ctx.createRadialGradient(w * 0.5, h * 0.28, 10, w * 0.5, h * 0.28, w * 0.65);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.35, "rgba(254, 240, 138, 0.5)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    f.ctx.fillStyle = grad;
    f.ctx.fillRect(0, 0, w, h);

    hairline(f, [[0, h * 0.28], [w, h * 0.28]], "#ffffff", 0.9, 3.5);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.65,
      size: u * 0.07,
      mode: "punch",
      color: "#0f172a",
      activeColor: "#ef4444",
    });
  },

  blocked: (f) => {
    const { w, h, u } = f;
    // 歌词意象：厚重铁板遮蔽心底，光线折射反弹
    f.ctx.fillStyle = "#090d12";
    f.ctx.fillRect(w * 0.22, h * 0.15, w * 0.56, h * 0.55);
    f.ctx.strokeStyle = "#334155";
    f.ctx.lineWidth = 3;
    f.ctx.strokeRect(w * 0.22, h * 0.15, w * 0.56, h * 0.55);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.42,
      size: u * 0.065,
      mode: "split",
    });
  },

  magnet: (f) => {
    const { w, h, u } = f;
    // 歌词意象：消磁散落的磁感线
    const cx = w * 0.5;
    const cy = h * 0.38;
    for (let r = 1; r <= 4; r += 1) {
      f.ctx.strokeStyle = f.cue.palette.accent;
      f.ctx.lineWidth = 1.5;
      f.ctx.globalAlpha = (1 - r * 0.2) * 0.45;
      f.ctx.beginPath();
      f.ctx.arc(cx, cy, u * 0.08 * r, Math.PI, TAU);
      f.ctx.stroke();
    }

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.62,
      size: u * 0.07,
      mode: "pulse",
    });
  },

  terms: (f) => {
    const { w, h, u } = f;
    // 歌词意象：滚动的强制协议与下压驳回图章
    for (let l = 0; l < 7; l += 1) {
      const ly = h * 0.22 + l * u * 0.045;
      ink(f, "CLAUSE 07-B // ALL CONDITIONS WAIVED AND TERMINATED", w * 0.5, ly, u * 0.015, {
        mono: true,
        color: f.cue.palette.muted,
        alpha: 0.35,
      });
    }

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.56,
      size: u * 0.07,
      mode: "stamped",
    });
  },

  gear: (f) => {
    const { w, h, u } = f;
    // 歌词意象：活成任人摆弄的零件
    drawIndustrialGears(f, w * 0.32, h * 0.42, u * 0.16, 1.2, 16);
    drawIndustrialGears(f, w * 0.68, h * 0.42, u * 0.12, -1.6, 12);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.68,
      size: u * 0.07,
      mode: "punch",
    });
  },

  insomnia: (f) => {
    const { w, h, u, time } = f;
    // 歌词意象：夙愿与失眠乱码
    const eeg: number[][] = [];
    for (let x = 0; x <= w; x += 10) {
      const amp = Math.sin(x * 0.02 + time * 4) * u * 0.03;
      eeg.push([x, h * 0.4 + amp]);
    }
    hairline(f, eeg, "#38bdf8", 0.6, 2.5);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.58,
      size: u * 0.07,
      mode: "pulse",
    });
  },

  // =========================================================================
  // ACT II: THE NET & THE SONG (困网与歌唱)
  // =========================================================================

  because: (f) => {
    const { h, u } = f;
    speedLines(f, 36, "radial", f.cue.palette.accent, 0.65);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.13,
      mode: "punch",
      activeColor: f.cue.palette.accent,
    });
  },

  heart: (f) => {
    const { w, h, u } = f;
    // 歌词意象：渴望自由的纯矢量解剖机械心脏
    drawMechanicalHeart(f, w * 0.5, h * 0.42, u * 0.18, 1.5);
    drawHeadphoneCableFlow(f, 0, h * 0.42, w * 0.4, h * 0.42, 2.8, "#ef4444");
    drawHeadphoneCableFlow(f, w * 0.6, h * 0.42, w, h * 0.42, 2.8, "#fbbf24");

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.72,
      size: u * 0.075,
      mode: "punch",
      activeColor: "#ffe2b0",
      glowColor: "#ff5722",
    });
  },

  net: (f) => {
    const { h, u } = f;
    // 歌词意象：困在一张毫无空隙的高压电网
    drawLaserNet(f, 1.5, "#ef4444");

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.07,
      mode: "split",
    });
  },

  lights: (f) => {
    const { h, u } = f;
    // 歌词意象：周围并非没光亮
    drawSearchlights(f, 0.65);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.58,
      size: u * 0.07,
      mode: "pulse",
    });
  },

  burn: (f) => {
    const { h, u } = f;
    // 歌词意象：太耀眼灼伤
    speedLines(f, 32, "up", "#ff5722", 0.65);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.08,
      mode: "smash",
      activeColor: "#ffedd5",
      glowColor: "#ff5722",
    });
  },

  maze: (f) => {
    const { w, h, u } = f;
    // 歌词意象：世界里的迷茫迷宫网格
    const cols = 8;
    const rows = 6;
    for (let c = 0; c < cols; c += 1) {
      for (let r = 0; r < rows; r += 1) {
        const mx = (c / cols) * w * 0.8 + w * 0.1;
        const my = (r / rows) * h * 0.6 + h * 0.15;
        if (seed(c * 17 + r * 31) > 0.4) {
          hairline(f, [[mx, my], [mx + u * 0.08, my]], "#38bdf8", 0.45, 2);
        } else {
          hairline(f, [[mx, my], [mx, my + u * 0.08]], "#38bdf8", 0.45, 2);
        }
      }
    }

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.62,
      size: u * 0.07,
      mode: "streak",
    });
  },

  knife: (f) => {
    const { w, h, u, time } = f;
    // 歌词意象：斩落的小刀与冷冽刀光
    drawSlashCut(f, w * 0.1, h * 0.2, w * 0.9, h * 0.8, (time - f.cue.cueStart) / 0.35, "#ef4444");
    drawSlashCut(f, w * 0.9, h * 0.2, w * 0.1, h * 0.8, (time - f.cue.cueStart - 0.1) / 0.35, "#38bdf8");

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.075,
      mode: "split",
    });
  },

  sing: (f) => {
    const { w, h, u } = f;
    // 歌词意象：至少我还在为你歌唱
    drawGuitarStaves(f, w * 0.5, h * 0.68, w * 0.85);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.42,
      size: u * 0.08,
      mode: "punch",
      activeColor: "#fef08a",
      glowColor: "#38bdf8",
    });
  },

  anthem: (f) => {
    const { w, h, u } = f;
    drawCitySkyline(f, 0.5);
    drawSearchlights(f, 0.5);

    ink(f, "反乌托邦", w * 0.5, h * 0.36, u * 0.16, {
      weight: 900,
      color: f.cue.palette.accent,
      alpha: 0.22,
    });

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.6,
      size: u * 0.08,
      mode: "punch",
      activeColor: f.cue.palette.highlight,
    });
  },

  guitar: (f) => {
    const { w, h, u } = f;
    // 歌词意象：带走吉他
    drawGuitarStaves(f, w * 0.5, h * 0.45, w * 0.85);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.68,
      size: u * 0.075,
      mode: "streak",
    });
  },

  songaway: (f) => {
    const { w, h, u, time, reduced } = f;
    // 歌词意象：把歌带走，随风散落的五线谱
    if (!reduced) {
      for (let s = 0; s < 16; s += 1) {
        const p = ((time * 0.4 + s / 16) % 1 + 1) % 1;
        const sx = w * 0.85 - p * w;
        const sy = h * 0.2 + p * h * 0.6 + Math.sin(p * 8 + s) * u * 0.05;
        f.ctx.strokeStyle = "#cbd5e1";
        f.ctx.lineWidth = 1.5;
        f.ctx.globalAlpha = (1 - p) * 0.7;
        f.ctx.strokeRect(sx, sy, u * 0.04, u * 0.03);
      }
    }

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.52,
      size: u * 0.075,
      mode: "cascade",
    });
  },

  sweep: (f) => {
    const { w, h, u, time, reduced } = f;
    // 歌词意象：统统带走的离心暴风漩涡
    if (!reduced) {
      for (let r = 0; r < 8; r += 1) {
        const rad = u * (0.05 + r * 0.06);
        f.ctx.strokeStyle = f.cue.palette.accent;
        f.ctx.lineWidth = 1.8;
        f.ctx.globalAlpha = (1 - r / 8) * 0.5;
        f.ctx.beginPath();
        f.ctx.arc(w * 0.5, h * 0.45, rad, time * 2.5, time * 2.5 + Math.PI * 1.5);
        f.ctx.stroke();
      }
    }

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.68,
      size: u * 0.065,
      mode: "smash",
    });
  },

  somewhere: (f) => {
    const { h, u } = f;
    // 歌词意象：看不见的地方，深邃星野
    drawCitySkyline(f, 0.4);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.07,
      mode: "pulse",
    });
  },

  pen: (f) => {
    const { h, u, time } = f;
    // 歌词意象：签字笔勾勒出乌托邦小屋
    drawSketchUtopia(f, clamp((time - f.cue.cueStart) / 1.5));

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.68,
      size: u * 0.07,
      mode: "streak",
    });
  },

  clock8: (f) => {
    const { w, h, u, time } = f;
    // 歌词意象：八小时清醒八小时做梦的几何表盘
    [-0.26, 0, 0.26].forEach((off, idx) => {
      const cx = w * 0.5 + off * w;
      const cy = h * 0.42;
      const cr = u * 0.11;
      f.ctx.strokeStyle = idx === 2 ? "#fef08a" : "#38bdf8";
      f.ctx.lineWidth = 2.5;
      f.ctx.beginPath();
      f.ctx.arc(cx, cy, cr, 0, TAU);
      f.ctx.stroke();

      const handAngle = (time * (idx + 1) * 1.5) % TAU;
      hairline(
        f,
        [[cx, cy], [cx + Math.cos(handAngle) * cr * 0.8, cy + Math.sin(handAngle) * cr * 0.8]],
        "#ffffff",
        0.85,
        2.5,
      );

      ink(f, idx === 0 ? "8H WAKE" : idx === 1 ? "8H DREAM" : "8H BLOOM", cx, cy + cr + u * 0.03, u * 0.016, {
        mono: true,
        color: f.cue.palette.muted,
      });
    });

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.68,
      size: u * 0.07,
      mode: "punch",
    });
  },

  flower: (f) => {
    const { w, h, u, time } = f;
    // 歌词意象：破土而出的晶莹折纸花朵
    drawSunbeamWindow(f, 0.5);
    drawBloomingFlower(f, w * 0.6, h * 0.55, u * 0.16, clamp((time - f.cue.cueStart) / 1.5));

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.35,
      size: u * 0.08,
      mode: "pulse",
      activeColor: "#fef08a",
      glowColor: "#fef08a",
    });
  },

  // =========================================================================
  // ACT III: TYPICAL PART No.0000 (典型零件)
  // =========================================================================

  me: (f) => {
    const { w, h, u } = f;
    ink(f, "我", w * 0.5, h * 0.48, u * 0.28, {
      weight: 900,
      color: f.cue.palette.ink,
      glow: f.cue.palette.glow,
      glowBlur: 30,
    });
  },

  specimen: (f) => {
    const { w, h, u } = f;
    // 标本框
    f.ctx.strokeStyle = "#475569";
    f.ctx.lineWidth = 2.5;
    f.ctx.strokeRect(w * 0.5 - u * 0.2, h * 0.3 - u * 0.15, u * 0.4, u * 0.3);
    ink(f, "SPECIMEN TAG #0000-EPHEIA", w * 0.5, h * 0.3 - u * 0.17, u * 0.016, {
      mono: true,
      color: f.cue.palette.accent,
    });

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.6,
      size: u * 0.07,
      mode: "stamped",
    });
  },

  duality: (f) => {
    const { w, h, u } = f;
    // 对与错：左右极性分屏
    hairline(f, [[w * 0.5, 0], [w * 0.5, h]], "#475569", 0.7, 2.5);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.075,
      mode: "split",
    });
  },

  nullify: (f) => {
    const { w, h, u } = f;
    ink(f, "∅ ∅ ∅", w * 0.5, h * 0.35, u * 0.1, {
      mono: true,
      color: f.cue.palette.muted,
      alpha: 0.35,
    });

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.55,
      size: u * 0.07,
      mode: "cascade",
    });
  },

  extrude: (f) => {
    const { h, u } = f;
    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.075,
      mode: "stamped",
    });
  },

  coldtype: (f) => {
    const { h, u } = f;
    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.07,
      mode: "stamped",
    });
  },

  bones: (f) => {
    const { w, h, u } = f;
    // 肋骨骨骼 X 光震颤
    for (let r = 0; r < 6; r += 1) {
      const ry = h * 0.3 + r * u * 0.05;
      const rw = u * (0.15 + seed(r * 19) * 0.1);
      hairline(f, [[w * 0.5 - rw, ry], [w * 0.5 + rw, ry]], "#ef4444", 0.7, 3);
    }

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.68,
      size: u * 0.07,
      mode: "smash",
    });
  },

  stamp: (f) => {
    const { h, u } = f;
    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.075,
      mode: "stamped",
    });
  },

  bloodwarm: (f) => {
    const { h, u } = f;
    speedLines(f, 24, "up", "#ef4444", 0.5);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.08,
      mode: "smash",
      activeColor: "#ffedd5",
      glowColor: "#ff5722",
    });
  },

  fadeasp: (f) => {
    const { h, u } = f;
    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.065,
      mode: "pulse",
    });
  },

  // =========================================================================
  // ACT IV: SING IT AGAIN (再唱一次)
  // =========================================================================

  niceworld: (f) => {
    const { w, h, u } = f;
    ink(f, "BEAUTIFUL WORLD // 虚幻蜃景", w * 0.5, h * 0.35, u * 0.022, {
      mono: true,
      color: f.cue.palette.accent,
      alpha: 0.6,
    });

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.52,
      size: u * 0.075,
      mode: "pulse",
    });
  },

  question: (f) => {
    const { w, h, u } = f;
    ink(f, "？", w * 0.5, h * 0.36, u * 0.2, {
      weight: 900,
      color: f.cue.palette.accent,
      alpha: 0.25,
    });

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.58,
      size: u * 0.07,
      mode: "punch",
    });
  },

  whisper: (f) => {
    const { w, h, u, time } = f;
    const rip = (time * 1.5) % 1;
    f.ctx.strokeStyle = "#94a3b8";
    f.ctx.lineWidth = 1.5;
    f.ctx.globalAlpha = (1 - rip) * 0.5;
    f.ctx.beginPath();
    f.ctx.arc(w * 0.5, h * 0.45, u * 0.25 * rip, 0, TAU);
    f.ctx.stroke();

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.58,
      size: u * 0.07,
      mode: "streak",
    });
  },

  lie: (f) => {
    const { h, u } = f;
    speedLines(f, 28, "left", "#ef4444", 0.5);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.08,
      mode: "smash",
      activeColor: "#ef4444",
      glowColor: "#ef4444",
    });
  },

  drip: (f) => {
    const { w, h, u, time } = f;
    for (let r = 0; r < 4; r += 1) {
      const rx = w * (0.2 + r * 0.2);
      const ry = h * 0.45;
      const rip = (time * 0.8 + r * 0.25) % 1;
      f.ctx.strokeStyle = "#38bdf8";
      f.ctx.lineWidth = 1.5;
      f.ctx.globalAlpha = (1 - rip) * 0.6;
      f.ctx.beginPath();
      f.ctx.arc(rx, ry, u * 0.08 * rip, 0, TAU);
      f.ctx.stroke();
    }

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.6,
      size: u * 0.07,
      mode: "pulse",
    });
  },

  loop: (f) => {
    const { w, h, u } = f;
    drawIndustrialGears(f, w * 0.5, h * 0.4, u * 0.14, 1.5, 14);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.62,
      size: u * 0.07,
      mode: "punch",
    });
  },

  crossroads: (f) => {
    const { w, h, u } = f;
    hairline(f, [[w * 0.5, h * 0.2], [w * 0.5, h * 0.5]], "#cbd5e1", 0.6, 3);
    hairline(f, [[w * 0.35, h * 0.28], [w * 0.65, h * 0.28]], "#cbd5e1", 0.6, 3);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.6,
      size: u * 0.075,
      mode: "pulse",
    });
  },

  vanish: (f) => {
    const { h, u } = f;
    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.5,
      size: u * 0.07,
      mode: "streak",
    });
  },

  soupquote: (f) => {
    const { w, h, u } = f;
    ink(f, "“总 会 好 起 来…”", w * 0.5, h * 0.45, u * 0.085, {
      serif: true,
      color: f.cue.palette.accent,
      alpha: 0.9,
      glow: f.cue.palette.glow,
      glowBlur: 14,
    });
  },

  soup: (f) => {
    const { w, h, u, time } = f;
    drawSlashCut(f, w * 0.15, h * 0.35, w * 0.85, h * 0.65, (time - f.cue.cueStart) / 0.3, "#ef4444");

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.58,
      size: u * 0.075,
      mode: "smash",
    });
  },

  murderer: (f) => {
    const { h, u } = f;
    drawSearchlights(f, 0.7);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.52,
      size: u * 0.08,
      mode: "smash",
      activeColor: "#ef4444",
      glowColor: "#ef4444",
    });
  },

  hope: (f) => {
    const { w, h, u, time, reduced } = f;
    const bx = w * 0.5;
    const by = h * 0.38;
    const flap = reduced ? 1 : Math.sin(time * 12);
    f.ctx.fillStyle = "#38bdf8";
    f.ctx.shadowColor = "#38bdf8";
    f.ctx.shadowBlur = 16;
    f.ctx.beginPath();
    f.ctx.ellipse(bx - u * 0.03, by, u * 0.04, u * 0.02 * flap, -0.4, 0, TAU);
    f.ctx.ellipse(bx + u * 0.03, by, u * 0.04, u * 0.02 * flap, 0.4, 0, TAU);
    f.ctx.fill();

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.58,
      size: u * 0.075,
      mode: "pulse",
    });
  },

  carry: (f) => {
    const { w, h, u, time, reduced } = f;
    if (!reduced) {
      for (let p = 0; p < 30; p += 1) {
        const prog = ((time * 0.6 + p / 30) % 1 + 1) % 1;
        const px = w * 0.9 - prog * w * 1.1;
        const py = h * 0.3 + prog * h * 0.4;
        f.ctx.fillStyle = f.cue.palette.accent;
        f.ctx.globalAlpha = (1 - prog) * 0.6;
        f.ctx.beginPath();
        f.ctx.arc(px, py, u * 0.005, 0, TAU);
        f.ctx.fill();
      }
    }

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.55,
      size: u * 0.07,
      mode: "streak",
    });
  },

  window: (f) => {
    const { h, u } = f;
    drawSunbeamWindow(f, 0.65);

    kineticLyricLine(f, f.glyphs, f.cue, {
      cy: h * 0.55,
      size: u * 0.075,
      mode: "pulse",
      activeColor: "#fef08a",
    });
  },

  // =========================================================================
  // ACT V: KEEP ON LIVING (活下去)
  // =========================================================================

  outro: (f) => {
    const { w, h, u } = f;
    const isBacking = Boolean(f.cue.backing);

    if (isBacking) {
      // 伴唱歌词沿着流动耳机线穿梭，卡住机械齿轮
      drawHeadphoneCableFlow(f, 0, h * 0.5, w, h * 0.5, 2.5, f.cue.palette.accent);
      kineticLyricLine(f, f.glyphs, f.cue, {
        cy: h * 0.62,
        size: u * 0.055,
        mode: "streak",
      });
    } else {
      // 主唱重击：「活下去」三字震动银幕，将背景齿轮砸碎！
      drawMechanicalHeart(f, w * 0.5, h * 0.4, u * 0.16, 1.5);
      speedLines(f, 32, "radial", "#f59e0b", 0.55);

      ink(f, "活 下 去", w * 0.5, h * 0.68, u * 0.13, {
        weight: 900,
        color: "#ffffff",
        glow: f.cue.palette.glow,
        glowBlur: 24,
      });
    }
  },

  within: (f) => {
    const { w, h, u } = f;
    drawCitySkyline(f, 0.35);
    drawSunbeamWindow(f, 0.5);

    ink(f, "在这反乌托邦里", w * 0.5, h * 0.45, u * 0.08, {
      weight: 900,
      color: f.cue.palette.ink,
      glow: f.cue.palette.glow,
      glowBlur: 18,
    });

    ink(f, "EPHEIA LIVES ON · 2026", w * 0.5, h * 0.58, u * 0.024, {
      mono: true,
      color: f.cue.palette.accent,
      alpha: 0.85,
    });
  },
};
