/**
 * Music player configuration.
 *
 * Mirrors the Meting API contract used by the original VitePress theme so the
 * existing playlist keeps working without server changes.
 *
 * Meting returns an array of: { name, artist, url, pic, lrc }
 */
export const musicConfig = {
  enable: true,
  api: "https://meting.20110815.xyz/api",
  server: "netease" as const,
  type: "playlist" as const,
  id: 14022768906,
};

export interface MetingTrack {
  name: string;
  artist: string;
  url: string;
  pic: string;
  lrc?: string;
}

export function buildMetingUrl(cfg = musicConfig): string {
  const qs = new URLSearchParams({
    server: cfg.server,
    type: cfg.type,
    id: String(cfg.id),
  });
  return `${cfg.api}?${qs.toString()}`;
}
