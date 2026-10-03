/**
 * Build-time image pipeline.
 *
 * The repo ships ~14 MB of full-resolution JPEGs and the app served those
 * originals everywhere — a 400 px gallery thumbnail and a 533 KB homepage promo
 * were the same file. This walks `public/images`, writes WebP variants at a few
 * widths into `public/images/_optimized`, and emits a manifest the runtime reads
 * to build `srcSet`/`sizes` and to reserve layout space.
 *
 * Originals are left in place: the manifest is the fast path, the original src
 * is the fallback, so a missing/failed variant can never break an image.
 *
 * Incremental — a variant is rewritten only when the source is newer, so the
 * dev server pays the cost once.
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { Dirent } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const OUT_DIR = path.join(IMAGES_DIR, "_optimized");
const MANIFEST_PATH = path.join(ROOT, "src", "content", "generated", "images.json");

/** Display widths worth shipping. Anything wider falls back to the original. */
const WIDTHS = [480, 960, 1600];
const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const WEBP_QUALITY = 78;
/** Anything already smaller than this is not worth re-encoding. */
const MIN_SOURCE_BYTES = 60 * 1024;

export interface ImageVariant {
  /** Intrinsic width of this file. */
  w: number;
  /** Intrinsic height of this file. */
  h: number;
  /** Public URL path. */
  src: string;
}

export interface ImageEntry {
  width: number;
  height: number;
  variants: ImageVariant[];
}

export type ImageManifest = Record<string, ImageEntry>;

async function walk(dir: string): Promise<string[]> {
  let entries: Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Never re-ingest our own output.
      if (full === OUT_DIR) continue;
      files.push(...(await walk(full)));
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function isStale(source: string, output: string): Promise<boolean> {
  try {
    const [srcStat, outStat] = await Promise.all([fs.stat(source), fs.stat(output)]);
    return srcStat.mtimeMs > outStat.mtimeMs;
  } catch {
    return true; // output missing
  }
}

export async function buildImages(): Promise<ImageManifest> {
  const sources = await walk(IMAGES_DIR);
  const manifest: ImageManifest = {};
  let written = 0;
  let skipped = 0;

  for (const source of sources) {
    const { size: sourceBytes = 0 } = await fs.stat(source);
    const relative = path.relative(PUBLIC_DIR, source);
    const publicSrc = "/" + relative.split(path.sep).join("/");
    // Relative to images/ so variants land at /images/_optimized/<album>/<name>@<w>.webp
    const relativeToImages = path.relative(IMAGES_DIR, source);

    const meta = await sharp(source).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    if (!width || !height) continue;

    const variants: ImageVariant[] = [];

    if (sourceBytes >= MIN_SOURCE_BYTES) {
      for (const target of WIDTHS) {
        // Never upscale, and skip a variant that matches the original exactly.
        if (target >= width) continue;

        const outHeight = Math.max(1, Math.round((height / width) * target));
        const outFile = path.join(OUT_DIR, `${relativeToImages}@${target}.webp`);
        const outSrc = "/" + path.relative(PUBLIC_DIR, outFile).split(path.sep).join("/");

        if (await isStale(source, outFile)) {
          await fs.mkdir(path.dirname(outFile), { recursive: true });
          await sharp(source)
            .resize({ width: target, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY, effort: 4 })
            .toFile(outFile);
          written += 1;
        } else {
          skipped += 1;
        }

        variants.push({ w: target, h: outHeight, src: outSrc });
      }
    }

    manifest[publicSrc] = { width, height, variants };
  }

  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  const withVariants = Object.values(manifest).filter((e) => e.variants.length > 0).length;
  console.log(
    `[images] ${Object.keys(manifest).length} sources · ${withVariants} optimised · ` +
      `${written} written, ${skipped} up-to-date`,
  );

  return manifest;
}

buildImages().catch((error) => {
  console.error("[images] failed:", error);
  process.exitCode = 1;
});
