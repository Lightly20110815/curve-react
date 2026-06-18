/**
 * Module-level singleton audio controller for the NowPlaying widget.
 *
 * The <audio> element is created once and lives on document.body so that
 * playback survives the ContextMenu mount/unmount cycle.  The NowPlaying
 * React component is a pure UI shell that reads/writes this controller.
 */
import { loadTracks, type TrackInfo } from "./music-config";

type Listener = () => void;

let _audio: HTMLAudioElement | null = null;
let _tracks: TrackInfo[] | null = null;
let _isLoading = true;
let _error = false;
let _trackIndex = 0;
const _listeners = new Set<Listener>();

function getAudio(): HTMLAudioElement {
  if (!_audio) {
    _audio = new Audio();
    _audio.preload = "metadata";
    _audio.style.display = "none";
    _audio.addEventListener("ended", () => {
      if (_tracks && _tracks.length > 0) {
        _trackIndex = (_trackIndex + 1) % _tracks.length;
        const next = _tracks[_trackIndex];
        if (next) {
          _audio!.src = next.url;
          _audio!.load();
        }
        scheduleAutoPlay();
        notify();
      }
    });
    document.body.appendChild(_audio);
  }
  return _audio;
}

function scheduleAutoPlay(): void {
  const audio = _audio;
  if (!audio) return;
  const onReady = () => {
    audio.removeEventListener("canplay", onReady);
    audio.play().catch(() => {});
  };
  audio.addEventListener("canplay", onReady);
}

function notify(): void {
  _listeners.forEach((fn) => fn());
}

// Kick off loading as soon as the module is imported.
loadTracks()
  .then((tracks) => {
    _tracks = tracks;
    _isLoading = false;
    if (tracks.length > 0) {
      getAudio().src = tracks[0].url;
    }
    notify();
  })
  .catch(() => {
    _error = true;
    _isLoading = false;
    notify();
  });

export const nowPlaying = {
  get tracks(): TrackInfo[] | null {
    return _tracks;
  },
  get isLoading(): boolean {
    return _isLoading;
  },
  get error(): boolean {
    return _error;
  },
  get trackIndex(): number {
    return _trackIndex;
  },
  get currentTrack(): TrackInfo | null {
    return _tracks?.[_trackIndex] ?? null;
  },
  get isPlaying(): boolean {
    return _audio ? !_audio.paused : false;
  },

  subscribe(fn: Listener): () => void {
    _listeners.add(fn);
    return () => {
      _listeners.delete(fn);
    };
  },

  togglePlay(): void {
    const audio = getAudio();
    if (!_tracks || _tracks.length === 0) return;
    if (audio.paused) {
      audio.play().then(() => notify()).catch(() => {});
    } else {
      audio.pause();
      notify();
    }
  },

  prev(): void {
    if (!_tracks || _tracks.length === 0) return;
    const audio = getAudio();
    const wasPlaying = !audio.paused;
    _trackIndex = (_trackIndex - 1 + _tracks.length) % _tracks.length;
    audio.src = _tracks[_trackIndex].url;
    audio.load();
    if (wasPlaying) scheduleAutoPlay();
    notify();
  },

  next(): void {
    if (!_tracks || _tracks.length === 0) return;
    const audio = getAudio();
    const wasPlaying = !audio.paused;
    _trackIndex = (_trackIndex + 1) % _tracks.length;
    audio.src = _tracks[_trackIndex].url;
    audio.load();
    if (wasPlaying) scheduleAutoPlay();
    notify();
  },

  getProgress(): number {
    if (!_audio || !_audio.duration || _audio.duration <= 0) return 0;
    return Math.round((_audio.currentTime / _audio.duration) * 1000) / 10;
  },
};
