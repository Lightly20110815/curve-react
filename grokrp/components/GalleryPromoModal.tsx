import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { formatArticleDateline } from "@/lib/han-date";
import { allPhotos, type Photo } from "@/lib/photos";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const STORAGE_DISMISSED_KEY = "sdg_gallery_promo_dismissed";
const STORAGE_VISIT_COUNT_KEY = "sdg_gallery_promo_visit_count";

function filmParts(photo: Photo): string[] {
  return [photo.location, formatArticleDateline(photo.date), photo.camera]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
}

export function GalleryPromoModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [showNeverAgain, setShowNeverAgain] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, isOpen);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_DISMISSED_KEY) === "true") return;
    if (allPhotos.length === 0) return;

    const prevCount = parseInt(localStorage.getItem(STORAGE_VISIT_COUNT_KEY) || "0", 10);
    const currentCount = prevCount + 1;
    localStorage.setItem(STORAGE_VISIT_COUNT_KEY, String(currentCount));
    setShowNeverAgain(currentCount >= 2);
    setPhoto(allPhotos[Math.floor(Math.random() * allPhotos.length)]);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !photo) return null;

  const reel = filmParts(photo);

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-promo-title"
          className="my-auto w-full max-w-md border border-rule bg-paper p-6 text-ink-body"
        >
        <p className="font-ui text-[13px] text-ink-muted">相册</p>
        <h2 id="gallery-promo-title" className="mt-2 font-display text-[32px] font-bold leading-none text-ink-strong">
          新放了一批照片
        </h2>
        <p className="mt-3 font-serif text-[16px] leading-[1.7]">
          合肥拍的，在光影这一栏。
        </p>
        <figure
          className="mx-auto mt-5 max-w-full origin-center -rotate-[1.5deg] bg-[#f6f2ea] px-2.5 pb-3.5 pt-2.5 motion-reduce:rotate-0"
          style={{ width: `min(100%, calc(min(46dvh, 420px) * ${photo.width} / ${photo.height}))` }}
        >
          <img
            src={photo.src}
            alt={photo.title}
            width={photo.width}
            height={photo.height}
            className="block h-auto w-full"
          />
          <figcaption className="mt-2.5 text-[#241c16]">
            <p className="font-serif text-[15px] leading-snug">{photo.title}</p>
            {reel.length > 0 ? (
              <p className="mt-1 flex flex-wrap font-ui text-[12px] leading-[1.45]">
                {reel.map((part, index) => (
                  <span key={`${index}-${part}`} className="whitespace-nowrap">
                    {part}
                    {index < reel.length - 1 ? " · " : ""}
                  </span>
                ))}
              </p>
            ) : null}
          </figcaption>
        </figure>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className="bg-ink px-4 py-2 font-ui text-[13px] text-paper hover:bg-stamp"
            onClick={() => {
              setIsOpen(false);
              navigate("/photos");
            }}
          >
            去看
          </button>
          <button
            type="button"
            className="border border-rule px-4 py-2 font-ui text-[13px] text-ink hover:border-stamp hover:text-stamp"
            onClick={() => setIsOpen(false)}
          >
            先不看
          </button>
          {showNeverAgain ? (
            <button
              type="button"
              className="px-4 py-2 font-ui text-[13px] text-ink-muted hover:text-ink"
              onClick={() => {
                localStorage.setItem(STORAGE_DISMISSED_KEY, "true");
                setIsOpen(false);
              }}
            >
              不再显示
            </button>
          ) : null}
        </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
