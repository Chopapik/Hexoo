"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type PostMediaProps = {
  src: string;
  alt: string;
};

const MIN_FEED_RATIO = 4 / 5; 
const MAX_FEED_RATIO = 16 / 9; 
const MAX_BOX_WIDTH = 760;
const MAX_BOX_HEIGHT = 640;
const MIN_BOX_WIDTH = 320;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function PostMedia({ src, alt }: PostMediaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [naturalRatio, setNaturalRatio] = useState(1);
  const [box, setBox] = useState({
    width: 520,
    height: 520,
  });

  const recalculateBox = useCallback(() => {
    const parentWidth =
      containerRef.current?.parentElement?.clientWidth ?? window.innerWidth;

    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

    const maxWidth = Math.min(parentWidth * 0.95, MAX_BOX_WIDTH);
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
      className="relative mx-auto overflow-hidden rounded-xl border border-primary-neutral-stroke-default/60 bg-transparent"
      style={{
        width: `${box.width}px`,
        height: `${box.height}px`,
        maxWidth: "95%",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 95vw, (max-width: 1200px) 70vw, 760px"
        className="object-cover object-center"
        onLoad={(event) => {
          const img = event.currentTarget;

          if (img.naturalWidth && img.naturalHeight) {
            setNaturalRatio(img.naturalWidth / img.naturalHeight);
          }
        }}
      />
    </div>
  );
}
