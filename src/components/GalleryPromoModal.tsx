import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Camera, MapPin, X } from "lucide-react";
import { allPhotos, type Photo } from "@/lib/photos";
import { formatArticleDateline } from "@/lib/han-date";
import { cn } from "@/lib/utils";

const STORAGE_DISMISSED_KEY = "sdg_gallery_promo_dismissed";
const STORAGE_VISIT_COUNT_KEY = "sdg_gallery_promo_visit_count";

export interface ColorScheme {
  id: string;
  name: string;
  title1: string;
  title2: string;
  titleUnderline: string;
  subtitle: string;
  kickerText: string;
  kickerIcon: string;
  excerptBorderL: string;
  excerptBorder: string;
  excerptBg: string;
  excerptKicker: string;
  excerptCamera: string;
  excerptLocation: string;
  primaryBtn: string;
  secondaryBtn: string;
  dismissBtn: string;
  photoTag: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "sunset-blossom",
    name: "落日落霞",
    title1: "bg-gradient-to-r from-amber-300 via-rose-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(244,63,94,0.35)]",
    title2: "bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_8px_30px_rgba(192,132,252,0.45)]",
    titleUnderline: "decoration-cyan-400/50",
    subtitle: "bg-gradient-to-r from-rose-200 via-amber-100 to-cyan-200 bg-clip-text text-transparent drop-shadow-sm",
    kickerText: "bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent",
    kickerIcon: "text-pink-400",
    excerptBorderL: "border-l-pink-500",
    excerptBorder: "border-cyan-400/30",
    excerptBg: "bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-black/35",
    excerptKicker: "bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent",
    excerptCamera: "text-cyan-300",
    excerptLocation: "text-cyan-200/85",
    primaryBtn: "bg-rose-500 hover:bg-rose-600 border-rose-300/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_25px_rgba(244,63,94,0.45)]",
    secondaryBtn: "border-pink-300/40 hover:border-pink-200/70 bg-white/15 hover:bg-white/25 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_6px_20px_rgba(0,0,0,0.3)]",
    dismissBtn: "border-purple-300/25 hover:border-pink-400/50 bg-black/30 hover:bg-rose-950/40 text-purple-200/80 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
    photoTag: "bg-rose-500 text-white",
  },
  {
    id: "aurora-borealis",
    name: "极光夜幕",
    title1: "bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(20,184,166,0.35)]",
    title2: "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_8px_30px_rgba(56,189,248,0.45)]",
    titleUnderline: "decoration-emerald-400/50",
    subtitle: "bg-gradient-to-r from-teal-100 via-cyan-100 to-sky-200 bg-clip-text text-transparent drop-shadow-sm",
    kickerText: "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent",
    kickerIcon: "text-emerald-400",
    excerptBorderL: "border-l-emerald-400",
    excerptBorder: "border-teal-400/30",
    excerptBg: "bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-black/35",
    excerptKicker: "bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent",
    excerptCamera: "text-emerald-300",
    excerptLocation: "text-teal-200/85",
    primaryBtn: "bg-teal-500 hover:bg-teal-600 border-teal-300/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_25px_rgba(20,184,166,0.45)]",
    secondaryBtn: "border-teal-300/40 hover:border-teal-200/70 bg-white/15 hover:bg-white/25 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_6px_20px_rgba(0,0,0,0.3)]",
    dismissBtn: "border-teal-300/25 hover:border-teal-400/50 bg-black/30 hover:bg-teal-950/40 text-teal-200/80 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
    photoTag: "bg-teal-500 text-white",
  },
  {
    id: "cyber-neon",
    name: "赛博霓虹",
    title1: "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(217,70,239,0.35)]",
    title2: "bg-gradient-to-r from-fuchsia-400 via-purple-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_8px_30px_rgba(244,114,182,0.45)]",
    titleUnderline: "decoration-fuchsia-400/50",
    subtitle: "bg-gradient-to-r from-purple-200 via-fuchsia-100 to-pink-200 bg-clip-text text-transparent drop-shadow-sm",
    kickerText: "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent",
    kickerIcon: "text-fuchsia-400",
    excerptBorderL: "border-l-fuchsia-500",
    excerptBorder: "border-violet-400/30",
    excerptBg: "bg-gradient-to-r from-violet-950/40 via-fuchsia-950/30 to-black/35",
    excerptKicker: "bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent",
    excerptCamera: "text-fuchsia-300",
    excerptLocation: "text-purple-200/85",
    primaryBtn: "bg-purple-600 hover:bg-purple-700 border-purple-300/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_25px_rgba(147,51,234,0.45)]",
    secondaryBtn: "border-purple-300/40 hover:border-purple-200/70 bg-white/15 hover:bg-white/25 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_6px_20px_rgba(0,0,0,0.3)]",
    dismissBtn: "border-purple-300/25 hover:border-fuchsia-400/50 bg-black/30 hover:bg-purple-950/40 text-fuchsia-200/80 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
    photoTag: "bg-purple-600 text-white",
  },
  {
    id: "citrus-mojito",
    name: "青柠气泡",
    title1: "bg-gradient-to-r from-yellow-300 via-lime-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(132,204,22,0.35)]",
    title2: "bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_8px_30px_rgba(52,211,153,0.45)]",
    titleUnderline: "decoration-lime-400/50",
    subtitle: "bg-gradient-to-r from-yellow-100 via-lime-100 to-teal-100 bg-clip-text text-transparent drop-shadow-sm",
    kickerText: "bg-gradient-to-r from-yellow-300 via-lime-400 to-teal-400 bg-clip-text text-transparent",
    kickerIcon: "text-lime-400",
    excerptBorderL: "border-l-lime-400",
    excerptBorder: "border-emerald-400/30",
    excerptBg: "bg-gradient-to-r from-lime-950/40 via-emerald-950/30 to-black/35",
    excerptKicker: "bg-gradient-to-r from-yellow-300 to-emerald-300 bg-clip-text text-transparent",
    excerptCamera: "text-lime-300",
    excerptLocation: "text-lime-200/85",
    primaryBtn: "bg-emerald-600 hover:bg-emerald-700 border-emerald-300/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_25px_rgba(16,185,129,0.45)]",
    secondaryBtn: "border-lime-300/40 hover:border-lime-200/70 bg-white/15 hover:bg-white/25 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_6px_20px_rgba(0,0,0,0.3)]",
    dismissBtn: "border-lime-300/25 hover:border-lime-400/50 bg-black/30 hover:bg-emerald-950/40 text-lime-200/80 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
    photoTag: "bg-emerald-600 text-white",
  },
  {
    id: "solar-fire",
    name: "曜金烈焰",
    title1: "bg-gradient-to-r from-red-400 via-orange-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(249,115,22,0.35)]",
    title2: "bg-gradient-to-r from-amber-300 via-yellow-400 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_8px_30px_rgba(245,158,11,0.45)]",
    titleUnderline: "decoration-amber-400/50",
    subtitle: "bg-gradient-to-r from-orange-100 via-amber-100 to-rose-200 bg-clip-text text-transparent drop-shadow-sm",
    kickerText: "bg-gradient-to-r from-red-400 via-orange-400 to-amber-300 bg-clip-text text-transparent",
    kickerIcon: "text-orange-400",
    excerptBorderL: "border-l-orange-500",
    excerptBorder: "border-amber-400/30",
    excerptBg: "bg-gradient-to-r from-orange-950/40 via-red-950/30 to-black/35",
    excerptKicker: "bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent",
    excerptCamera: "text-amber-300",
    excerptLocation: "text-amber-200/85",
    primaryBtn: "bg-orange-500 hover:bg-orange-600 border-orange-300/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_25px_rgba(249,115,22,0.45)]",
    secondaryBtn: "border-orange-300/40 hover:border-orange-200/70 bg-white/15 hover:bg-white/25 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_6px_20px_rgba(0,0,0,0.3)]",
    dismissBtn: "border-amber-300/25 hover:border-orange-400/50 bg-black/30 hover:bg-orange-950/40 text-orange-200/80 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
    photoTag: "bg-orange-500 text-white",
  },
  {
    id: "cosmic-candy",
    name: "星梦棉糖",
    title1: "bg-gradient-to-r from-pink-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_8px_25px_rgba(232,121,249,0.35)]",
    title2: "bg-gradient-to-r from-purple-300 via-sky-300 to-teal-200 bg-clip-text text-transparent drop-shadow-[0_8px_30px_rgba(56,189,248,0.45)]",
    titleUnderline: "decoration-pink-300/50",
    subtitle: "bg-gradient-to-r from-pink-100 via-purple-100 to-sky-100 bg-clip-text text-transparent drop-shadow-sm",
    kickerText: "bg-gradient-to-r from-pink-300 via-purple-300 to-sky-300 bg-clip-text text-transparent",
    kickerIcon: "text-pink-300",
    excerptBorderL: "border-l-pink-400",
    excerptBorder: "border-purple-300/30",
    excerptBg: "bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-black/35",
    excerptKicker: "bg-gradient-to-r from-pink-300 to-sky-300 bg-clip-text text-transparent",
    excerptCamera: "text-sky-300",
    excerptLocation: "text-purple-200/85",
    primaryBtn: "bg-pink-500 hover:bg-pink-600 border-pink-300/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_25px_rgba(236,72,153,0.45)]",
    secondaryBtn: "border-pink-300/40 hover:border-pink-200/70 bg-white/15 hover:bg-white/25 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_6px_20px_rgba(0,0,0,0.3)]",
    dismissBtn: "border-purple-300/25 hover:border-pink-400/50 bg-black/30 hover:bg-pink-950/40 text-pink-200/80 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
    photoTag: "bg-pink-500 text-white",
  },
];

export function GalleryPromoModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [randomPhoto, setRandomPhoto] = useState<Photo | null>(null);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(COLOR_SCHEMES[0]);
  const [showNeverAgain, setShowNeverAgain] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasMouse, setHasMouse] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setHasMouse(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    }

    // Check if user has permanently dismissed the promo
    const dismissed = localStorage.getItem(STORAGE_DISMISSED_KEY) === "true";
    if (dismissed) return;

    // Track visit count to homepage
    const prevCount = parseInt(
      localStorage.getItem(STORAGE_VISIT_COUNT_KEY) || "0",
      10,
    );
    const currentCount = prevCount + 1;
    localStorage.setItem(STORAGE_VISIT_COUNT_KEY, String(currentCount));

    // Show "不再显示" button starting from the 2nd visit
    setShowNeverAgain(currentCount >= 2);

    // Pick a random photo from the gallery
    if (allPhotos.length > 0) {
      const randomIndex = Math.floor(Math.random() * allPhotos.length);
      setRandomPhoto(allPhotos[randomIndex]);

      // Pick a random chromatic color scheme on each appearance
      const randomScheme =
        COLOR_SCHEMES[Math.floor(Math.random() * COLOR_SCHEMES.length)];
      setColorScheme(randomScheme);

      setIsOpen(true);
    }
  }, []);

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Track mouse coordinates for circular frosted-glass peep-hole
  useEffect(() => {
    if (!isOpen) return;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (!containerRef.current) return;

      containerRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
      containerRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);

      // Automatically hide the peep-hole circle when hovering over the photo
      const isOverPhoto = Boolean(
        photoContainerRef.current &&
          photoContainerRef.current.contains(e.target as Node),
      );

      if (isOverPhoto) {
        containerRef.current.style.setProperty("--lens-opacity", "0");
        containerRef.current.style.setProperty("--cutout-radius", "0px");
      } else {
        containerRef.current.style.setProperty("--lens-opacity", "1");
        containerRef.current.style.setProperty("--cutout-radius", "125px");
      }
    };

    const onPointerLeave = () => {
      if (containerRef.current) {
        containerRef.current.style.setProperty("--lens-opacity", "0");
        containerRef.current.style.setProperty("--cutout-radius", "0px");
        containerRef.current.style.setProperty("--mouse-x", "-999px");
        containerRef.current.style.setProperty("--mouse-y", "-999px");
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [isOpen]);

  if (!isOpen || !randomPhoto || !mounted) return null;

  const handleGoToGallery = () => {
    setIsOpen(false);
    navigate("/photos");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNeverShowAgain = () => {
    localStorage.setItem(STORAGE_DISMISSED_KEY, "true");
    setIsOpen(false);
  };

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex min-h-[100dvh] w-screen items-center justify-center overflow-y-auto overflow-x-hidden p-4 py-8 sm:p-8 sm:py-12 lg:p-14"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-promo-title"
    >
      {/* 1. Real Frosted Glass (毛玻璃) Backdrop Layer with dynamic Peep-Hole cutout */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-ink/35 backdrop-blur-[14px] backdrop-saturate-[150%] dark:bg-black/50"
        style={
          hasMouse
            ? {
                maskImage:
                  "radial-gradient(circle var(--cutout-radius, 125px) at var(--mouse-x, -999px) var(--mouse-y, -999px), transparent 0px, transparent calc(var(--cutout-radius, 125px) * 0.48), rgba(0,0,0,0.5) calc(var(--cutout-radius, 125px) * 0.8), black var(--cutout-radius, 125px))",
                WebkitMaskImage:
                  "radial-gradient(circle var(--cutout-radius, 125px) at var(--mouse-x, -999px) var(--mouse-y, -999px), transparent 0px, transparent calc(var(--cutout-radius, 125px) * 0.48), rgba(0,0,0,0.5) calc(var(--cutout-radius, 125px) * 0.8), black var(--cutout-radius, 125px))",
              }
            : undefined
        }
      >
        {/* Frosted glass surface grain and soft specular reflection sheen */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/[0.04] to-transparent opacity-90" />
        <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]" />
      </div>

      {/* 2. Interactive Peep-hole Lens Follower Ring (Desktop pointer only) */}
      <div
        className="pointer-events-none fixed z-20 hidden lg:block h-[150px] w-[150px] rounded-full border border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.3),inset_0_0_15px_rgba(255,255,255,0.2)] transition-opacity duration-300 ease-out"
        style={{
          left: 0,
          top: 0,
          transform:
            "translate(calc(var(--mouse-x, -999px) - 75px), calc(var(--mouse-y, -999px) - 75px))",
          opacity: "var(--lens-opacity, 0)",
        }}
      />

      {/* 3. Aero Glass Exit Button (top-right of screen) */}
      <button
        type="button"
        onClick={handleClose}
        className="group fixed right-4 top-4 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/40 bg-white/20 text-paper shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_10px_25px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all hover:scale-110 hover:border-stamp hover:bg-stamp hover:text-paper sm:right-8 sm:top-8"
        style={{
          top: "max(1rem, env(safe-area-inset-top))",
          right: "max(1rem, env(safe-area-inset-right))",
        }}
        aria-label="关闭"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:rotate-90" />
      </button>

      {/* 4. Full-bleed Content Layout directly on screen */}
      <div className="relative z-10 my-auto mx-auto w-full max-w-6xl lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
        {/* Promotional typography written DIRECTLY on screen */}
        <div className="animate-tilt-snap-left flex flex-col justify-center text-center lg:text-left">
          {/* Section Kicker */}
          <div className="flex items-center justify-center lg:justify-start gap-2 font-mono text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.22em] sm:tracking-[0.28em]">
            <Camera className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", colorScheme.kickerIcon)} />
            <span className={cn("font-bold", colorScheme.kickerText)}>
              CURVE GALLERY · 新板块公布
            </span>
          </div>

          {/* Giant Headline with dynamic randomized chromatic gradient */}
          <h1
            id="gallery-promo-title"
            className="mt-3 sm:mt-5 font-display text-[32px] sm:text-[52px] lg:text-[72px] font-bold leading-[1.1] tracking-tight"
          >
            <span className={colorScheme.title1}>新板块 </span>
            <span
              className={cn(
                "font-masthead italic underline underline-offset-4 sm:underline-offset-8",
                colorScheme.title2,
                colorScheme.titleUnderline,
              )}
            >
              Gallery!
            </span>
          </h1>

          {/* Subtitle with dynamic gradient */}
          <p className="mt-2.5 sm:mt-4 font-serif text-[15px] sm:text-[22px] lg:text-[26px] font-semibold leading-relaxed">
            <span className={colorScheme.subtitle}>
              我的足迹，生活与琐碎的日常
            </span>
          </p>

          {/* Mobile-only featured photo stack (centered between title and action buttons) */}
          <div className="my-5 flex w-full items-center justify-center lg:hidden">
            <RingPhotoStack
              photo={randomPhoto}
              photoTagClass={colorScheme.photoTag}
              isMobile
            />
          </div>

          {/* Photo Excerpt Box with dynamic color scheme (Desktop only to prevent redundant duplicate on mobile) */}
          <div
            className={cn(
              "hidden lg:block mt-8 max-w-xl rounded-sm border border-l-4 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur-md",
              colorScheme.excerptBorder,
              colorScheme.excerptBorderL,
              colorScheme.excerptBg,
            )}
          >
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
              <span className={colorScheme.excerptKicker}>
                ✦ 今日随选胶卷
              </span>
              <span className={cn("font-semibold", colorScheme.excerptCamera)}>
                {randomPhoto.camera || "35MM FILM"}
              </span>
            </div>
            <p className="mt-2 font-display text-[18px] font-bold sm:text-[20px]">
              <span className="bg-gradient-to-r from-amber-100 via-white to-cyan-100 bg-clip-text text-transparent">
                "{randomPhoto.title}"
              </span>
            </p>
            {randomPhoto.location && (
              <p
                className={cn(
                  "mt-1.5 flex items-center gap-1.5 font-ui text-[12px]",
                  colorScheme.excerptLocation,
                )}
              >
                <MapPin className={cn("h-3.5 w-3.5 shrink-0", colorScheme.kickerIcon)} />
                <span>
                  {randomPhoto.location} · {formatArticleDateline(randomPhoto.date)}
                </span>
              </p>
            )}
          </div>

          {/* Action Buttons styled like Windows Dialog / MessageBox Push-Buttons */}
          <div className="mt-5 sm:mt-8 lg:mt-10 flex w-full flex-col items-center sm:flex-row sm:flex-wrap justify-center lg:justify-start gap-2.5 sm:gap-4">
            <div className="grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:gap-4">
              {/* Primary Action Button (Windows Default / OK Dialog Push-Button) */}
              <button
                type="button"
                onClick={handleGoToGallery}
                className={cn(
                  "group relative flex h-11 sm:h-13 sm:min-w-[170px] items-center justify-center gap-2 rounded-[5px] px-3 sm:px-8 font-ui text-[14px] sm:text-[16px] font-bold tracking-wider text-white transition-all duration-150 cursor-pointer select-none",
                  "border-2 active:translate-y-[1.5px] active:brightness-90 active:scale-[0.99]",
                  colorScheme.primaryBtn,
                )}
              >
                <span>带我去看</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              {/* Secondary Action Button (Windows Cancel / Dismiss Push-Button) */}
              <button
                type="button"
                onClick={handleClose}
                className={cn(
                  "flex h-11 sm:h-13 sm:min-w-[140px] items-center justify-center rounded-[5px] px-3 sm:px-8 font-ui text-[14px] sm:text-[16px] font-semibold tracking-wider transition-all duration-150 cursor-pointer select-none backdrop-blur-md",
                  "border active:translate-y-[1.5px] active:brightness-90 active:scale-[0.99]",
                  colorScheme.secondaryBtn,
                )}
              >
                <span>暂时算了</span>
              </button>
            </div>

            {/* 3rd Button: Never Show Again (Windows 3rd Dialog Choice Push-Button) */}
            {showNeverAgain && (
              <button
                type="button"
                onClick={handleNeverShowAgain}
                className={cn(
                  "flex h-9 sm:h-13 w-full sm:w-auto sm:min-w-[130px] items-center justify-center rounded-[5px] px-3 sm:px-6 font-ui text-[12px] sm:text-[14px] font-medium tracking-wider transition-all duration-150 cursor-pointer select-none backdrop-blur-md",
                  "border active:translate-y-[1.5px] active:brightness-90 active:scale-[0.99]",
                  colorScheme.dismissBtn,
                )}
              >
                <span>不再显示此弹窗</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Tilted photo bundle floating DIRECTLY on screen (desktop only) */}
        <div
          ref={photoContainerRef}
          className="animate-tilt-snap-right hidden lg:flex lg:items-center lg:justify-center py-6"
        >
          <RingPhotoStack photo={randomPhoto} photoTagClass={colorScheme.photoTag} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * RingPhotoStack:
 * Giant photo stack floating directly on screen, hooked by a metallic binder ring.
 * Underneath photos are fanned out and covered; only the top randomly selected photo is shown.
 * Supports isMobile prop for a compact, proportional layout on mobile devices.
 */
function RingPhotoStack({
  photo,
  photoTagClass = "bg-gradient-to-r from-rose-500 to-amber-500 text-white",
  isMobile = false,
}: {
  photo: Photo;
  photoTagClass?: string;
  isMobile?: boolean;
}) {
  if (isMobile) {
    return (
      <div className="group relative h-[360px] w-[260px] select-none">
        {/* Ring Back Segment */}
        <svg
          className="pointer-events-none absolute -top-6 left-1 z-0 h-[72px] w-[72px] overflow-visible"
          viewBox="0 0 72 72"
          fill="none"
        >
          <defs>
            <linearGradient id="ring-back-metal-mob" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="40%" stopColor="#64748b" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <circle
            cx="36"
            cy="36"
            r="27"
            stroke="url(#ring-back-metal-mob)"
            strokeWidth="5.5"
            className="opacity-95"
          />
        </svg>

        {/* Card 3 (Bottom card: rotated -4.5deg) */}
        <div
          className="absolute inset-x-0 top-2 h-[320px] rounded-xs border-2 border-black/30 bg-[#e4ded0] shadow-[0_15px_30px_rgba(0,0,0,0.55)] dark:border-white/10 dark:bg-[#1a1a1a]"
          style={{
            transformOrigin: "36px 33px",
            transform: "rotate(-4.5deg)",
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/[0.06] to-black/[0.18]" />
        </div>

        {/* Card 2 (Middle card: rotated +4deg) */}
        <div
          className="absolute inset-x-0 top-2 h-[320px] rounded-xs border-2 border-black/30 bg-[#ede6d8] shadow-[0_18px_35px_rgba(0,0,0,0.6)] dark:border-white/10 dark:bg-[#222222]"
          style={{
            transformOrigin: "36px 33px",
            transform: "rotate(4deg)",
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/[0.04] to-black/[0.12]" />
        </div>

        {/* Card 1 (Top card: display random photo) */}
        <div
          className="absolute inset-x-0 top-2 z-10 flex h-[320px] flex-col rounded-xs border-2 border-black/40 bg-[#fefdfa] p-2.5 pb-3.5 shadow-[0_22px_45px_rgba(0,0,0,0.8)] dark:border-white/20 dark:bg-[#181818]"
          style={{
            transformOrigin: "36px 33px",
            transform: "rotate(-1deg)",
          }}
        >
          {/* Photo Image Frame */}
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-black/15 bg-paper-warm shadow-inner">
            <img
              src={photo.src}
              alt={photo.title}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_12px_rgba(0,0,0,0.25)]" />
          </div>

          {/* Polaroid Style Label */}
          <div className="mt-2 flex flex-1 flex-col justify-between px-0.5">
            <div>
              <div className="flex items-baseline justify-between gap-1.5">
                <p className="truncate font-display text-[16px] font-bold text-ink-strong">
                  {photo.title}
                </p>
                <span
                  className={cn(
                    "shrink-0 font-mono text-[9px] uppercase tracking-wider rounded-xs px-1.5 py-0.5 shadow-sm",
                    photoTagClass,
                  )}
                >
                  {photo.camera ? photo.camera.split(" ")[0] : "PHOTO"}
                </span>
              </div>
              <p className="mt-0.5 truncate font-ui text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                {photo.location ? `${photo.location} · ` : ""}
                {formatArticleDateline(photo.date)}
              </p>
            </div>

            {photo.desc && (
              <p className="line-clamp-2 font-serif text-[12px] italic leading-snug text-ink-body/85 mt-1">
                "{photo.desc}"
              </p>
            )}
          </div>

          {/* Punch Hole Grommet / Metal Eyelet */}
          <div
            className="pointer-events-none absolute left-[26px] top-[23px] z-20 flex h-[20px] w-[20px] items-center justify-center rounded-full border-[2.5px] border-amber-700 bg-paper-warm shadow-inner dark:border-amber-400"
            aria-hidden="true"
          >
            <div className="h-[9px] w-[9px] rounded-full bg-ink shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]" />
          </div>
        </div>

        {/* Ring Front Segment */}
        <svg
          className="pointer-events-none absolute -top-6 left-1 z-30 h-[72px] w-[72px] overflow-visible"
          viewBox="0 0 72 72"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ring-front-metal-mob" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="75%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <filter id="ring-shadow-mob" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>
          <path
            d="M 14 27 A 27 27 0 0 1 63 36 A 27 27 0 0 1 36 63"
            stroke="url(#ring-front-metal-mob)"
            strokeWidth="5.5"
            strokeLinecap="round"
            filter="url(#ring-shadow-mob)"
          />
          <circle cx="63" cy="36" r="3" fill="#e2e8f0" stroke="#334155" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // Desktop full size stack
  return (
    <div className="group relative h-[490px] w-[360px] select-none lg:h-[540px] lg:w-[410px]">
      {/* 1. Ring Back Segment (Layer 0: rendered behind all cards) */}
      <svg
        className="pointer-events-none absolute -top-8 left-1 z-0 h-[96px] w-[96px] overflow-visible"
        viewBox="0 0 96 96"
        fill="none"
      >
        <defs>
          <linearGradient id="ring-back-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="40%" stopColor="#64748b" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        {/* Ring back arc */}
        <circle
          cx="48"
          cy="48"
          r="36"
          stroke="url(#ring-back-metal)"
          strokeWidth="7"
          className="opacity-95"
        />
      </svg>

      {/* 2. Card 3 (Bottom card: rotated -8.5deg, completely covered) */}
      <div
        className="absolute inset-x-0 top-3 h-[440px] rounded-xs border-2 border-black/30 bg-[#e4ded0] shadow-[0_20px_45px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-out group-hover:-rotate-[12deg] dark:border-white/10 dark:bg-[#1a1a1a] lg:h-[480px]"
        style={{
          transformOrigin: "48px 44px",
          transform: "rotate(-8.5deg)",
        }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/[0.06] to-black/[0.18]" />
      </div>

      {/* 3. Card 2 (Middle card: rotated +7deg, completely covered) */}
      <div
        className="absolute inset-x-0 top-3 h-[440px] rounded-xs border-2 border-black/30 bg-[#ede6d8] shadow-[0_25px_50px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out group-hover:rotate-[10deg] dark:border-white/10 dark:bg-[#222222] lg:h-[480px]"
        style={{
          transformOrigin: "48px 44px",
          transform: "rotate(7deg)",
        }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/[0.04] to-black/[0.12]" />
      </div>

      {/* 4. Card 1 (Top card: large photographic print displaying the random photo) */}
      <div
        className="absolute inset-x-0 top-3 z-10 flex h-[440px] flex-col rounded-xs border-2 border-black/40 bg-[#fefdfa] p-3.5 pb-5 shadow-[0_30px_70px_rgba(0,0,0,0.85)] transition-transform duration-500 ease-out group-hover:-rotate-[0.5deg] dark:border-white/20 dark:bg-[#181818] lg:h-[480px]"
        style={{
          transformOrigin: "48px 44px",
          transform: "rotate(-1.5deg)",
        }}
      >
        {/* Photo Image Frame */}
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-black/15 bg-paper-warm shadow-inner">
          <img
            src={photo.src}
            alt={photo.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.25)]" />
        </div>

        {/* Polaroid Style Label */}
        <div className="mt-3.5 flex flex-1 flex-col justify-between px-1">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate font-display text-[19px] font-bold text-ink-strong lg:text-[21px]">
                {photo.title}
              </p>
              <span
                className={cn(
                  "shrink-0 font-mono text-[10px] uppercase tracking-wider rounded-xs px-2 py-0.5 shadow-sm",
                  photoTagClass,
                )}
              >
                {photo.camera ? photo.camera.split(" ")[0] : "PHOTO"}
              </span>
            </div>
            <p className="mt-1 truncate font-ui text-[12px] uppercase tracking-[0.12em] text-ink-muted">
              {photo.location ? `${photo.location} · ` : ""}
              {formatArticleDateline(photo.date)}
            </p>
          </div>

          {photo.desc && (
            <p className="line-clamp-2 font-serif text-[13px] italic leading-relaxed text-ink-body/85">
              "{photo.desc}"
            </p>
          )}
        </div>

        {/* Punch Hole Grommet / Metal Eyelet centered at (48px, 44px) */}
        <div
          className="pointer-events-none absolute left-[34px] top-[30px] z-20 flex h-[28px] w-[28px] items-center justify-center rounded-full border-[3px] border-amber-700 bg-paper-warm shadow-inner dark:border-amber-400"
          aria-hidden="true"
        >
          <div className="h-[13px] w-[13px] rounded-full bg-ink shadow-[inset_0_1px_4px_rgba(0,0,0,0.9)]" />
        </div>
      </div>

      {/* 5. Ring Front Segment (Layer 30: loops through hole over front card) */}
      <svg
        className="pointer-events-none absolute -top-8 left-1 z-30 h-[96px] w-[96px] overflow-visible"
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ring-front-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="75%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <filter id="ring-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="2.5" dy="3.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Front arc looping down into the hole */}
        <path
          d="M 18 36 A 36 36 0 0 1 84 48 A 36 36 0 0 1 48 84"
          stroke="url(#ring-front-metal)"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#ring-shadow)"
        />

        {/* Metallic clasp accent */}
        <circle cx="84" cy="48" r="4" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
