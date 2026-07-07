/**
 * 夜半电台 — 右下角安静的圆形唱片。
 *
 * 收起时是一枚带封面的圆钮，播放中缓慢旋转；
 * 点开是一个小面板：曲名、歌手、上一首/播放/下一首。
 * 音频由模块级单例控制器托管，切页不断声。
 */
import { useEffect, useRef, useState } from "react";
import {
  MusicNotes,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
} from "@phosphor-icons/react";
import { musicConfig } from "@/lib/music-config";
import { nowPlaying } from "@/lib/music-controller";
import { cn } from "@/lib/utils";

export function MusicDock() {
  const [, forceRender] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = nowPlaying.subscribe(() => forceRender((n) => n + 1));
    // 播放/暂停状态由 audio 元素事件驱动
    const audio = nowPlaying.audio;
    const rerender = () => forceRender((n) => n + 1);
    audio?.addEventListener("play", rerender);
    audio?.addEventListener("pause", rerender);
    return () => {
      unsub();
      audio?.removeEventListener("play", rerender);
      audio?.removeEventListener("pause", rerender);
    };
  }, []);

  // 点击面板外部收起
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (!musicConfig.enable || nowPlaying.error) return null;

  const track = nowPlaying.currentTrack;
  const playing = nowPlaying.isPlaying;

  return (
    <div ref={panelRef} className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && track && (
        <div className="dock-panel-rise w-64 rounded-2xl border border-line bg-surface/95 p-4 shadow-[0_12px_40px_rgba(4,8,20,0.35)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[14.5px] text-ink-strong">{track.name}</p>
              <p className="mt-0.5 truncate font-mono text-[11px] text-mist">
                {track.artist || "未知歌手"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="收起电台"
              className="pressable -mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-mist hover:text-ink-strong"
            >
              <X size={15} weight="bold" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <DockControl label="上一首" onClick={() => nowPlaying.prev()}>
              <SkipBack size={17} weight="light" />
            </DockControl>
            <button
              type="button"
              onClick={() => nowPlaying.togglePlay()}
              aria-label={playing ? "暂停" : "播放"}
              className="pressable flex h-11 w-11 items-center justify-center rounded-full bg-firefly text-page transition-colors hover:bg-firefly-deep"
            >
              {playing ? (
                <Pause size={19} weight="fill" />
              ) : (
                <Play size={19} weight="fill" className="translate-x-[1px]" />
              )}
            </button>
            <DockControl label="下一首" onClick={() => nowPlaying.next()}>
              <SkipForward size={17} weight="light" />
            </DockControl>
          </div>

          <p className="mt-3 text-center font-mono text-[10.5px] tracking-wider text-mist">
            夜半电台 · {nowPlaying.trackIndex + 1} / {nowPlaying.tracks?.length ?? 0}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "收起夜半电台" : "打开夜半电台"}
        title="夜半电台"
        className={cn(
          "pressable flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-line bg-surface shadow-[0_8px_28px_rgba(4,8,20,0.35)]",
          "transition-colors hover:border-firefly/50",
        )}
      >
        {track?.pic ? (
          <img
            src={track.pic}
            alt=""
            className={cn("h-full w-full object-cover", playing && "disc-spin")}
          />
        ) : (
          <MusicNotes size={20} weight="light" className="text-firefly" />
        )}
      </button>
    </div>
  );
}

function DockControl({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="pressable flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:bg-veil hover:text-ink-strong"
    >
      {children}
    </button>
  );
}
