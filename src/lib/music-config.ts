/**
 * 本地音乐播放器配置。
 *
 * 音频文件在 public/Musics/。构建期脚本
 * (scripts/generate-music-manifest.ts) 扫描目录、用 music-metadata
 * 读取 ID3 元数据并生成 manifest.json，浏览器运行时拉取。
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
