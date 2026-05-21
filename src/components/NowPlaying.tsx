import { useEffect, useRef, useState } from "react";
import { buildMetingUrl, type MetingTrack } from "@/lib/music-config";

/**
 * Compact music-player widget for sidebars.
 *
 * Loads its own playlist from the Meting API and drives a hidden <audio> element.
 * Shows cover art, track name, artist, progress bar, and playback controls.
 */
export function NowPlaying() {
  const [tracks, setTracks] = useState<MetingTrack[] | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [coverUrl, setCoverUrl] = useState("");
  const [needsMarquee, setNeedsMarquee] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nameTextRef = useRef<HTMLSpanElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);

  const track = tracks?.[trackIndex];

  // Load playlist
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(buildMetingUrl(), { mode: "cors" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as unknown[];
        if (!Array.isArray(data) || data.length === 0) throw new Error("empty");
        const list = data.filter(isMetingTrack);
        if (!cancelled) setTracks(list);
      } catch (e) {
        console.warn("NowPlaying 加载播放列表失败：", e);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      setTrackIndex((i) => (tracks ? (i + 1) % tracks.length : 0));
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [tracks]);

  // Play / pause sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, trackIndex, track?.url]);

  // Update progress with RAF (throttled to ~1s)
  useEffect(() => {
    const loop = (ts: number) => {
      if (ts - lastUpdateRef.current > 1000) {
        const audio = audioRef.current;
        if (audio && audio.duration > 0) {
          setProgress(Math.round((audio.currentTime / audio.duration) * 1000) / 10);
        }
        lastUpdateRef.current = ts;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  // Check marquee when track changes
  useEffect(() => {
    setNeedsMarquee(false);
    const id = setTimeout(() => {
      if (wrapperRef.current && nameTextRef.current) {
        setNeedsMarquee(nameTextRef.current.offsetWidth > wrapperRef.current.offsetWidth - 4);
      }
      if (track?.pic) setCoverUrl(track.pic);
    }, 100);
    return () => clearTimeout(id);
  }, [track?.name, track?.pic]);

  if (!tracks || tracks.length === 0) return null;

  const togglePlay = () => setIsPlaying((p) => !p);
  const prevTrack = () => setTrackIndex((i) => (i - 1 + tracks.length) % tracks.length);
  const nextTrack = () => setTrackIndex((i) => (i + 1) % tracks.length);

  return (
    <div className="relative cursor-pointer overflow-hidden border border-[hsl(var(--rule-soft)/0.48)] bg-[hsl(var(--paper-soft))] p-3.5 shadow-sm transition-colors hover:border-[hsl(var(--stamp))]">
      {/* Progress background */}
      <div
        className="pointer-events-none absolute inset-0 origin-left bg-[hsl(var(--stamp))] opacity-[0.06] transition-transform duration-1000 ease-linear"
        style={{ transform: `scaleX(${progress / 100})` }}
      />

      <audio ref={audioRef} src={track?.url} preload="metadata" />

      <div className="relative z-10 flex items-center gap-3">
        {/* Cover */}
        <button
          type="button"
          onClick={togglePlay}
          className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-[hsl(var(--rule-soft)/0.48)] bg-[hsl(var(--paper-warm))] transition-colors ${
            isPlaying ? "animate-[spin_12s_linear_infinite] border-[hsl(var(--stamp))]" : ""
          }`}
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          {coverUrl ? (
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl">🎵</div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            {isPlaying ? (
              <PauseIcon className="h-[18px] w-[18px] text-white" />
            ) : (
              <PlayIcon className="h-[18px] w-[18px] text-white" />
            )}
          </div>
        </button>

        {/* Info */}
        <div className="min-w-0 flex-1" onClick={togglePlay} role="button">
          <div className="mb-0.5 flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                isPlaying ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-[hsl(var(--ink-muted))]"
              }`}
            />
            <span className="text-[0.7rem] font-medium tracking-wide text-[hsl(var(--ink-muted))] opacity-70">
              {isPlaying ? "正在播放" : "已暂停"}
            </span>
          </div>

          {/* Track name with optional marquee */}
          <div
            ref={wrapperRef}
            className={`overflow-hidden ${needsMarquee ? "[mask-image:linear-gradient(to_right,black_0%,black_88%,transparent_100%)]" : ""}`}
          >
            <div
              className={`text-[0.9rem] font-semibold leading-snug text-[hsl(var(--ink-body))] ${
                needsMarquee ? "inline-flex w-max animate-[marquee-scroll_8s_linear_infinite]" : "block truncate"
              }`}
              title={track?.name}
            >
              <span ref={nameTextRef} className="inline-block">
                {track?.name}
              </span>
              {needsMarquee ? (
                <span className="inline-block">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{track?.name}</span>
              ) : null}
            </div>
          </div>

          <p className="truncate text-[0.78rem] leading-snug text-[hsl(var(--ink-muted))]" title={track?.artist}>
            {track?.artist}
          </p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevTrack}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--ink-body))] opacity-60 transition hover:bg-[hsl(var(--stamp-soft))] hover:opacity-100"
            aria-label="上一首"
          >
            <PrevIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--stamp-soft))] text-[hsl(var(--ink-body))] opacity-80 transition hover:bg-[hsl(var(--stamp))] hover:text-white hover:opacity-100"
            aria-label={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="ml-0.5 h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={nextTrack}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--ink-body))] opacity-60 transition hover:bg-[hsl(var(--stamp-soft))] hover:opacity-100"
            aria-label="下一首"
          >
            <NextIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Visualizer */}
        {isPlaying ? (
          <div className="flex items-end gap-0.5" style={{ height: "14px" }}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-[3px] rounded-sm bg-[hsl(var(--stamp))] opacity-60"
                style={{
                  animation: "visualizer-bounce 0.8s ease-in-out infinite alternate",
                  animationDelay: `${(i + 1) * 0.15}s`,
                  height: ["4px", "8px", "6px", "10px"][i],
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function isMetingTrack(value: unknown): value is MetingTrack {
  if (!value || typeof value !== "object") return false;
  const t = value as Partial<Record<keyof MetingTrack, unknown>>;
  return (
    typeof t.name === "string" &&
    typeof t.artist === "string" &&
    typeof t.url === "string" &&
    typeof t.pic === "string"
  );
}

/* Inline SVG icons */
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function PrevIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  );
}

function NextIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}
