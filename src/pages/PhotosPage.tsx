import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    <div className="group relative block w-full break-inside-avoid overflow-hidden border border-rule-soft/60 bg-paper-soft/50 text-left">
      <div
        onClick={() => onOpen(index)}
        className="relative block w-full overflow-hidden cursor-default sm:cursor-pointer"
      >
        <img
          src={photo.src}
          alt={photo.title}
          loading="lazy"
          className="w-full transition-transform duration-700 sm:group-hover:scale-105"
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        />
        {/* Desktop hover overlay */}
        <div className="pointer-events-none absolute inset-0 hidden sm:flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/25 to-transparent p-4 opacity-0 transition-opacity duration-300 sm:group-hover:opacity-100">
          <span className="font-display text-[17px] font-bold text-white">
            {photo.title}
          </span>
          <span className="mt-0.5 font-ui text-[11px] uppercase tracking-[0.12em] text-white/80">
            {formatArticleDateline(photo.date)}
            {photo.location ? ` · ${photo.location}` : ""}
          </span>
        </div>
        <span className="absolute right-3 top-3 hidden sm:inline-block border border-white/20 bg-black/40 font-ui text-[10px] font-medium uppercase tracking-[0.14em] text-white opacity-0 transition-all duration-300 sm:group-hover:opacity-100 px-2 py-1 backdrop-blur-sm">
          Photo {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Mobile-only inline details caption (mobile lightbox disabled) */}
      <div className="block sm:hidden p-3.5 border-t border-rule-soft/40">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-[16px] font-bold text-ink-strong leading-snug">
            {photo.title}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faded shrink-0">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-ui text-[11px] text-ink-muted">
          <span>{formatArticleDateline(photo.date)}</span>
          {photo.location && (
            <>
              <span className="text-rule">·</span>
              <span className="inline-flex items-center gap-0.5 text-stamp">
                <MapPin className="h-3 w-3" />
                {photo.location}
              </span>
            </>
          )}
          {photo.camera && (
            <>
              <span className="text-rule">·</span>
              <span>{photo.camera}</span>
            </>
          )}
        </div>
        {photo.desc && (
          <p className="mt-2 font-serif text-[13px] leading-relaxed text-ink-body">
            {photo.desc}
          </p>
        )}
      </div>
    </div>
  );
}

function Lightbox({
  photo,
  currentIndex,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  photo: Photo;
  currentIndex: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setLoaded(false);
    setHasError(false);

    // A cached image can finish before React attaches the onLoad listener,
    // notably on mobile Safari and Chrome. Check the rendered image as well.
    const image = imgRef.current;
    if (image?.complete) {
      if (image.naturalWidth > 0) {
        setLoaded(true);
      } else {
        setHasError(true);
      }
    }
  }, [photo.src]);

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

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal swipe: threshold 40px with horizontal dominance
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        onNext();
      } else {
        onPrev();
      }
    } else if (deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      // Pull down gesture to close
      onClose();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      className="hidden sm:flex fixed inset-0 z-[100] items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in select-none px-3 py-10 sm:p-6"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Bar: Counter & Close Button (Safe-Area Aware) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-3 py-1 font-mono text-[11px] sm:text-[12px] tracking-widest text-white/90 backdrop-blur-md shadow-lg">
          <Camera className="h-3.5 w-3.5 text-stamp" />
          <span>
            {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/30 bg-black/70 text-white backdrop-blur-md transition-all hover:border-stamp hover:text-stamp active:scale-95 shadow-lg"
          aria-label="关闭"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Desktop Floating Navigation Arrows (hidden on mobile to prevent blocking photo) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="hidden sm:inline-flex absolute left-4 lg:left-8 top-1/2 z-30 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/70 text-white backdrop-blur-md transition-all hover:border-stamp hover:text-stamp hover:scale-110 active:scale-95 shadow-lg"
        aria-label="上一张"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="hidden sm:inline-flex absolute right-4 lg:right-8 top-1/2 z-30 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/70 text-white backdrop-blur-md transition-all hover:border-stamp hover:text-stamp hover:scale-110 active:scale-95 shadow-lg"
        aria-label="下一张"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Content Container */}
      <figure
        className="relative z-10 flex max-h-[92dvh] w-full max-w-4xl flex-col items-center overflow-y-auto px-1 py-1 sm:max-h-full sm:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo Image Frame */}
        <div className="relative flex w-full shrink-0 items-center justify-center">
          {hasError && (
            <div
              className="flex flex-col items-center justify-center rounded-xs border border-white/15 bg-white/5 p-6 text-center backdrop-blur-sm"
              style={{
                aspectRatio: `${photo.width} / ${photo.height}`,
                maxHeight: "58dvh",
                minWidth: "200px",
              }}
            >
              <p className="font-ui text-[13px] text-red-400">图片加载失败</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasError(false);
                  setLoaded(false);
                }}
                className="mt-3 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 font-ui text-[12px] text-white transition-all hover:bg-white/20 active:scale-95"
              >
                重试
              </button>
            </div>
          )}

          {!hasError && (
            <div className="relative inline-flex items-center justify-center">
              <img
                key={photo.src}
                ref={imgRef}
                src={photo.src}
                alt={photo.title}
                loading="eager"
                decoding="async"
                onLoad={() => {
                  setHasError(false);
                  setLoaded(true);
                }}
                onError={() => {
                  setLoaded(false);
                  setHasError(true);
                }}
                className="max-h-[58dvh] sm:max-h-[68vh] lg:max-h-[74vh] w-auto max-w-full rounded-xs border border-white/20 object-contain shadow-2xl transition-opacity duration-300"
                style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              />

              {!loaded && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-xs bg-black/40 backdrop-blur-xs">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-stamp" />
                  <span className="mt-2.5 font-mono text-[11px] text-white/70">载入中...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Polaroid/Gallery Details Caption */}
        <figcaption className="mt-3 w-full max-w-2xl border-t border-white/25 pt-2.5 text-center sm:mt-4 sm:pt-3">
          <p className="font-display text-[18px] sm:text-[22px] font-bold text-white">
            {photo.title}
          </p>

          <p className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 font-ui text-[11px] sm:text-[12px] uppercase tracking-[0.1em] text-white/70">
            <span>{formatArticleDateline(photo.date)}</span>
            {photo.location && (
              <>
                <span className="text-white/40">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-stamp" />
                  {photo.location}
                </span>
              </>
            )}
            {photo.camera && (
              <>
                <span className="text-white/40">·</span>
                <span>{photo.camera}</span>
              </>
            )}
          </p>

          {photo.desc && (
            <p className="mx-auto mt-2 max-w-xl font-serif text-[13px] sm:text-[15px] leading-relaxed text-white/85 px-2">
              {photo.desc}
            </p>
          )}

          {/* Mobile Bottom Switcher Toolbar */}
          <div className="flex sm:hidden items-center justify-center gap-6 mt-3.5 pt-2.5 border-t border-white/15">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/25 bg-white/10 text-white font-ui text-[12px] font-medium active:scale-95 transition-all shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>上一张</span>
            </button>

            <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
              左右滑动切换
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/25 bg-white/10 text-white font-ui text-[12px] font-medium active:scale-95 transition-all shadow-sm"
            >
              <span>下一张</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}

export default function PhotosPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const total = allPhotos.length;

  const openAt = useCallback((index: number) => {
    // 移动端完全禁用点击查看大图功能，防止黑屏或异常弹窗
    if (typeof window !== "undefined" && window.innerWidth < 640) return;
    setLightboxIndex(index);
  }, []);
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
        <Lightbox
          photo={current}
          currentIndex={lightboxIndex ?? 0}
          total={total}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  );
}
