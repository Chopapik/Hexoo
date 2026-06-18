"use client";

import Image from "next/image";
import type { CSSProperties, SyntheticEvent } from "react";
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
  style?: CSSProperties;
  dithering: PostDitheringSettings;
  isAnimated?: boolean; // Indicates that the image is animated.
  onReadyChange?: (isReady: boolean) => void;
  onErrorChange?: (hasError: boolean) => void;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: () => void;
};

export function DitheredImage({
  src,
  alt,
  className,
  width = 1200,
  height = 1200,
  sizes,
  style,
  dithering,
  isAnimated = false,
  onReadyChange,
  onErrorChange,
  onLoad,
  onError,
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
        className={`${className ?? ""} animate-pulse bg-button-glass-card-background-hover`}
        style={{ ...style, aspectRatio: `${width} / ${height}` }}
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
      style={style}
      unoptimized={isAnimated || finalSrc.startsWith("data:")}
      onLoad={onLoad}
      onError={onError}
    />
  );
}
