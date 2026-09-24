/**
 * interludes.ts —《反乌托邦 Pt.2》器乐间奏与无唱词段落纯矢量渲染器
 * 负责前奏电台开机、独奏过渡、花朵器乐段与尾声画面。
 */
import {
  TAU,
  clamp,
  drawBloomingFlower,
  drawCitySkyline,
  drawGuitarStaves,
  drawHeadphoneCableFlow,
  drawIndustrialGears,
  drawMechanicalHeart,
  drawSunbeamWindow,
  hairline,
  ink,
  speedLines,
  type Stage,
} from "./draw";
import { getActAt } from "./score";

export function drawInterlude(
  stage: Stage,
  time: number,
  reducedMotion: boolean,
) {
  const { ctx, w, h, u } = stage;
  const act = getActAt(time);

  // 清空底色
  ctx.fillStyle = "#04070a";
  ctx.fillRect(-10, -10, w + 20, h + 20);

  // 1. 根据不同乐段绘制纯矢量宏观背景动效
  if (time < 18) {
    // 前奏：阴霾工业城市轮廓与扫射探照灯
    drawCitySkyline(stage, 0.55);
  } else if (time >= 90 && time < 102) {
    // 第 II 幕尾声吉他与花朵器乐独奏段：天窗晨光与晶莹花朵
    drawSunbeamWindow(stage, 0.6);
    drawBloomingFlower(stage, w * 0.5, h * 0.65, u * 0.16, 1.0);
  } else if (time >= 150 && time < 160) {
    // 高潮激昂过渡：旋转齿轮与放射状电光
    drawIndustrialGears(stage, w * 0.5, h * 0.5, u * 0.2, 1.4, 18);
    speedLines(stage, 28, "radial", "#38bdf8", 0.4);
  } else if (time >= 180) {
    // 尾声落幕：晨光破晓与平静心脏
    drawCitySkyline(stage, 0.3);
    drawSunbeamWindow(stage, 0.55);
    drawMechanicalHeart(stage, w * 0.5, h * 0.62, u * 0.12, 0.6);
  } else {
    drawCitySkyline(stage, 0.35);
  }

  // 2. 耳机线能量流（纵贯画面的生命音频线）
  const cordY = h * 0.48;
  drawHeadphoneCableFlow(
    stage,
    w * 0.06,
    cordY - u * 0.1,
    w * 0.94,
    cordY + u * 0.1,
    2.4,
    time > 90 && time < 102 ? "#fef08a" : "#38bdf8",
  );

  // 3. 实时音频示波器正弦脉冲
  const wavePoints: number[][] = [];
  const waveSteps = 60;
  for (let s = 0; s <= waveSteps; s += 1) {
    const px = (s / waveSteps) * w;
    const freq = 4.5;
    const amp = u * (reducedMotion ? 0.015 : 0.035 + Math.sin(time * 3) * 0.015);
    const py = cordY + Math.sin((s / waveSteps) * freq * TAU + (reducedMotion ? 0 : time * 4)) * amp;
    wavePoints.push([px, py]);
  }
  hairline(stage, wavePoints, "#38bdf8", 0.5, 2);

  // 4. 动态声谱柱（吉他律动）
  if (time >= 35 && time < 165 && !(time >= 90 && time < 102)) {
    drawGuitarStaves(stage, w * 0.5, h * 0.76, w * 0.8);
  }

  // 5. 电影感文字排版
  if (time < 8) {
    // 工业终端开机广播
    const bootProgress = clamp(time / 7.5);
    ink(stage, "SECTOR 07 // NEURAL LINK ESTABLISHED", w * 0.5, h * 0.35, u * 0.022, {
      mono: true,
      color: "#34d399",
      alpha: 0.85,
    });
    ink(stage, "DYSTOPIA PT.2", w * 0.5, h * 0.45, u * 0.09, {
      weight: 900,
      color: "#ffffff",
      glow: "#34d399",
      glowBlur: 16,
    });
    ink(stage, "07号工业车间广播 · 信号接收中...", w * 0.5, h * 0.55, u * 0.026, {
      color: "#94a3b8",
      alpha: 0.75,
    });

    hairline(
      stage,
      [
        [w * 0.3, h * 0.62],
        [w * 0.3 + w * 0.4 * bootProgress, h * 0.62],
      ],
      "#38bdf8",
      0.9,
      3,
    );
  } else if (time >= 90 && time < 102) {
    ink(stage, "8 HOURS BLOOMING // 乌托邦构想", w * 0.5, h * 0.34, u * 0.028, {
      mono: true,
      color: "#fef08a",
      glow: "#fef08a",
      glowBlur: 12,
    });
    ink(stage, "即便身处工厂，也要在心头种下光明", w * 0.5, h * 0.42, u * 0.045, {
      serif: true,
      color: "#ffffff",
      alpha: 0.9,
    });
  } else if (time >= 180) {
    ink(stage, "TRANSMISSION COMPLETED", w * 0.5, h * 0.38, u * 0.035, {
      mono: true,
      color: "#94a3b8",
      alpha: 0.8,
    });
    ink(stage, "在这反乌托邦里 · 活下去", w * 0.5, h * 0.48, u * 0.065, {
      weight: 900,
      color: "#fed7aa",
      glow: "#a78bfa",
      glowBlur: 18,
    });
  } else {
    ink(stage, `${act.code} · ${act.title}`, w * 0.5, h * 0.42, u * 0.04, {
      mono: true,
      color: "#94a3b8",
      alpha: 0.75,
    });
  }
}
