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
import { loadTracks, musicConfig, type TrackInfo } from "@/lib/music-config";
import { cn } from "@/lib/utils";

const PERCENT_MAX = 100;

/**
 * Floating music player.
 *
 * - Pinned bottom-right; collapsed = pill button, expanded = compact card.
 * - Backed by a single <audio> element + local audio files from
 *   src/assets/Musics/.
 * - ID3 tags (title, artist, cover art) are read at runtime via jsmediatags.
 * - No autoplay (browser policies block it anyway); user clicks play.
 * - Graceful fallback: if loading fails, the player hides itself instead of
 *   rendering an empty/broken control panel.
 */
export function MusicPlayer() {
  const { pathname } = useLocation();
  const isPostPage = pathname.startsWith("/posts/");

  const [tracks, setTracks] = useState<TrackInfo[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressRatio, setProgressRatio] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!musicConfig.enable) return;

    let shouldSync = true;

    loadTracks()
      .then((playlist) => {
        if (shouldSync) setTracks(playlist);
      })
      .catch(() => {
        if (shouldSync) setLoadFailed(true);
      });

    return () => {
      shouldSync = false;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncTime = () => {
      const duration = audio.duration || 0;
      setCurrentSeconds(audio.currentTime);
      setProgressRatio(duration ? audio.currentTime / duration : 0);
    };
    const syncDuration = () => setDurationSeconds(audio.duration || 0);
    const playNextTrack = () => {
      if (!tracks) return;
      setTrackIndex((currentIndex) => getWrappedIndex(currentIndex + 1, tracks.length));
    };

    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("ended", playNextTrack);

    return () => {
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("ended", playNextTrack);
    };
  }, [tracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !tracks) return;

    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, trackIndex, tracks]);

  if (isPostPage || !musicConfig.enable || loadFailed || !tracks || tracks.length === 0) {
    return null;
  }

  const track = tracks[trackIndex];
  const progressPercent = toPercent(progressRatio);

  const togglePlay = () => setIsPlaying((playing) => !playing);
  const playNext = () => setTrackIndex((index) => getWrappedIndex(index + 1, tracks.length));
  const playPrevious = () => setTrackIndex((index) => getWrappedIndex(index - 1, tracks.length));
  const toggleMute = () => {
    setIsMuted((muted) => {
      const audio = audioRef.current;
      if (audio) audio.muted = !muted;
      return !muted;
    });
  };

  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !durationSeconds) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const clickOffset = event.clientX - bounds.left;
    const nextRatio = clamp(clickOffset / bounds.width, 0, 1);
    audio.currentTime = nextRatio * durationSeconds;
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      <audio ref={audioRef} src={track.url} preload="metadata" />

      {isOpen ? (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[320px] max-w-[320px] overflow-hidden border-2 border-ink bg-paper shadow-[0_8px_24px_-8px_rgba(20,16,12,0.25)] animate-fade-in dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 border-b-2 border-ink bg-ink p-3 text-paper">
            <div className="relative h-12 w-12 flex-none overflow-hidden border border-paper/30 bg-ink-strong">
              {track.pic && (
                <img
                  src={track.pic}
                  alt=""
                  className={cn(
                    "h-full w-full object-cover",
                    isPlaying && "animate-[spin_8s_linear_infinite]",
                  )}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[14px] font-semibold text-paper">
                {track.name}
              </p>
              <p className="truncate font-ui text-[11px] font-medium uppercase text-paper/60">
                {track.artist}
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
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
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
              {trackIndex + 1}/{tracks.length}
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
              isPlaying && "animate-pulse",
            )}
          >
            <Music2 className="h-3 w-3" />
          </span>
          <span className="max-w-[140px] truncate">
            {isPlaying ? track.name : "Radio · 听点什么"}
          </span>
        </button>
      )}
    </div>
  );
}

function getWrappedIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
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
