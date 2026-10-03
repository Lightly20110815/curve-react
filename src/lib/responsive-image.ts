import manifest from "@/content/generated/images.json";

export interface ImageVariant {
  w: number;
  h: number;
  src: string;
}

export interface ImageEntry {
  width: number;
  height: number;
  variants: ImageVariant[];
}

const images = manifest as Record<string, ImageEntry>;

/** Widths of the built variants, ascending — used to derive a `sizes` default. */
export function imageWidths(src: string): number[] {
  return images[src]?.variants.map((v) => v.w) ?? [];
}

/**
 * `srcSet` for a source image, or undefined when no variants were built.
 *
 * Returning undefined matters: the caller keeps its plain `src`, so an image
 * that the pipeline skipped still renders from the original.
 */
export function imageSrcSet(src: string): string | undefined {
  const entry = images[src];
  if (!entry || entry.variants.length === 0) return undefined;
  return entry.variants.map((v) => `${v.src} ${v.w}w`).join(", ");
}

/** Intrinsic size of the original, for reserving layout space. */
export function imageDimensions(src: string): { width: number; height: number } | undefined {
  const entry = images[src];
  return entry ? { width: entry.width, height: entry.height } : undefined;
}

/** CSS `aspect-ratio` value for a source image, if it is known. */
export function imageAspectRatio(src: string): string | undefined {
  const entry = images[src];
  return entry ? `${entry.width} / ${entry.height}` : undefined;
}
