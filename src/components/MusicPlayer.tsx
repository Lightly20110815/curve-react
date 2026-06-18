import { useEffect, useRef, useState } from "react";
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
  const [progressRatio, setProgressRatio] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = () => {
      const audio = nowPlaying.audio;
      if (audio) {
        const dur = audio.duration || 0;
        setCurrentSeconds(audio.currentTime);
        setProgressRatio(dur ? audio.currentTime / dur : 0);
        setDurationSeconds(dur);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (
    isPostPage ||
    !musicConfig.enable ||
    nowPlaying.error ||
    !nowPlaying.tracks ||
    nowPlaying.tracks.length === 0
  ) {
    return null;
  }

  const track = nowPlaying.currentTrack;
  const progressPercent = toPercent(progressRatio);

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

  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = nowPlaying.audio;
    if (!audio || !durationSeconds) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const clickOffset = event.clientX - bounds.left;
    const nextRatio = clamp(clickOffset / bounds.width, 0, 1);
    audio.currentTime = nextRatio * durationSeconds;
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {isOpen ? (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[320px] max-w-[320px] overflow-hidden border-2 border-ink bg-paper shadow-[0_8px_24px_-8px_rgba(20,16,12,0.25)] animate-fade-in dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 border-b-2 border-ink bg-ink p-3 text-paper">
            <div className="relative h-12 w-12 flex-none overflow-hidden border border-paper/30 bg-ink-strong">
              {track?.pic && (
                <img
                  src={track.pic}
                  alt=""
                  className={cn(
                    "h-full w-full object-cover",
                    nowPlaying.isPlaying && "animate-[spin_8s_linear_infinite]",
                  )}
                />
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

          <div className="px-4 pt-3">
            <div
              className="h-1 cursor-pointer bg-paper-warm"
              onClick={seek}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={PERCENT_MAX}
              aria-valuenow={Math.round(progressPercent)}
              tabIndex={0}
            >
              <div
                className="h-full bg-stamp transition-[width] duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-ui text-[11px] font-medium uppercase text-ink-muted">
              <span>{formatDuration(currentSeconds)}</span>
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
