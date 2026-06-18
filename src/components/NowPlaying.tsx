import { useEffect, useRef, useState } from "react";
import { nowPlaying } from "@/lib/music-controller";

/**
 * Compact music-player widget for sidebars.
 *
 * The audio element is owned by the module-level nowPlaying controller
 * (music-controller.ts) and lives on document.body, so playback survives
 * the ContextMenu mount/unmount cycle.  This component is a pure UI shell
 * that reads/writes the controller.
 */
export function NowPlaying() {
  const [, setTick] = useState(0);

  useEffect(() => nowPlaying.subscribe(() => setTick((t) => t + 1)), []);

  const [needsMarquee, setNeedsMarquee] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");
  const nameTextRef = useRef<HTMLSpanElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Progress polling via RAF (throttled to ~1 s)
  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loop = (ts: number) => {
      if (nowPlaying.isPlaying && ts - lastUpdateRef.current > 1000) {
        setProgress(nowPlaying.getProgress());
        lastUpdateRef.current = ts;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Check marquee + cover when track changes
  const track = nowPlaying.currentTrack;
  useEffect(() => {
    setNeedsMarquee(false);
    const id = setTimeout(() => {
      if (wrapperRef.current && nameTextRef.current) {
        setNeedsMarquee(
          nameTextRef.current.offsetWidth > wrapperRef.current.offsetWidth - 4,
        );
      }
      if (track?.pic) setCoverUrl(track.pic);
    }, 100);
    return () => clearTimeout(id);
  }, [track?.name, track?.pic]);

  if (nowPlaying.isLoading) {
    return (
      <div className="flex h-[100px] items-center justify-center border border-[hsl(var(--rule-soft)/0.48)] bg-[hsl(var(--paper-soft))] p-3.5 text-[0.8rem] text-[hsl(var(--ink-muted))]">
        正在加载音乐...
      </div>
    );
  }

  if (nowPlaying.error || !nowPlaying.tracks || nowPlaying.tracks.length === 0) {
    return (
      <div className="flex h-[100px] items-center justify-center border border-[hsl(var(--rule-soft)/0.48)] bg-[hsl(var(--paper-soft))] p-3.5 text-[0.8rem] text-[hsl(var(--ink-muted))]">
        暂无音乐播放
      </div>
    );
  }

  return (
    <div className="relative cursor-pointer overflow-hidden border border-[hsl(var(--rule-soft)/0.48)] bg-[hsl(var(--paper-soft))] p-3.5 shadow-sm transition-colors hover:border-[hsl(var(--stamp))]">
      <div
        className="pointer-events-none absolute inset-0 origin-left bg-[hsl(var(--stamp))] opacity-[0.06] transition-transform duration-1000 ease-linear"
        style={{ transform: `scaleX(${progress / 100})` }}
      />

      <div className="relative z-10 flex items-center gap-3">
        <button
          type="button"
          onClick={() => nowPlaying.togglePlay()}
          className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-[hsl(var(--rule-soft)/0.48)] bg-[hsl(var(--paper-warm))] transition-colors ${
            nowPlaying.isPlaying
              ? "animate-[spin_12s_linear_infinite] border-[hsl(var(--stamp))]"
              : ""
          }`}
          aria-label={nowPlaying.isPlaying ? "暂停" : "播放"}
        >
          {coverUrl ? (
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl">🎵</div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            {nowPlaying.isPlaying ? (
              <PauseIcon className="h-[18px] w-[18px] text-white" />
            ) : (
              <PlayIcon className="h-[18px] w-[18px] text-white" />
            )}
          </div>
        </button>

        <div className="min-w-0 flex-1" onClick={() => nowPlaying.togglePlay()} role="button">
          <div className="mb-0.5 flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                nowPlaying.isPlaying
                  ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]"
                  : "bg-[hsl(var(--ink-muted))]"
              }`}
            />
            <span className="text-[0.7rem] font-medium tracking-wide text-[hsl(var(--ink-muted))] opacity-70">
              {nowPlaying.isPlaying ? "正在播放" : "已暂停"}
            </span>
          </div>

          <div
            ref={wrapperRef}
            className={`overflow-hidden ${
              needsMarquee
                ? "[mask-image:linear-gradient(to_right,black_0%,black_88%,transparent_100%)]"
                : ""
            }`}
          >
            <div
              className={`text-[0.9rem] font-semibold leading-snug text-[hsl(var(--ink-body))] ${
                needsMarquee
                  ? "inline-flex w-max animate-[marquee-scroll_8s_linear_infinite]"
                  : "block truncate"
              }`}
              title={track?.name}
            >
              <span ref={nameTextRef} className="inline-block">
                {track?.name}
              </span>
              {needsMarquee ? (
                <span className="inline-block">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{track?.name}
                </span>
              ) : null}
            </div>
          </div>

          <p
            className="truncate text-[0.78rem] leading-snug text-[hsl(var(--ink-muted))]"
            title={track?.artist}
          >
            {track?.artist}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => nowPlaying.prev()}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--ink-body))] opacity-60 transition hover:bg-[hsl(var(--stamp-soft))] hover:opacity-100"
            aria-label="上一首"
          >
            <PrevIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => nowPlaying.togglePlay()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--stamp-soft))] text-[hsl(var(--ink-body))] opacity-80 transition hover:bg-[hsl(var(--stamp))] hover:text-white hover:opacity-100"
            aria-label={nowPlaying.isPlaying ? "暂停" : "播放"}
          >
            {nowPlaying.isPlaying ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="ml-0.5 h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => nowPlaying.next()}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--ink-body))] opacity-60 transition hover:bg-[hsl(var(--stamp-soft))] hover:opacity-100"
            aria-label="下一首"
          >
            <NextIcon className="h-4 w-4" />
          </button>
        </div>

        {nowPlaying.isPlaying ? (
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
