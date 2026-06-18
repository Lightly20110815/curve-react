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
