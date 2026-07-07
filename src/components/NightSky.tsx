/**
 * 活的夜空 — 首页招牌。
 *
 * 夜主题：静态星点微微闪烁 + 十来只萤火虫缓慢漂移 + 按真实日期
 * 推算的月相。晨主题：canvas 退场，只留 CSS 晨雾渐变。
 *
 * 性能与可及性：
 * - rAF 循环仅在元素可见（IntersectionObserver）且非 reduced-motion 时运行
 * - prefers-reduced-motion → 只画一帧静态星空
 * - 全部绘制在单个 canvas，不产生 DOM 动画
 */
import { useEffect, useRef } from "react";
import { getMoonPhase } from "@/lib/garden-time";
import { useTheme } from "@/hooks/useTheme";

interface Star {
  x: number; // 0..1 比例坐标
  y: number;
  r: number;
  phase: number; // 闪烁相位
  speed: number;
}

interface Firefly {
  x: number;
  y: number;
  baseY: number;
  vx: number;
  amp: number; // 垂直摆动幅度
  phase: number;
  r: number;
  blink: number; // 亮度呼吸相位
}

const STAR_COUNT = 110;
const FIREFLY_COUNT = 13;

function makeStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random(),
    y: Math.random() * 0.82,
    r: Math.random() < 0.85 ? Math.random() * 0.9 + 0.4 : Math.random() * 1.4 + 1,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.6 + 0.2,
  }));
}

function makeFireflies(): Firefly[] {
  return Array.from({ length: FIREFLY_COUNT }, () => ({
    x: Math.random(),
    y: 0,
    baseY: 0.45 + Math.random() * 0.5,
    vx: (Math.random() * 0.014 + 0.006) * (Math.random() < 0.5 ? -1 : 1),
    amp: 0.02 + Math.random() * 0.05,
    phase: Math.random() * Math.PI * 2,
    r: 1.2 + Math.random() * 1.4,
    blink: Math.random() * Math.PI * 2,
  }));
}

function drawMoon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
) {
  const { phase } = getMoonPhase();
  ctx.save();

  // 月晕
  const halo = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 3.4);
  halo.addColorStop(0, "rgba(242, 239, 230, 0.16)");
  halo.addColorStop(1, "rgba(242, 239, 230, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 3.4, 0, Math.PI * 2);
  ctx.fill();

  // 月面
  ctx.fillStyle = "rgba(240, 236, 224, 0.92)";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // 阴影盘：沿 x 偏移画一个页面色圆，形成盈亏
  // phase 0=新月(全暗) 0.5=满月(全亮)
  const lit = (1 - Math.cos(phase * 2 * Math.PI)) / 2; // 0..1
  if (lit < 0.985) {
    // 盈月（上半月）亮面在右，阴影往左退；亏月（下半月）亮面在左，阴影往右退
    const dir = phase < 0.5 ? -1 : 1;
    // lit=0 阴影完全盖住（新月），lit→1 阴影移出月面（满月）
    const offset = dir * lit * radius * 2.05;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx + offset, cy - radius * 0.12, radius * 1.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.restore();
}

export function NightSky({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== "night") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const stars = makeStars();
    const fireflies = makeFireflies();
    let raf = 0;
    let visible = true;
    let running = false;
    let t = Math.random() * 1000;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame() {
      if (!canvas || !ctx) return;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      // 星
      for (const s of stars) {
        const tw = reduceMotion
          ? 0.75
          : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
        ctx.fillStyle = `rgba(226, 230, 240, ${0.35 * tw + 0.2})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 月 — 右上角
      drawMoon(ctx, w * 0.82, h * 0.3, Math.min(26, w * 0.035));

      // 萤火虫
      if (!reduceMotion) {
        for (const f of fireflies) {
          f.x += f.vx * 0.016;
          if (f.x > 1.05) f.x = -0.05;
          if (f.x < -0.05) f.x = 1.05;
          f.y = f.baseY + Math.sin(t * 0.7 + f.phase) * f.amp;
          const glow = 0.35 + 0.65 * Math.pow(Math.max(Math.sin(t * 0.9 + f.blink), 0), 2);

          const px = f.x * w;
          const py = f.y * h;
          const g = ctx.createRadialGradient(px, py, 0, px, py, f.r * 7);
          g.addColorStop(0, `rgba(242, 197, 124, ${0.5 * glow})`);
          g.addColorStop(1, "rgba(242, 197, 124, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, f.r * 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(250, 218, 160, ${0.55 + 0.45 * glow})`;
          ctx.beginPath();
          ctx.arc(px, py, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      t += 0.016;
    }

    function loop() {
      frame();
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    frame(); // 至少画一帧（reduced-motion 时就停在这帧）

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0.02 },
    );
    io.observe(canvas);

    const onResize = () => {
      resize();
      frame();
    };
    window.addEventListener("resize", onResize);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [theme]);

  if (theme !== "night") {
    // 晨 — 雾蓝渐变的早晨天空，安静无动效
    return (
      <div
        aria-hidden
        className={className}
        style={{
          background:
            "linear-gradient(180deg, #dfe6ef 0%, #ecf0f5 55%, var(--g-page) 100%)",
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        background:
          "linear-gradient(180deg, #060a16 0%, #0a0f1e 70%, var(--g-page) 100%)",
      }}
    />
  );
}
