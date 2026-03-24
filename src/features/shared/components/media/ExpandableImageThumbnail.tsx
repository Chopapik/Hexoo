"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ExpandableImageThumbnailProps = {
  src: string;
  alt: string;
  /** Optional extra classes for the thumb button */
  thumbClassName?: string;
  /** Smaller thumb (e.g. parent post vs. main content) */
  variant?: "default" | "compact";
};

/** Thumbnail that opens a fullscreen lightbox (Esc, backdrop click, close button). */
export function ExpandableImageThumbnail({
  src,
  alt,
  thumbClassName,
  variant = "default",
}: ExpandableImageThumbnailProps) {
  const thumbImgClass =
    variant === "compact"
      ? "h-16 w-auto max-w-[min(100%,140px)] object-cover transition-transform duration-200 group-hover:scale-[1.03]"
      : "h-28 w-auto max-w-[min(100%,220px)] object-cover transition-transform duration-200 group-hover:scale-[1.03]";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const overlay =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-220 flex items-center justify-center bg-black/92 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
            role="presentation"
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              aria-label="Zamknij podgląd"
            >
              ✕ Zamknij
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element -- fullscreen uses raw img */}
            <img
              src={src}
              alt={alt}
              className="max-h-[92vh] max-w-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative block max-w-full overflow-hidden rounded-xl border border-white/15 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 ${thumbClassName ?? ""}`}
        aria-label={`Powiększ obraz: ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={320}
          height={320}
          className={thumbImgClass}
        />
        <span className="pointer-events-none absolute inset-0 flex items-end justify-center bg-linear-to-t from-black/70 via-black/20 to-transparent pb-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Pełny ekran
          </span>
        </span>
      </button>
      {overlay}
    </>
  );
}
