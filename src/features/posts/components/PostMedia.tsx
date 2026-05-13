"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DitheredImage } from "@/features/shared/components/media/DitheredImage";
import { useAppStore } from "@/lib/store/store";

type PostMediaProps = {
  src: string;
  alt: string;
  onReadyChange?: (isReady: boolean) => void;
};

const MIN_FEED_RATIO = 4 / 5;
const MAX_FEED_RATIO = 16 / 9;
const MAX_BOX_WIDTH = 760;
const MAX_BOX_HEIGHT = 640;
const MIN_BOX_WIDTH = 320;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function PostMedia({ src, alt, onReadyChange }: PostMediaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dithering = useAppStore((s) => s.settings.postDithering);
  const [naturalRatio, setNaturalRatio] = useState(1);
  const [box, setBox] = useState({
    width: 520,
    height: 520,
  });
  const [isAnimated, setIsAnimated] = useState(false);

  const recalculateBox = useCallback(() => {
    const parentWidth =
      containerRef.current?.parentElement?.clientWidth ?? window.innerWidth;

    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

    const maxWidth = Math.min(parentWidth, MAX_BOX_WIDTH);
    const maxHeight = Math.min(viewportHeight * 0.72, MAX_BOX_HEIGHT);

    const feedRatio = clamp(naturalRatio || 1, MIN_FEED_RATIO, MAX_FEED_RATIO);

    let width = maxWidth;
    let height = width / feedRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * feedRatio;
    }

    if (maxWidth >= MIN_BOX_WIDTH && width < MIN_BOX_WIDTH) {
      width = Math.min(MIN_BOX_WIDTH, maxWidth);
      height = Math.min(width / feedRatio, maxHeight);
    }

    setBox({
      width: Math.round(width),
      height: Math.round(height),
    });
  }, [naturalRatio]);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();

    img.onload = () => {
      if (cancelled) return;
      if (img.naturalWidth && img.naturalHeight) {
        setNaturalRatio(img.naturalWidth / img.naturalHeight);
      }
      setIsAnimated(src.toLowerCase().includes(".gif"));
    };

    img.onerror = () => {
      if (cancelled) return;
      setIsAnimated(src.toLowerCase().includes(".gif"));
    };

    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    recalculateBox();

    const parent = containerRef.current?.parentElement;
    const resizeObserver = parent ? new ResizeObserver(recalculateBox) : null;

    if (parent && resizeObserver) {
      resizeObserver.observe(parent);
    }

    window.addEventListener("resize", recalculateBox);
    window.visualViewport?.addEventListener("resize", recalculateBox);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", recalculateBox);
      window.visualViewport?.removeEventListener("resize", recalculateBox);
    };
  }, [recalculateBox]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto overflow-hidden rounded-xl border border-primary-neutral-stroke-default/40 bg-primary-neutral-background-default/30 shadow-sm"
      style={{
        width: `${box.width}px`,
        height: `${box.height}px`,
        maxWidth: "100%",
      }}
    >
      <DitheredImage
        src={src}
        alt={alt}
        width={box.width}
        height={box.height}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 760px"
        className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-[1.02]"
        dithering={dithering}
        isAnimated={isAnimated}
        onReadyChange={onReadyChange}
      />
    </div>
  );
}
