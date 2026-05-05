"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { useDitheredImage } from "@/features/shared/hooks/useDitheredImage";
import type { PostDitheringSettings } from "@/features/shared/types/dithering";

type DitheredImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  dithering: PostDitheringSettings;
  isAnimated?: boolean; // Nowy prop informujący o animacji
  onReadyChange?: (isReady: boolean) => void;
  onErrorChange?: (hasError: boolean) => void;
};

export function DitheredImage({
  src,
  alt,
  className,
  width = 1200,
  height = 1200,
  sizes,
  dithering,
  isAnimated = false,
  onReadyChange,
  onErrorChange,
}: DitheredImageProps) {
  const { processedSrc, isReady, hasError } = useDitheredImage({
    src: isAnimated ? "" : src,
    dithering,
  });

  const effectiveReady = isAnimated ? true : isReady;

  useEffect(() => {
    onReadyChange?.(effectiveReady);
  }, [effectiveReady, onReadyChange]);

  useEffect(() => {
    onErrorChange?.(hasError);
  }, [hasError, onErrorChange]);

  if (!effectiveReady) {
    return (
      <div
        className={`${className ?? ""} animate-pulse bg-white/10`}
        style={{ aspectRatio: `${width} / ${height}` }}
        aria-hidden
      />
    );
  }

  const finalSrc = isAnimated ? src : hasError ? src : (processedSrc ?? src);

  return (
    <Image
      className={className}
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      unoptimized={isAnimated || finalSrc.startsWith("data:")}
    />
  );
}
