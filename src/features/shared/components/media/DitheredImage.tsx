"use client";

import Image from "next/image";
import { useEffect } from "react";
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
  onReadyChange,
  onErrorChange,
}: DitheredImageProps) {
  const { processedSrc, isReady, hasError } = useDitheredImage({
    src,
    dithering,
  });

  useEffect(() => {
    onReadyChange?.(isReady);
  }, [isReady, onReadyChange]);

  useEffect(() => {
    onErrorChange?.(hasError);
  }, [hasError, onErrorChange]);

  if (!isReady) {
    return (
      <div
        className={`${className ?? ""} animate-pulse bg-white/10`}
        style={{ aspectRatio: `${width} / ${height}` }}
        aria-hidden
      />
    );
  }

  const finalSrc = hasError ? src : processedSrc ?? src;

  return (
    <Image
      className={className}
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      unoptimized={finalSrc.startsWith("data:")}
    />
  );
}
