import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createDystopiaRenderer } from "./dystopia/renderer";
import { acts, getActAt } from "./dystopia/score";
import "./dystopia/dystopia.css";

type Playback = "playing" | "paused" | "waiting" | "ended";

function fmt(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "00:00.00";
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  const c = Math.floor((value % 1) * 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(c).padStart(2, "0")}`;
}

const SEGMENTS = 96;

export default function DystopiaDarkroom({
  audioRef,
  onClose,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef(onClose);
  const exitingRef = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const exitTimer = useRef<ReturnType<typeof setTimeout>>();
  const transientTimer = useRef<ReturnType<typeof setTimeout>>();

  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [controls, setControls] = useState(true);
  const [playback, setPlayback] = useState<Playback>("paused");
  const [clock, setClock] = useState(0);
  const [duration, setDuration] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  closeRef.current = onClose;

  const showFeedback = useCallback((text: string) => {
    clearTimeout(transientTimer.current);
    setFeedback(text);
    transientTimer.current = setTimeout(() => setFeedback(null), 1200);
  }, []);

  const reveal = useCallback(() => {
    clearTimeout(hideTimer.current);
    setControls(true);
    hideTimer.current = setTimeout(() => {
      if (audioRef.current && !audioRef.current.paused) setControls(false);
    }, 2600);
  }, [audioRef]);

  const exit = useCallback(
    (immediately = false) => {
      if (exitingRef.current) return;
      exitingRef.current = true;
      if (document.fullscreenElement === dialogRef.current) void document.exitFullscreen();
      audioRef.current?.pause();
      setExiting(true);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (immediately || reduce) closeRef.current();
      else exitTimer.current = setTimeout(() => closeRef.current(), 220);
    },
    [audioRef],
  );

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || exitingRef.current) return;
    setPlayback("waiting");
    reveal();
    try {
      await audio.play();
    } catch {
      setPlayback("paused");
    }
  }, [audioRef, reveal]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || exitingRef.current) return;
    if (audio.paused || audio.ended) {
      if (audio.ended) audio.currentTime = 0;
      void play();
      setFeedback(null);
    } else {
      audio.pause();
      showFeedback("PAUSE ❚❚");
    }
    reveal();
  }, [audioRef, play, reveal, showFeedback]);

  const nudge = useCallback(
    (delta: number) => {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(audio.duration)) return;
      audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + delta));
      setClock(audio.currentTime);
      showFeedback(delta > 0 ? `FF +${delta}s` : `REW ${delta}s`);
      reveal();
    },
    [audioRef, reveal, showFeedback],
  );

  const seek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(audio.duration)) return;
      const b = e.currentTarget.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width));
      audio.currentTime = ratio * audio.duration;
      setClock(audio.currentTime);
      reveal();
    },
    [audioRef, reveal],
  );

  // 入场：从 0 开始（开机自检即前奏）
  useEffect(() => {
    const prevFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus({ preventScroll: true });
    const audio = audioRef.current;
    if (audio && audio.currentTime < 1) audio.currentTime = 0;
    const raf = requestAnimationFrame(() => setEntered(true));
    reveal();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer.current);
      clearTimeout(exitTimer.current);
      clearTimeout(transientTimer.current);
      document.body.style.overflow = prevOverflow;
      if (prevFocus?.isConnected) prevFocus.focus({ preventScroll: true });
    };
  }, [audioRef, reveal]);

  // 渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas) return;
    let renderer: ReturnType<typeof createDystopiaRenderer>;
    try {
      renderer = createDystopiaRenderer(canvas);
    } catch {
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let dead = false;

    const draw = () => {
      if (!dead && !document.hidden) renderer.render(audio?.currentTime ?? 0, reduce);
    };
    const canRun = () =>
      Boolean(audio && !audio.paused && !audio.ended && !reduce && !document.hidden && !exitingRef.current);
    const tick = () => {
      frame = 0;
      if (!canRun()) return;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && canRun()) frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => {
      if (!audio) return;
      if (audio.ended) {
        setPlayback("ended");
        stop();
      } else if (audio.paused) {
        setPlayback("paused");
        stop();
      } else {
        setPlayback("playing");
        start();
      }
      draw();
      setClock(audio.currentTime);
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onTime = () => {
      if (audio) {
        setClock(audio.currentTime);
        if (Number.isFinite(audio.duration)) setDuration(audio.duration);
      }
      if (!canRun()) draw();
    };
    const resize = () => {
      const b = canvas.getBoundingClientRect();
      renderer.resize(b.width, b.height, Math.min(window.devicePixelRatio || 1, 2));
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("resize", resize);
    audio?.addEventListener("playing", sync);
    audio?.addEventListener("pause", sync);
    audio?.addEventListener("timeupdate", onTime);
    audio?.addEventListener("ended", sync);
    resize();
    sync();
    return () => {
      dead = true;
      stop();
      ro.disconnect();
      window.removeEventListener("resize", resize);
      audio?.removeEventListener("playing", sync);
      audio?.removeEventListener("pause", sync);
      audio?.removeEventListener("timeupdate", onTime);
      audio?.removeEventListener("ended", sync);
      renderer.destroy();
    };
  }, [audioRef]);

  const isPlaying = playback === "playing";
  const showCtl = controls || !isPlaying;
  const progress = duration > 0 ? Math.min(1, Math.max(0, clock / duration)) : 0;
  const act = getActAt(clock || 0);

  return createPortal(
    <div
      ref={dialogRef}
      className="dp-theater"
      role="dialog"
      aria-modal="true"
      aria-label="反乌托邦 Pt.2 动画 PV"
      tabIndex={-1}
      data-entered={entered && !exiting}
      data-exiting={exiting}
      data-controls={showCtl}
      onPointerMove={reveal}
      onPointerDown={reveal}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          exit(true);
        } else if (e.code === "Space" && !(e.target instanceof HTMLButtonElement)) {
          e.preventDefault();
          if (!e.repeat) toggle();
        } else if (e.key === "ArrowRight") nudge(5);
        else if (e.key === "ArrowLeft") nudge(-5);
      }}
    >
      <canvas ref={canvasRef} className="dp-theater__screen" aria-hidden="true" onClick={toggle} />
      <div className="dp-theater__led" aria-hidden="true" />
      <div className="dp-theater__scanlines" aria-hidden="true" />
      <div className="dp-theater__flicker" aria-hidden="true" />
      <div className="dp-theater__vignette" aria-hidden="true" />

      {feedback && (
        <div className="dp-theater__transient" aria-live="polite">
          <span>{feedback}</span>
        </div>
      )}

      {!isPlaying && (
        <div className="dp-theater__gate" data-ended={playback === "ended"} onClick={toggle}>
          <div className="dp-theater__play" />
          <div className="dp-theater__gate-label">
            {playback === "ended" ? "TRANSMISSION END" : playback === "waiting" ? "SIGNALING…" : "反乌托邦 Pt.2"}
          </div>
          <div className="dp-theater__gate-sub">
            {playback === "ended" ? "点击重新播放 // REPLAY" : "点击 / 空格 开始 · 动画 PV"}
          </div>
        </div>
      )}

      <header className="dp-theater__hud dp-theater__hud--top">
        <div className="dp-theater__brand">
          <span className="dp-theater__rec" data-live={isPlaying} />
          <span className="dp-theater__title">SECTOR 07 // 反乌托邦 PT.2</span>
          <span className="dp-theater__badge">ANIMATED MUSIC PV</span>
        </div>
        <div className="dp-theater__readout">
          <span className="dp-theater__muted">{act.code}</span>
          <span>{act.title}</span>
          <span className="dp-theater__spec">CINEMATIC HIGH-DPI CANVAS</span>
        </div>
      </header>

      <footer className="dp-theater__hud dp-theater__hud--bottom">
        <div className="dp-theater__tc">
          <span className="dp-theater__tc-cur">{fmt(clock)}</span>
          <span className="dp-theater__tc-sep">/</span>
          <span className="dp-theater__tc-tot">{fmt(duration)}</span>
        </div>
        <div className="dp-theater__rail" role="slider" tabIndex={0} aria-label="播放进度" onClick={seek}>
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span
              key={i}
              className="dp-theater__rail-seg"
              data-on={i / SEGMENTS < progress}
              aria-hidden="true"
            />
          ))}
          {duration > 0 &&
            acts.map((a) => (
              <span
                key={a.code}
                className="dp-theater__rail-mark"
                style={{ left: `${Math.min(1, a.start / duration) * 100}%` }}
                title={`${a.code} ${a.title}`}
              />
            ))}
          <span className="dp-theater__rail-head" style={{ left: `calc(${progress * 100}% - 1px)` }} />
        </div>
        <div className="dp-theater__hint">
          <span>
            <kbd>SPACE</kbd>播放/暂停
            <kbd>←</kbd>
            <kbd>→</kbd>±5s
          </span>
          <span>概念原画 · 动态排版 · 矢量动效</span>
          <span>
            <kbd>ESC</kbd>离开暗房
          </span>
        </div>
      </footer>
    </div>,
    document.body,
  );
}
