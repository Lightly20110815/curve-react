/**
 * renderer.ts —《反乌托邦 Pt.2》纯矢量动画 PV 画布渲染器
 * 负责高分屏 DPI 管理、镜头震动、时间轴场景调度、纯矢量间奏渲染与工业技术框。
 */
import { clamp, cueGlyphs, getCameraShake, type Stage } from "./draw";
import { drawInterlude } from "./interludes";
import { drawTechHud, sceneRenderers, type Frame } from "./scenes";
import { getCueAt } from "./score";

export function createDystopiaRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("无法创建反乌托邦动画 PV 画布");

  let width = 1;
  let height = 1;
  let ratio = 1;
  let lastCueIndex = -1;
  let cueStartTime = -1;
  let currentGlyphs: Frame["glyphs"] = [];

  return {
    resize(w: number, h: number, dpr: number) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      ratio = clamp(dpr, 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    },

    render(time: number, reducedMotion: boolean) {
      const safeTime = Number.isFinite(time) ? Math.max(0, time) : 0;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.globalAlpha = 1;

      const stageBase: Stage = {
        ctx,
        w: width,
        h: height,
        u: Math.min(width, height),
        time: safeTime,
        motion: reducedMotion ? 0 : safeTime,
        age: 0,
        progress: 0,
        reduced: reducedMotion,
      };

      const cue = getCueAt(safeTime);

      if (!cue) {
        lastCueIndex = -1;
        drawInterlude(stageBase, safeTime, reducedMotion);
        return;
      }

      if (lastCueIndex !== cue.index) {
        currentGlyphs = cueGlyphs(cue);
        lastCueIndex = cue.index;
        cueStartTime = safeTime;
      }

      // 镜头震动冲力 (Camera Shake on Cue Hit)
      const shake = reducedMotion
        ? { x: 0, y: 0 }
        : getCameraShake(safeTime, cueStartTime, 0.28, 8);

      ctx.save();
      if (shake.x !== 0 || shake.y !== 0) {
        ctx.translate(shake.x, shake.y);
      }

      // 场景纯色深空底
      ctx.fillStyle = cue.palette.background;
      ctx.fillRect(-10, -10, width + 20, height + 20);

      const frame: Frame = {
        ...stageBase,
        age: reducedMotion ? 2 : safeTime - cue.cueStart,
        progress: reducedMotion
          ? 0.5
          : clamp((safeTime - cue.cueStart) / Math.max(0.001, cue.cueEnd - cue.cueStart)),
        cue,
        glyphs: currentGlyphs,
      };

      const renderer = sceneRenderers[cue.kind];
      if (renderer) {
        renderer(frame);
      } else {
        sceneRenderers.intro(frame);
      }

      drawTechHud(frame, cue);

      ctx.restore();

      // 电影感画幅四角技术定位十字框 (Technical Viewfinder Crosshairs)
      const u = Math.min(width, height);
      const crossSize = u * 0.016;
      const margin = u * 0.038;
      ctx.save();
      ctx.strokeStyle = cue.palette.accent;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;

      [
        [margin, margin],
        [width - margin, margin],
        [margin, height - margin],
        [width - margin, height - margin],
      ].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.moveTo(cx - crossSize, cy);
        ctx.lineTo(cx + crossSize, cy);
        ctx.moveTo(cx, cy - crossSize);
        ctx.lineTo(cx + crossSize, cy);
        ctx.stroke();
      });

      ctx.restore();
    },

    destroy() {
      // 纯矢量渲染无需额外释放图片内存
    },
  };
}
