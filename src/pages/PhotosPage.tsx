import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TwikooComments } from "@/components/TwikooComments";
import { Kicker, Ornament } from "@/components/Editorial";
import { photoAlbums, allPhotos, type Photo } from "@/lib/photos";
import { formatArticleDateline } from "@/lib/han-date";

function PhotoCard({
  photo,
  index,
  onOpen,
}: {
  photo: Photo;
  index: number;
  onOpen: (index: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="group relative block w-full break-inside-avoid overflow-hidden border border-rule-soft/60 bg-paper-soft/50 text-left"
    >
      <img
        src={photo.src}
        alt={photo.title}
        loading="lazy"
        className="w-full transition-transform duration-700 group-hover:scale-105"
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/85 via-ink/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="font-display text-[17px] font-bold text-paper">
          {photo.title}
        </span>
        <span className="mt-0.5 font-ui text-[11px] uppercase tracking-[0.12em] text-paper/75">
          {formatArticleDateline(photo.date)}
          {photo.location ? ` · ${photo.location}` : ""}
        </span>
      </div>
      <span className="absolute right-3 top-3 border border-paper/0 font-ui text-[10px] font-medium uppercase tracking-[0.14em] text-paper opacity-0 transition-all duration-300 group-hover:border-paper/40 group-hover:opacity-100 group-hover:bg-ink/30 px-2 py-1 backdrop-blur-sm">
        Photo {String(index + 1).padStart(2, "0")}
      </span>
    </button>
  );
}

function Lightbox({
  photo,
  onClose,
  onPrev,
  onNext,
}: {
  photo: Photo;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center border border-paper/30 text-paper transition-colors hover:border-stamp hover:text-stamp"
        aria-label="关闭"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-paper/30 text-paper transition-colors hover:border-stamp hover:text-stamp sm:left-6"
        aria-label="上一张"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <figure
        className="max-h-full max-w-5xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.src}
          alt={photo.title}
          className="mx-auto max-h-[78vh] w-auto border border-paper/20 object-contain"
        />
        <figcaption className="mt-4 border-t border-paper/25 pt-3 text-center">
          <p className="font-display text-[20px] font-bold text-paper">{photo.title}</p>
          <p className="mt-1 font-ui text-[12px] uppercase tracking-[0.12em] text-paper/65">
            {formatArticleDateline(photo.date)}
            {photo.location ? ` · ${photo.location}` : ""}
            {photo.camera ? ` · ${photo.camera}` : ""}
          </p>
          {photo.desc && (
            <p className="mx-auto mt-2 max-w-xl font-serif text-[15px] leading-relaxed text-paper/80">
              {photo.desc}
            </p>
          )}
        </figcaption>
      </figure>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-paper/30 text-paper transition-colors hover:border-stamp hover:text-stamp sm:right-6"
        aria-label="下一张"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function PhotosPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const total = allPhotos.length;

  const openAt = useCallback((index: number) => setLightboxIndex(index), []);
  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i - 1 + total) % total)),
    [total],
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i + 1) % total)),
    [total],
  );

  const photoToIndex = useMemo(() => {
    const map = new Map<Photo, number>();
    allPhotos.forEach((p, i) => map.set(p, i));
    return map;
  }, []);

  const current = lightboxIndex === null ? null : allPhotos[lightboxIndex];

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        kicker="GALLERY · 光影"
        title="相册"
        description="用快门写日记。每张照片背后，都有一段按下快门时才存在的风景。"
        align="center"
      />

      <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-4 border-y border-rule-soft/40 py-3 font-ui text-[12px] uppercase tracking-[0.14em] text-ink-muted">
        <Camera className="h-4 w-4 text-stamp" />
        <span>
          {photoAlbums.length} 个影集 · {total} 张照片
        </span>
        <Camera className="h-4 w-4 text-stamp" />
      </div>

      <div className="mt-14 space-y-16">
        {photoAlbums.map((album) => {
          const startIndex = photoToIndex.get(album.photos[0]) ?? 0;
          return (
            <section key={album.id}>
              <div className="flex items-baseline justify-between border-b border-rule pb-3">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-display text-[24px] font-bold text-ink-strong">
                    {album.name}
                  </h2>
                  <span className="font-ui text-[12px] uppercase tracking-[0.14em] text-stamp">
                    {album.nameEn}
                  </span>
                  <span className="font-ui text-[13px] text-ink-muted">
                    {album.photos.length} 张
                  </span>
                </div>
                <span className="hidden font-serif text-[13px] italic text-ink-faded sm:inline">
                  {album.desc}
                </span>
              </div>

              <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
                {album.photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    index={photoToIndex.get(photo) ?? startIndex}
                    onOpen={openAt}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Ornament className="my-section" />

      <section className="mx-auto max-w-prose text-center">
        <Kicker variant="stamp">Camera Roll · 关于照片</Kicker>
        <p className="mt-4 font-serif text-[16px] leading-[1.75] text-ink-body">
          所有照片均记录于日常漫游，拍摄地点位于安徽合肥，使用 REDMI Turbo 5 捕捉光影瞬间。
          <br />
          不刻意追求宏大叙事，只诚实记录眼睛所见的人间烟火与浮光掠影。
        </p>
      </section>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {photoAlbums.map((album) => (
          <div
            key={album.id}
            className="flex items-center gap-3 border border-rule-soft/60 bg-paper-soft/50 p-3"
          >
            <MapPin className="h-4 w-4 flex-shrink-0 text-stamp" />
            <div className="min-w-0">
              <p className="truncate font-ui text-[12px] font-semibold text-ink-strong">
                {album.name}
              </p>
              <p className="truncate font-ui text-[11px] uppercase tracking-[0.12em] text-ink-faded">
                {album.nameEn}
              </p>
            </div>
          </div>
        ))}
      </div>

      <TwikooComments pageKey="/pages/photos" />

      {current && (
        <Lightbox photo={current} onClose={close} onPrev={prev} onNext={next} />
      )}
    </div>
  );
}
