"use client";

import { useEffect, useMemo, useState } from "react";
import { distance, image, palette, utils } from "image-q";
import type { PostDitheringSettings } from "@/features/shared/types/dithering";

export type UseDitheredImageParams = {
  src: string;
  dithering: PostDitheringSettings;
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
  dithering,
  cacheKey,
}: {
  src: string;
  dithering: PostDitheringSettings;
  cacheKey: string;
}) {
  const cached = resultCache.get(cacheKey);
  if (cached) return cached;

  const inFlight = inFlightCache.get(cacheKey);
  if (inFlight) return inFlight;

  const promise = new Promise<string>((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;

        if (!naturalWidth || !naturalHeight) {
          resolve(src);
          return;
        }

        const previewWidth = Math.max(
          1,
          Math.min(dithering.processingWidth, naturalWidth),
        );
        const previewHeight = Math.max(
          1,
          Math.round((naturalHeight / naturalWidth) * previewWidth),
        );

        const tinyWidth = Math.max(
          1,
          Math.min(dithering.ditherBaseWidth, previewWidth),
        );
        const tinyHeight = Math.max(
          1,
          Math.round((previewHeight / previewWidth) * tinyWidth),
        );

        const workCanvas = document.createElement("canvas");
        workCanvas.width = previewWidth;
        workCanvas.height = previewHeight;

        const workCtx = workCanvas.getContext("2d", {
          willReadFrequently: true,
        });

        if (!workCtx) {
          resolve(src);
          return;
        }

        workCtx.imageSmoothingEnabled = true;
        workCtx.drawImage(img, 0, 0, previewWidth, previewHeight);

        const tinyCanvas = document.createElement("canvas");
        tinyCanvas.width = tinyWidth;
        tinyCanvas.height = tinyHeight;

        const tinyCtx = tinyCanvas.getContext("2d", {
          willReadFrequently: true,
        });

        if (!tinyCtx) {
          resolve(src);
          return;
        }

        tinyCtx.imageSmoothingEnabled = true;
        tinyCtx.drawImage(workCanvas, 0, 0, tinyWidth, tinyHeight);

        const tinyImageData = tinyCtx.getImageData(0, 0, tinyWidth, tinyHeight);
        const pointContainer = utils.PointContainer.fromUint8Array(
          tinyImageData.data,
          tinyWidth,
          tinyHeight,
        );

        const distanceCalculator = createDistanceCalculator(
          dithering.colorDistanceFormula,
        );

        const paletteQuantizer = createPaletteQuantizer(
          dithering.paletteQuantization,
          distanceCalculator,
          dithering.paletteSize,
        );

        paletteQuantizer.sample(pointContainer);
        const quantizedPalette = paletteQuantizer.quantizeSync();

        const imageQuantizer = createImageQuantizer(
          dithering.imageQuantization,
          distanceCalculator,
          dithering.errorDiffusionPropagation,
        );

        const quantizedPointContainer = imageQuantizer.quantizeSync(
          pointContainer,
          quantizedPalette,
        );

        const quantizedTinyPixels = quantizedPointContainer.toUint8Array();

        const quantizedTinyImageData = new ImageData(
          new Uint8ClampedArray(quantizedTinyPixels),
          tinyWidth,
          tinyHeight,
        );

        tinyCtx.putImageData(quantizedTinyImageData, 0, 0);

        workCtx.clearRect(0, 0, previewWidth, previewHeight);
        workCtx.imageSmoothingEnabled = false;
        workCtx.drawImage(tinyCanvas, 0, 0, previewWidth, previewHeight);

        const outCanvas = document.createElement("canvas");
        outCanvas.width = naturalWidth;
        outCanvas.height = naturalHeight;

        const outCtx = outCanvas.getContext("2d");
        if (!outCtx) {
          resolve(src);
          return;
        }

        outCtx.imageSmoothingEnabled = false;
        outCtx.drawImage(workCanvas, 0, 0, naturalWidth, naturalHeight);

        const dataUrl = outCanvas.toDataURL("image/png");
        resultCache.set(cacheKey, dataUrl);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      } finally {
        inFlightCache.delete(cacheKey);
      }
    };

    img.onerror = () => {
      inFlightCache.delete(cacheKey);
      reject(new Error(`Failed to load image for dithering: ${src}`));
    };

    img.src = src;
  });

  inFlightCache.set(cacheKey, promise);
  return promise;
}

export function useDitheredImage({
  src,
  dithering,
}: UseDitheredImageParams): UseDitheredImageResult {
  const isEnabled = dithering.enabled;

  const cacheKey = useMemo(
    () =>
      [
        src,
        `e${String(dithering.enabled)}`,
        `p${dithering.paletteSize}`,
        `w${dithering.processingWidth}`,
        `d${dithering.ditherBaseWidth}`,
        `cdf${dithering.colorDistanceFormula}`,
        `pq${dithering.paletteQuantization}`,
        `iq${dithering.imageQuantization}`,
        `edp${dithering.errorDiffusionPropagation}`,
      ].join("::"),
    [
      src,
      dithering.enabled,
      dithering.paletteSize,
      dithering.processingWidth,
      dithering.ditherBaseWidth,
      dithering.colorDistanceFormula,
      dithering.paletteQuantization,
      dithering.imageQuantization,
      dithering.errorDiffusionPropagation,
    ],
  );

  const [processedSrc, setProcessedSrc] = useState<string | null>(
    resultCache.get(cacheKey) ?? null,
  );
  const [isReady, setIsReady] = useState<boolean>(
    Boolean(resultCache.get(cacheKey)),
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setIsReady(false);
    setHasError(false);

    if (!isEnabled) {
      setProcessedSrc(src);
      setIsReady(true);
      return () => {
        cancelled = true;
      };
    }

    const cached = resultCache.get(cacheKey);
    if (cached) {
      setProcessedSrc(cached);
      setIsReady(true);
      return () => {
        cancelled = true;
      };
    }

    renderDitheredToDataUrl({
      src,
      dithering,
      cacheKey,
    })
      .then((output) => {
        if (cancelled) return;
        setProcessedSrc(output);
        setIsReady(true);
      })
      .catch((error) => {
        console.error("Dither preview failed:", error);
        if (cancelled) return;
        setProcessedSrc(src);
        setHasError(true);
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, dithering, isEnabled, src]);

  return { processedSrc, isReady, hasError };
}

function createDistanceCalculator(
  formula: PostDitheringSettings["colorDistanceFormula"],
) {
  switch (formula) {
    case "cie94-textiles":
      return new distance.CIE94Textiles();
    case "cie94-graphic-arts":
      return new distance.CIE94GraphicArts();
    case "ciede2000":
      return new distance.CIEDE2000();
    case "color-metric":
      return new distance.CMetric();
    case "euclidean":
      return new distance.Euclidean();
    case "euclidean-bt709-noalpha":
      return new distance.EuclideanBT709NoAlpha();
    case "euclidean-bt709":
      return new distance.EuclideanBT709();
    case "manhattan":
      return new distance.Manhattan();
    case "manhattan-bt709":
      return new distance.ManhattanBT709();
    case "manhattan-nommyde":
      return new distance.ManhattanNommyde();
    case "pngquant":
      return new distance.PNGQuant();
  }
}

function createPaletteQuantizer(
  quantization: PostDitheringSettings["paletteQuantization"],
  distanceCalculator: ReturnType<typeof createDistanceCalculator>,
  colors: number,
) {
  switch (quantization) {
    case "wuquant":
      return new palette.WuQuant(distanceCalculator, colors);
    case "rgbquant":
      return new palette.RGBQuant(distanceCalculator, colors);
    case "neuquant":
      return new palette.NeuQuant(distanceCalculator, colors);
    case "neuquant-float":
      return new palette.NeuQuantFloat(distanceCalculator, colors);
  }
}

function createImageQuantizer(
  quantization: PostDitheringSettings["imageQuantization"],
  distanceCalculator: ReturnType<typeof createDistanceCalculator>,
  errorDiffusionPropagation: PostDitheringSettings["errorDiffusionPropagation"],
) {
  const useGimpPropagation = errorDiffusionPropagation === "gimp";

  switch (quantization) {
    case "nearest":
      return new image.NearestColor(distanceCalculator);
    case "riemersma":
      return new image.ErrorDiffusionRiemersma(distanceCalculator);
    case "floyd-steinberg":
      return new image.ErrorDiffusionArray(
        distanceCalculator,
        image.ErrorDiffusionArrayKernel.FloydSteinberg,
        true,
        0,
        useGimpPropagation,
      );
    case "false-floyd-steinberg":
      return new image.ErrorDiffusionArray(
        distanceCalculator,
        image.ErrorDiffusionArrayKernel.FalseFloydSteinberg,
        true,
        0,
        useGimpPropagation,
      );
    case "stucki":
      return new image.ErrorDiffusionArray(
        distanceCalculator,
        image.ErrorDiffusionArrayKernel.Stucki,
        true,
        0,
        useGimpPropagation,
      );
    case "atkinson":
      return new image.ErrorDiffusionArray(
        distanceCalculator,
        image.ErrorDiffusionArrayKernel.Atkinson,
        true,
        0,
        useGimpPropagation,
      );
    case "jarvis":
      return new image.ErrorDiffusionArray(
        distanceCalculator,
        image.ErrorDiffusionArrayKernel.Jarvis,
        true,
        0,
        useGimpPropagation,
      );
    case "burkes":
      return new image.ErrorDiffusionArray(
        distanceCalculator,
        image.ErrorDiffusionArrayKernel.Burkes,
        true,
        0,
        useGimpPropagation,
      );
    case "sierra":
      return new image.ErrorDiffusionArray(
        distanceCalculator,
        image.ErrorDiffusionArrayKernel.Sierra,
        true,
        0,
        useGimpPropagation,
      );
    case "two-sierra":
      return new image.ErrorDiffusionArray(
        distanceCalculator,
        image.ErrorDiffusionArrayKernel.TwoSierra,
        true,
        0,
        useGimpPropagation,
      );
    case "sierra-lite":
      return new image.ErrorDiffusionArray(
        distanceCalculator,
        image.ErrorDiffusionArrayKernel.SierraLite,
        true,
        0,
        useGimpPropagation,
      );
  }
}
