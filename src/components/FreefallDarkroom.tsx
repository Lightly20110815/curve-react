import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createFreefallRenderer } from "./freefall/renderer";
import { acts } from "./freefall/score";
import "./freefall/darkroom.css";

type PlaybackState = "playing" | "paused" | "waiting" | "ended" | "error";

/** 高精度时间码格式化：01:23.45 */
function formatPreciseTime(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "00:00.00";
  const mins = Math.floor(value / 60);
  const secs = Math.floor(value % 60);
  const centis = Math.floor((value % 1) * 100);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

export default function FreefallDarkroom({
  audioRef,
  onClose,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef(onClose);
  const mountedRef = useRef(false);
  const exitingRef = useRef(false);
  const controlsFocusedRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const exitTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const transientTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [playback, setPlayback] = useState<PlaybackState>("paused");
  const [, setHasStarted] = useState(false);
  const [clock, setClock] = useState(0);
  const [duration, setDuration] = useState(0);
  const [, setIsFullscreen] = useState(false);
  const [crtEffect] = useState(true);
  const [transientFeedback, setTransientFeedback] = useState<string | null>(null);

  closeRef.current = onClose;

  const showTransient = useCallback((text: string) => {
    clearTimeout(transientTimerRef.current);
    setTransientFeedback(text);
    transientTimerRef.current = setTimeout(() => {
      setTransientFeedback(null);
    }, 1200);
  }, []);

  const revealControls = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    setControlsVisible(true);
    hideTimerRef.current = setTimeout(() => {
      if (!controlsFocusedRef.current && playback === "playing") {
        setControlsVisible(false);
      }
    }, 2400);
  }, [playback]);

  const handleExit = useCallback((immediately = false) => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    if (document.fullscreenElement === dialogRef.current) void document.exitFullscreen();
    audioRef.current?.pause();
    setExiting(true);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (immediately || reduceMotion) closeRef.current();
    else exitTimerRef.current = setTimeout(() => closeRef.current(), 180);
  }, [audioRef]);

  const play = useCallback(async (fromStart = false) => {
    const audio = audioRef.current;
    if (!audio || exitingRef.current) return;
    setPlayback("waiting");
    revealControls();
    try {
      if (fromStart) audio.currentTime = 0;
      else if (audio.ended) audio.currentTime = 8; // 重播同样跳过前奏
      await audio.play();
      if (mountedRef.current && !exitingRef.current) setHasStarted(true);
    } catch {
      if (mountedRef.current && !exitingRef.current) {
        setPlayback("paused");
      }
    }
  }, [audioRef, revealControls]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || exitingRef.current) return;
    if (audio.paused || audio.ended) {
      void play();
      // 播放开始：直接清除中央气泡，不显示 "PLAY"
      clearTimeout(transientTimerRef.current);
      setTransientFeedback(null);
    } else {
      audio.pause();
      showTransient("PAUSE ❚❚");
    }
    revealControls();
  }, [audioRef, play, revealControls, showTransient]);

  const nudge = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + delta));
    setClock(audio.currentTime);
    showTransient(delta > 0 ? `+${delta}s ⏩` : `${delta}s ⏪`);
    revealControls();
  }, [audioRef, revealControls, showTransient]);

  const jumpToTime = useCallback((targetTime: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(audio.duration, Math.max(0, targetTime));
    setClock(audio.currentTime);
    revealControls();
  }, [audioRef, revealControls]);

  const seekFromPointer = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / Math.max(1, bounds.width)));
    audio.currentTime = ratio * audio.duration;
    setClock(audio.currentTime);
    revealControls();
  }, [audioRef, revealControls]);

  const toggleFullscreen = useCallback(() => {
    const element = dialogRef.current;
    if (!element) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void element.requestFullscreen?.();
    revealControls();
  }, [revealControls]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    dialog?.focus({ preventScroll: true });
    // 跳过 0–8s 的耳机线注入心脏前奏，开幕直接进入「自由落体」砸屏
    if (audioRef.current && audioRef.current.currentTime < 1) {
      audioRef.current.currentTime = 8;
    }
    const entryFrame = requestAnimationFrame(() => setEntered(true));
    revealControls();

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(entryFrame);
      clearTimeout(hideTimerRef.current);
      clearTimeout(exitTimerRef.current);
      clearTimeout(transientTimerRef.current);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [revealControls]);

  // Canvas 逐帧渲染与音频时钟监听
  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas) return;

    let renderer: ReturnType<typeof createFreefallRenderer>;
    try {
      renderer = createFreefallRenderer(canvas);
    } catch {
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let frameId = 0;
    let destroyed = false;

    const syncClock = () => {
      if (!audio) return;
      setClock(audio.currentTime);
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };

    const draw = () => {
      if (!destroyed && !document.hidden) {
        renderer.render(audio?.currentTime ?? 0, reducedMotion);
      }
    };

    const canRun = () => Boolean(
      audio && !audio.paused && !audio.ended &&
      !reducedMotion && !document.hidden && !exitingRef.current,
    );

    const tick = () => {
      frameId = 0;
      if (!canRun()) return;
      draw();
      frameId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frameId && canRun()) frameId = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const sync = () => {
      if (!audio) return;
      if (audio.ended) {
        setPlayback("ended");
        stop();
        revealControls();
      } else if (audio.paused) {
        setPlayback("paused");
        stop();
      } else {
        setPlayback("playing");
        setHasStarted(true);
        start();
      }
      draw();
      syncClock();
    };

    const onPlaying = () => {
      sync();
      revealControls();
    };
    const onPause = () => {
      sync();
      revealControls();
    };
    const onTimeUpdate = () => {
      syncClock();
      if (!canRun()) draw();
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      renderer.resize(bounds.width, bounds.height, Math.min(window.devicePixelRatio || 1, 2));
      draw();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", resize);

    audio?.addEventListener("playing", onPlaying);
    audio?.addEventListener("pause", onPause);
    audio?.addEventListener("timeupdate", onTimeUpdate);
    audio?.addEventListener("ended", sync);

    resize();
    sync();

    return () => {
      destroyed = true;
      stop();
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      audio?.removeEventListener("playing", onPlaying);
      audio?.removeEventListener("pause", onPause);
      audio?.removeEventListener("timeupdate", onTimeUpdate);
      audio?.removeEventListener("ended", sync);
      renderer.destroy();
    };
  }, [audioRef, revealControls]);

  const isPlaying = playback === "playing";
  const showControls = controlsVisible || !isPlaying;
  const progress = duration > 0 ? Math.min(1, Math.max(0, clock / duration)) : 0;

  return createPortal(
    <div
      ref={dialogRef}
      className="pv-theater"
      role="dialog"
      aria-modal="true"
      aria-label="依菲雅 · 自由落体文字 PV"
      tabIndex={-1}
      data-entered={entered && !exiting}
      data-exiting={exiting}
      data-controls={showControls}
      onPointerMove={revealControls}
      onPointerDown={revealControls}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          handleExit(true);
        } else if (event.code === "Space" && !(event.target instanceof HTMLButtonElement)) {
          event.preventDefault();
          event.stopPropagation();
          if (!event.repeat) togglePlayback();
        } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          event.stopPropagation();
          nudge(event.key === "ArrowRight" ? 5 : -5);
        } else if (event.key.toLowerCase() === "f") {
          event.preventDefault();
          toggleFullscreen();
        } else if (event.key >= "1" && event.key <= "4") {
          const actIndex = parseInt(event.key, 10) - 1;
          if (acts[actIndex]) {
            jumpToTime(acts[actIndex].start);
            showTransient(`${acts[actIndex].roman} : ${acts[actIndex].title}`);
          }
        }
      }}
    >
      {/* 核心渲染画布 */}
      <canvas
        ref={canvasRef}
        className="pv-theater__canvas"
        aria-hidden="true"
        onClick={togglePlayback}
      />

      {/* 胶片质感与 CRT 扫描线覆层 */}
      {crtEffect && <div className="pv-theater__scanlines" aria-hidden="true" />}
      <div className="pv-theater__vignette" aria-hidden="true" />

      {/* 瞬态操作反馈气泡 (PLAY / PAUSE / SEEK) */}
      {transientFeedback && (
        <div className="pv-theater__transient" aria-live="polite">
          <span>{transientFeedback}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 顶部 PV 监视器抬头 HUD                                                      */}
      {/* ========================================================================= */}
      <header className="pv-theater__header">
        <div className="pv-theater__brand">
          <span className="pv-theater__rec-dot" data-live={isPlaying} />
          <span className="pv-theater__brand-title">EPHEIA ARCHIVE // 依菲雅档案</span>
          <span className="pv-theater__badge">TRACK 04 · FREEFALL</span>
          <span className="pv-theater__spec">FLAC 48kHz / 24bit</span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 底部胶片刻度条与控制台 HUD                                                  */}
      {/* ========================================================================= */}
      <footer className="pv-theater__footer">
        <div className="pv-theater__transport-bar">
          {/* 左侧：专业时间码高精显示 */}
          <div className="pv-theater__timecode">
            <span className="pv-theater__time-cur">{formatPreciseTime(clock)}</span>
            <span className="pv-theater__time-sep">/</span>
            <span className="pv-theater__time-total">{formatPreciseTime(duration)}</span>
          </div>
        </div>

        {/* 底部胶片刻度导轨进度条 */}
        <div
          className="pv-theater__film-rail"
          role="slider"
          tabIndex={0}
          aria-label="放映时间轴刻度"
          aria-valuemin={0}
          aria-valuemax={Math.max(1, Math.round(duration))}
          aria-valuenow={Math.round(clock)}
          onClick={seekFromPointer}
        >
          {/* 幕次章节节点标记 */}
          {duration > 0 && acts.map((actItem) => {
            const markPos = Math.min(1, actItem.start / duration);
            return (
              <div
                key={actItem.act}
                className="pv-theater__chapter-mark"
                style={{ left: `${markPos * 100}%` }}
                title={`${actItem.roman}: ${actItem.title}`}
              />
            );
          })}
          {/* 播放进度填色 */}
          <div className="pv-theater__rail-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </footer>
    </div>,
    document.body,
  );
}
