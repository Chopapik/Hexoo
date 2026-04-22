"use client";

import Image from "next/image";
import { useEffect } from "react";
import {
  useDitheredImage,
  type ImageQuantizationMode,
} from "@/features/shared/hooks/useDitheredImage";

type DitheredImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  paletteSize?: number;
  processingWidth?: number;
  ditherBaseWidth?: number;
  imageQuantization?: ImageQuantizationMode;
  onReadyChange?: (isReady: boolean) => void;
};

export function DitheredImage({
  src,
  alt,
  className,
  width = 1200,
  height = 1200,
  sizes,
  paletteSize = 16,
  processingWidth = 700,
  ditherBaseWidth = 128,
  imageQuantization = "floyd-steinberg",
  onReadyChange,
}: DitheredImageProps) {
  const { processedSrc, isReady, hasError } = useDitheredImage({
    src,
    paletteSize,
    processingWidth,
    ditherBaseWidth,
    imageQuantization,
  });

  useEffect(() => {
    onReadyChange?.(isReady);
  }, [isReady, onReadyChange]);

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
