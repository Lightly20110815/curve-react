/**
 * Scan public/Musics/ for audio files, read ID3 tags via music-metadata,
 * and write a manifest.json that the browser-side player consumes.
 *
 * Run via: tsx scripts/generate-music-manifest.ts
 */
import { readdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { parseFile } from "music-metadata";

const MUSIC_DIR = "public/Musics";
const MANIFEST_PATH = join(MUSIC_DIR, "manifest.json");

const AUDIO_EXTS = new Set([".mp3", ".flac", ".wav", ".ogg", ".m4a", ".mp4"]);

interface ManifestTrack {
  name: string;
  artist: string;
  url: string;
  pic: string;
}

async function main(): Promise<void> {
  let entries: string[];
  try {
    entries = readdirSync(MUSIC_DIR);
  } catch {
    writeFileSync(MANIFEST_PATH, "[]", "utf-8");
    console.log("No Musics directory found, wrote empty manifest.");
    return;
  }

  const audioFiles = entries.filter((f) =>
    AUDIO_EXTS.has(extname(f).toLowerCase()),
  );

  if (audioFiles.length === 0) {
    writeFileSync(MANIFEST_PATH, "[]", "utf-8");
    console.log("No audio files in public/Musics, wrote empty manifest.");
    return;
  }

  const tracks: ManifestTrack[] = [];

  for (const file of audioFiles) {
    const filePath = join(MUSIC_DIR, file);
    try {
      const { common } = await parseFile(filePath, { skipCovers: false });
      const cover = common.picture?.[0];
      let pic = "";
      if (cover) {
        const base64 = Buffer.from(cover.data).toString("base64");
        pic = `data:${cover.format};base64,${base64}`;
      }
      tracks.push({
        name: common.title || stripExt(file),
        artist: common.artist || "Unknown Artist",
        url: `/Musics/${file}`,
        pic,
      });
    } catch (err) {
      console.warn(`  Skipping ${file}: ${String(err)}`);
      tracks.push({
        name: stripExt(file),
        artist: "Unknown Artist",
        url: `/Musics/${file}`,
        pic: "",
      });
    }
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(tracks, null, 2), "utf-8");
  console.log(`Generated ${MANIFEST_PATH} (${tracks.length} tracks)`);
}

function stripExt(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

main().catch((err) => {
  console.error("Failed to generate music manifest:", err);
  process.exit(1);
});
