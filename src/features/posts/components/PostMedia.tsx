"use client";

import type { CSSProperties, SyntheticEvent } from "react";
import { useMemo, useState } from "react";
import { DitheredImage } from "@/features/shared/components/media/DitheredImage";
import { cn } from "@/features/shared/utils/utils";
import { useI18n } from "@/i18n/useI18n";
import { useAppStore } from "@/lib/store/store";

type ImageDimensions = {
  width: number;
  height: number;
};

type ImageState = {
  src: string;
  dimensions: ImageDimensions | null;
  isReady: boolean;
  hasError: boolean;
};

type PostMediaProps = {
  src: string;
  alt: string;
  className?: string;
  intrinsicDimensions?: ImageDimensions;
  presentation?: "inline" | "modal";
  onReadyChange?: (isReady: boolean) => void;
};

const DEFAULT_IMAGE_ASPECT_RATIO = 16 / 9;

function isGifSource(src: string) {
  return src.split("?")[0]?.toLowerCase().endsWith(".gif") ?? false;
}

export function PostMedia({
  src,
  alt,
  className,
  intrinsicDimensions,
  presentation = "inline",
  onReadyChange,
}: PostMediaProps) {
  const { t } = useI18n();
  const dithering = useAppStore((s) => s.settings.postDithering);
  const isAnimated = isGifSource(src);
  const [imageState, setImageState] = useState<ImageState>({
    src,
    dimensions: intrinsicDimensions ?? null,
    isReady: false,
    hasError: false,
  });
  const isCurrentImageState = imageState.src === src;
  const imageDimensions = isCurrentImageState
    ? (imageState.dimensions ?? intrinsicDimensions ?? null)
    : (intrinsicDimensions ?? null);
  const isImageReady = isCurrentImageState && imageState.isReady;
  const hasImageError = isCurrentImageState && imageState.hasError;

  const imageAspectRatio =
    imageDimensions?.width && imageDimensions.height
      ? imageDimensions.width / imageDimensions.height
      : DEFAULT_IMAGE_ASPECT_RATIO;

  const mediaStyle = useMemo<CSSProperties>(
    () => ({ aspectRatio: `${imageAspectRatio}` }),
    [imageAspectRatio],
  );

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    setImageState({
      src,
      dimensions:
        naturalWidth > 0 && naturalHeight > 0
          ? { width: naturalWidth, height: naturalHeight }
          : imageDimensions,
      isReady: true,
      hasError: false,
    });
    onReadyChange?.(true);
  };

  const handleImageError = () => {
    setImageState({
      src,
      dimensions: imageDimensions,
      isReady: true,
      hasError: true,
    });
    onReadyChange?.(true);
  };

  const imageSizes =
    presentation === "inline"
      ? "(max-width: 768px) calc(100vw - 48px), 624px"
      : "(max-width: 1024px) 100vw, calc(100vw - 460px)";

  const showLoadingState = !isImageReady && !hasImageError;

  return (
    <div
      className={cn(
        "relative flex w-full max-w-full items-center justify-center overflow-hidden bg-surface-card-background-default",
        presentation === "inline"
          ? "min-h-[220px] max-h-[313px] rounded-xl border border-surface-card-border-default/60 md:h-[321px] md:max-h-none md:min-h-0 lg:h-[364px]"
          : "min-h-[220px] max-h-[313px] bg-modal-overlay-background-default/30 md:h-[321px] md:max-h-none md:min-h-0 lg:h-[364px]",
        className,
      )}
      style={mediaStyle}
    >
      {!hasImageError && (
        <DitheredImage
          src={src}
          alt=""
          width={1200}
          height={1200}
          sizes={imageSizes}
          className="absolute inset-0 h-full w-full scale-110 object-cover object-center opacity-80 blur-2xl brightness-50 saturate-75"
          dithering={dithering}
          isAnimated={isAnimated}
        />
      )}

      <div className="absolute inset-0 bg-surface-card-background-default/55" />

      {hasImageError ? (
        <div className="relative z-10 flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-foreground-secondary-default">
          <span className="rounded-full border border-surface-card-border-default bg-button-glass-card-background-default px-3 py-1 text-xs font-medium uppercase tracking-wide">
            {t("post.imageUnavailable")}
          </span>
        </div>
      ) : (
        <DitheredImage
          src={src}
          alt={alt}
          width={1200}
          height={1200}
          sizes={imageSizes}
          className={cn(
            "relative z-10 h-full w-full object-contain object-center",
            showLoadingState && "animate-pulse",
          )}
          dithering={dithering}
          isAnimated={isAnimated}
          onReadyChange={(isReady) => {
            if (!isReady) onReadyChange?.(false);
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
}
