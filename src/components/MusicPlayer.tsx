import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronDown,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { nowPlaying } from "@/lib/music-controller";
import { musicConfig } from "@/lib/music-config";
import { cn } from "@/lib/utils";

const PERCENT_MAX = 100;

/**
 * Floating music player — shares the same audio controller as NowPlaying
 * so that both UI surfaces stay in sync.
 */
export function MusicPlayer() {
  const { pathname } = useLocation();
  const isPostPage = pathname.startsWith("/posts/");

  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Subscribe to controller state changes
  const [, setTick] = useState(0);
  useEffect(() => nowPlaying.subscribe(() => setTick((t) => t + 1)), []);

  // Progress / duration polling via RAF
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragRatio, setDragRatio] = useState<number | null>(null);
  const [progressRatio, setProgressRatio] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const rafRef = useRef<number | null>(null);

  const track = nowPlaying.currentTrack;
  const trackUrl = track?.url;
  const prevTrackUrlRef = useRef<string | undefined>(trackUrl);
  const [snapToZero, setSnapToZero] = useState(false);

  // 当曲目切换时，立即瞬间归零，彻底关闭 CSS 动画，杜绝卡顿回缩
  useEffect(() => {
    if (trackUrl !== prevTrackUrlRef.current) {
      prevTrackUrlRef.current = trackUrl;
      setCurrentSeconds(0);
      setProgressRatio(0);
      setDurationSeconds(0);
      setDragRatio(null);
      setSnapToZero(true);
      const timer = setTimeout(() => {
        setSnapToZero(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [trackUrl]);

  useEffect(() => {
    const loop = () => {
      const audio = nowPlaying.audio;
      if (audio && trackUrl) {
        // 确保底层 audio.src 已完成切换，避免读到上一首尚未卸载时的残余播放时间
        const isCurrentAudio = audio.src.includes(encodeURI(trackUrl)) || audio.src.includes(trackUrl);
        if (isCurrentAudio) {
          const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
          const cur = Number.isFinite(audio.currentTime) && audio.currentTime >= 0 ? audio.currentTime : 0;
          setDurationSeconds(dur);
          if (!isDraggingRef.current) {
            setCurrentSeconds(cur);
            setProgressRatio(dur > 0 ? clamp(cur / dur, 0, 1) : 0);
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trackUrl]);

  const getRatioFromPointer = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const bounds = trackRef.current.getBoundingClientRect();
    if (bounds.width <= 0) return 0;
    return clamp((clientX - bounds.left) / bounds.width, 0, 1);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const audio = nowPlaying.audio;
    if (!audio || !durationSeconds) return;

    event.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);

    const initialRatio = getRatioFromPointer(event.clientX);
    setDragRatio(initialRatio);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const r = getRatioFromPointer(moveEvent.clientX);
      setDragRatio(r);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      isDraggingRef.current = false;
      setIsDragging(false);

      const finalRatio = getRatioFromPointer(upEvent.clientX);
      setDragRatio(null);
      if (audio && durationSeconds > 0) {
        const targetTime = finalRatio * durationSeconds;
        audio.currentTime = targetTime;
        setCurrentSeconds(targetTime);
        setProgressRatio(finalRatio);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = nowPlaying.audio;
    if (!audio || !durationSeconds) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const nextTime = Math.max(0, audio.currentTime - 5);
      audio.currentTime = nextTime;
      setCurrentSeconds(nextTime);
      setProgressRatio(nextTime / durationSeconds);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextTime = Math.min(durationSeconds, audio.currentTime + 5);
      audio.currentTime = nextTime;
      setCurrentSeconds(nextTime);
      setProgressRatio(nextTime / durationSeconds);
    }
  };

  if (
    isPostPage ||
    !musicConfig.enable ||
    nowPlaying.error ||
    !nowPlaying.tracks ||
    nowPlaying.tracks.length === 0
  ) {
    return null;
  }

  const activeRatio = dragRatio !== null ? dragRatio : progressRatio;
  const displayCurrentTime = dragRatio !== null ? dragRatio * durationSeconds : currentSeconds;
  const progressPercent = toPercent(activeRatio);

  const togglePlay = () => nowPlaying.togglePlay();
  const playNext = () => nowPlaying.next();
  const playPrevious = () => nowPlaying.prev();
  const toggleMute = () => {
    const audio = nowPlaying.audio;
    if (!audio) return;
    setIsMuted((muted) => {
      audio.muted = !muted;
      return !muted;
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {isOpen ? (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[320px] max-w-[320px] overflow-hidden border-2 border-ink bg-paper shadow-[0_8px_24px_-8px_rgba(20,16,12,0.25)] animate-fade-in dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 border-b-2 border-ink bg-ink p-3 text-paper">
            <div className="relative h-12 w-12 flex-none border border-paper/30 bg-ink-strong p-1.5">
              {track?.pic && (
                <div className="relative h-full w-full overflow-hidden rounded-full border border-paper/30">
                  <img
                    src={track.pic}
                    alt=""
                    className={cn(
                      "h-full w-full rounded-full object-cover",
                      nowPlaying.isPlaying && "animate-[spin_8s_linear_infinite]",
                    )}
                  />
                  <span className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/50 bg-ink" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[14px] font-semibold text-paper">
                {track?.name}
              </p>
              <p className="truncate font-ui text-[11px] font-medium uppercase text-paper/60">
                {track?.artist}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center text-paper/70 hover:text-paper"
              aria-label="收起播放器"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 pt-2">
            {/* 可点击与拖动拖拽的进度条热区，具有充裕的上下 24px 交互高度 */}
            <div
              ref={trackRef}
              onPointerDown={handlePointerDown}
              onKeyDown={handleKeyDown}
              className="group relative flex h-6 cursor-pointer touch-none select-none items-center"
              role="slider"
              aria-valuemin={0}
              aria-valuemax={PERCENT_MAX}
              aria-valuenow={Math.round(progressPercent)}
              tabIndex={0}
            >
              {/* 底层进度槽 */}
              <div className="relative h-1.5 w-full rounded-full bg-paper-warm transition-all duration-150 group-hover:h-2">
                {/* 填充进度条：从起点无缝覆盖到当前进度 */}
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-stamp"
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />

                {/* 游标拖动手柄：圆心严格对齐进度条末端，杜绝断层与缝隙 */}
                <div
                  className={cn(
                    "pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stamp shadow-sm",
                    !snapToZero && "transition-transform duration-100",
                    isDragging ? "h-3.5 w-3.5 scale-110" : "h-2.5 w-2.5 scale-0 group-hover:scale-100",
                  )}
                  style={{
                    left: `${progressPercent}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between font-ui text-[11px] font-medium uppercase text-ink-muted">
              <span>{formatDuration(displayCurrentTime)}</span>
              <span>{formatDuration(durationSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3">
            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex h-8 w-8 items-center justify-center text-ink-muted hover:text-stamp"
              aria-label={isMuted ? "取消静音" : "静音"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={playPrevious}
                className="inline-flex h-9 w-9 items-center justify-center text-ink hover:text-stamp"
                aria-label="上一曲"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex h-10 w-10 items-center justify-center bg-ink text-paper transition-colors hover:bg-stamp"
                aria-label={nowPlaying.isPlaying ? "暂停" : "播放"}
              >
                {nowPlaying.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={playNext}
                className="inline-flex h-9 w-9 items-center justify-center text-ink hover:text-stamp"
                aria-label="下一曲"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <span className="font-ui text-[11px] font-medium uppercase text-ink-muted">
              {nowPlaying.trackIndex + 1}/{nowPlaying.tracks?.length}
            </span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-9 items-center gap-2 border border-rule bg-paper/95 px-3.5 font-ui text-[11px] font-semibold uppercase text-ink shadow-[0_6px_16px_-12px_rgba(20,16,12,0.45)] transition-all hover:border-stamp/50 hover:bg-paper-warm hover:text-stamp dark:shadow-[0_6px_16px_-12px_rgba(0,0,0,0.55)]"
          aria-label="打开音乐播放器"
        >
          <span
            className={cn(
              "inline-flex h-[18px] w-[18px] items-center justify-center bg-stamp text-paper",
              nowPlaying.isPlaying && "animate-pulse",
            )}
          >
            <Music2 className="h-3 w-3" />
          </span>
          <span className="max-w-[140px] truncate">
            {nowPlaying.isPlaying ? track?.name : "Radio · 听点什么"}
          </span>
        </button>
      )}
    </div>
  );
}

function toPercent(ratio: number): number {
  return clamp(ratio * PERCENT_MAX, 0, PERCENT_MAX);
}

function formatDuration(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const restSeconds = Math.floor(safeSeconds % 60);
  return `${minutes}:${restSeconds.toString().padStart(2, "0")}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
