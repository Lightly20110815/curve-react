/**
 * Local music player configuration.
 *
 * Audio files live in public/Musics/. A build-time script
 * (scripts/generate-music-manifest.ts) scans the directory, reads ID3
 * metadata with music-metadata, and writes manifest.json.  The browser
 * fetches that manifest at runtime so it knows which tracks are available.
 */

export const musicConfig = {
  enable: true,
};

export interface TrackInfo {
  name: string;
  artist: string;
  url: string;
  pic: string;
  lrc?: string;
}

const MANIFEST_URL = "/Musics/manifest.json";

// Kept outside Musics so the shared manifest never includes this page-only track.
export const epheiaTrack: TrackInfo = {
  name: "リリィ",
  artist: "",
  url: "/audio/epheia/lily.mp3",
  pic: "/audio/epheia/lily.jpg",
};

export async function loadTracks(): Promise<TrackInfo[]> {
  const response = await fetch(MANIFEST_URL);
  if (!response.ok) {
    throw new Error(`Manifest fetch failed: ${response.status}`);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Music manifest is empty");
  }
  return data as TrackInfo[];
}
