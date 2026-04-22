"use client";

import { useEffect, useMemo, useState } from "react";
import { applyPaletteSync, buildPaletteSync, utils } from "image-q";

export type ImageQuantizationMode =
  | "nearest"
  | "floyd-steinberg"
  | "false-floyd-steinberg"
  | "stucki"
  | "atkinson"
  | "jarvis"
  | "burkes"
  | "sierra"
  | "two-sierra"
  | "sierra-lite"
  | "riemersma";

export type UseDitheredImageParams = {
  src: string;
  paletteSize?: number;
  processingWidth?: number;
  ditherBaseWidth?: number;
  imageQuantization?: ImageQuantizationMode;
};

export type UseDitheredImageResult = {
  processedSrc: string | null;
  isReady: boolean;
  hasError: boolean;
};

const resultCache = new Map<string, string>();
const inFlightCache = new Map<string, Promise<string>>();

async function renderDitheredToDataUrl({
  src,
  paletteSize,
  processingWidth,
  ditherBaseWidth,
  imageQuantization,
  cacheKey,
}: {
  src: string;
  paletteSize: number;
  processingWidth: number;
  ditherBaseWidth: number;
  imageQuantization: ImageQuantizationMode;
  cacheKey: string;
}) {
  const cached = resultCache.get(cacheKey);
  if (cached) return cached;

  const inFlight = inFlightCache.get(cacheKey);
  if (inFlight) return inFlight;

  const promise = new Promise<string>((resolve, reject) => {
    const img = new window.Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth || 0;
        const naturalHeight = img.naturalHeight || 0;

        if (!naturalWidth || !naturalHeight) {
          throw new Error("Image has invalid dimensions.");
        }

        const previewWidth = Math.max(
          1,
          Math.min(processingWidth, naturalWidth),
        );
        const previewHeight = Math.max(
          1,
          Math.round((naturalHeight / naturalWidth) * previewWidth),
        );

        const tinyWidth = Math.max(1, Math.min(ditherBaseWidth, previewWidth));
        const tinyHeight = Math.max(
          1,
          Math.round((previewHeight / previewWidth) * tinyWidth),
        );

        const tinyCanvas = document.createElement("canvas");
        tinyCanvas.width = tinyWidth;
        tinyCanvas.height = tinyHeight;

        const tinyCtx = tinyCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!tinyCtx) {
          throw new Error("2D canvas context is not available.");
        }

        tinyCtx.imageSmoothingEnabled = true;
        tinyCtx.drawImage(img, 0, 0, tinyWidth, tinyHeight);

        const tinyImageData = tinyCtx.getImageData(0, 0, tinyWidth, tinyHeight);
        const pointContainer = utils.PointContainer.fromUint8Array(
          tinyImageData.data,
          tinyWidth,
          tinyHeight,
        );

        const palette = buildPaletteSync([pointContainer], {
          colors: paletteSize,
          paletteQuantization: "wuquant",
          colorDistanceFormula: "euclidean-bt709",
        });

        const quantizedPointContainer = applyPaletteSync(
          pointContainer,
          palette,
          {
            imageQuantization,
            colorDistanceFormula: "euclidean-bt709",
          },
        );

        const quantizedTinyPixels = quantizedPointContainer.toUint8Array();
        tinyCtx.putImageData(
          new ImageData(
            new Uint8ClampedArray(quantizedTinyPixels),
            tinyWidth,
            tinyHeight,
          ),
          0,
          0,
        );

        const outputCanvas = document.createElement("canvas");
        outputCanvas.width = previewWidth;
        outputCanvas.height = previewHeight;

        const outputCtx = outputCanvas.getContext("2d");
        if (!outputCtx) {
          throw new Error("Output canvas context is not available.");
        }

        outputCtx.imageSmoothingEnabled = false;
        outputCtx.clearRect(0, 0, previewWidth, previewHeight);
        outputCtx.drawImage(
          tinyCanvas,
          0,
          0,
          tinyWidth,
          tinyHeight,
          0,
          0,
          previewWidth,
          previewHeight,
        );

        const output = outputCanvas.toDataURL("image/png");
        resultCache.set(cacheKey, output);
        resolve(output);
      } catch (error) {
        reject(error);
      } finally {
        inFlightCache.delete(cacheKey);
      }
    };

    img.onerror = () => {
      inFlightCache.delete(cacheKey);
      reject(new Error("Failed to load image."));
    };

    img.src = src;
  });

  inFlightCache.set(cacheKey, promise);
  return promise;
}

export function useDitheredImage({
  src,
  paletteSize = 16,
  processingWidth = 700,
  ditherBaseWidth = 128,
  imageQuantization = "floyd-steinberg",
}: UseDitheredImageParams): UseDitheredImageResult {
  const cacheKey = useMemo(
    () =>
      [
        src,
        `p${paletteSize}`,
        `w${processingWidth}`,
        `d${ditherBaseWidth}`,
        `q${imageQuantization}`,
      ].join("::"),
    [src, paletteSize, processingWidth, ditherBaseWidth, imageQuantization],
  );

  const [processedSrc, setProcessedSrc] = useState<string | null>(
    () => resultCache.get(cacheKey) ?? null,
  );
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState<boolean>(() =>
    resultCache.has(cacheKey),
  );

  useEffect(() => {
    let cancelled = false;

    setHasError(false);

    const cached = resultCache.get(cacheKey);
    if (cached) {
      setProcessedSrc(cached);
      setIsReady(true);
      return () => {
        cancelled = true;
      };
    }

    setProcessedSrc(null);
    setIsReady(false);

    renderDitheredToDataUrl({
      src,
      paletteSize,
      processingWidth,
      ditherBaseWidth,
      imageQuantization,
      cacheKey,
    })
      .then((output) => {
        if (cancelled) return;
        setProcessedSrc(output);
        setIsReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setHasError(true);
        setProcessedSrc(null);
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [
    cacheKey,
    src,
    paletteSize,
    processingWidth,
    ditherBaseWidth,
    imageQuantization,
  ]);

  return { processedSrc, isReady, hasError };
}
