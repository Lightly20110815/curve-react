import { clamp, cueGlyphs, getCameraShake } from "./draw";
import { drawInterlude } from "./interludes";
import { sceneRenderers, type Frame } from "./scenes";
import { getSceneAt } from "./score";

/** The sound is the film clock. This module turns audio time into one cinematic drawn frame. */
export function createFreefallRenderer(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("无法创建文字 PV 画面");
  const ctx = context;
  let width = 1;
  let height = 1;
  let ratio = 1;
  let glyphs: Frame["glyphs"] = [];
  let lastCue = -1;
  let cueStartTime = -1;

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

      const cue = getSceneAt(safeTime);
      if (!cue) {
        lastCue = -1;
        drawInterlude(ctx, width, height, safeTime, reducedMotion);
        return;
      }

      if (lastCue !== cue.index) {
        glyphs = cueGlyphs(cue);
        lastCue = cue.index;
        cueStartTime = safeTime;
      }

      // 镜头震动冲力 (Camera Shake on Cue Hit)
      const shake = reducedMotion
        ? { x: 0, y: 0 }
        : getCameraShake(safeTime, cueStartTime, 0.25, 7);

      ctx.save();
      if (shake.x !== 0 || shake.y !== 0) {
        ctx.translate(shake.x, shake.y);
      }

      ctx.fillStyle = cue.palette.background;
      ctx.fillRect(-10, -10, width + 20, height + 20);

      const frame: Frame = {
        ctx,
        w: width,
        h: height,
        u: Math.min(width, height),
        time: safeTime,
        motion: reducedMotion ? 0 : safeTime - cue.start,
        age: reducedMotion ? 2 : safeTime - cue.start,
        progress: reducedMotion
          ? 0.5
          : clamp((safeTime - cue.start) / Math.max(0.001, cue.cueEnd - cue.start)),
        reduced: reducedMotion,
        cue,
        glyphs,
      };

      sceneRenderers[cue.kind](frame);
      ctx.restore();

      // 电影感画幅四角技术定位十字框
      const u = Math.min(width, height);
      const crossSize = u * 0.015;
      const margin = u * 0.035;
      ctx.save();
      ctx.strokeStyle = cue.palette.accent;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 1;

      // 4个角的取景框十字
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
        ctx.lineTo(cx, cy + crossSize);
        ctx.stroke();
      });
      ctx.restore();
    },
    destroy() {
      lastCue = -1;
      glyphs = [];
      canvas.width = 1;
      canvas.height = 1;
    },
  };
}
