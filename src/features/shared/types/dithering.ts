export type ColorDistanceFormula =
  | "cie94-textiles"
  | "cie94-graphic-arts"
  | "ciede2000"
  | "color-metric"
  | "euclidean"
  | "euclidean-bt709-noalpha"
  | "euclidean-bt709"
  | "manhattan"
  | "manhattan-bt709"
  | "manhattan-nommyde"
  | "pngquant";

export type PaletteQuantization =
  | "wuquant"
  | "rgbquant"
  | "neuquant"
  | "neuquant-float";

export type ImageQuantizationMode =
  | "nearest"
  | "riemersma"
  | "floyd-steinberg"
  | "false-floyd-steinberg"
  | "stucki"
  | "atkinson"
  | "jarvis"
  | "burkes"
  | "sierra"
  | "two-sierra"
  | "sierra-lite";

export type ErrorDiffusionPropagationMode = "gimp" | "xnview";

export type PostDitheringSettings = {
  enabled: boolean;
  paletteSize: number;
  processingWidth: number;
  ditherBaseWidth: number;
  colorDistanceFormula: ColorDistanceFormula;
  paletteQuantization: PaletteQuantization;
  imageQuantization: ImageQuantizationMode;
  errorDiffusionPropagation: ErrorDiffusionPropagationMode;
};

export const DEFAULT_POST_DITHERING_SETTINGS: PostDitheringSettings = {
  enabled: true,
  paletteSize: 16,
  processingWidth: 446,
  ditherBaseWidth: 816,
  colorDistanceFormula: "euclidean-bt709",
  paletteQuantization: "neuquant",
  imageQuantization: "floyd-steinberg",
  errorDiffusionPropagation: "gimp",
};

export const COLOR_DISTANCE_FORMULA_OPTIONS: Array<{
  value: ColorDistanceFormula;
  label: string;
}> = [
  { value: "cie94-textiles", label: "cie94-textiles" },
  { value: "cie94-graphic-arts", label: "cie94-graphic-arts" },
  { value: "ciede2000", label: "ciede2000" },
  { value: "color-metric", label: "color-metric" },
  { value: "euclidean", label: "euclidean" },
  { value: "euclidean-bt709-noalpha", label: "euclidean-bt709-noalpha" },
  { value: "euclidean-bt709", label: "euclidean-bt709" },
  { value: "manhattan", label: "manhattan" },
  { value: "manhattan-bt709", label: "manhattan-bt709" },
  { value: "manhattan-nommyde", label: "manhattan-nommyde" },
  { value: "pngquant", label: "pngquant" },
];

export const PALETTE_QUANTIZATION_OPTIONS: Array<{
  value: PaletteQuantization;
  label: string;
}> = [
  { value: "wuquant", label: "wuquant" },
  { value: "rgbquant", label: "rgbquant" },
  { value: "neuquant", label: "neuquant" },
  { value: "neuquant-float", label: "neuquant-float" },
];

export const IMAGE_QUANTIZATION_OPTIONS: Array<{
  value: ImageQuantizationMode;
  label: string;
}> = [
  { value: "nearest", label: "nearest" },
  { value: "riemersma", label: "riemersma" },
  { value: "floyd-steinberg", label: "floyd-steinberg" },
  { value: "false-floyd-steinberg", label: "false-floyd-steinberg" },
  { value: "stucki", label: "stucki" },
  { value: "atkinson", label: "atkinson" },
  { value: "jarvis", label: "jarvis" },
  { value: "burkes", label: "burkes" },
  { value: "sierra", label: "sierra" },
  { value: "two-sierra", label: "two-sierra" },
  { value: "sierra-lite", label: "sierra-lite" },
];

export const ERROR_DIFFUSION_PROPAGATION_OPTIONS: Array<{
  value: ErrorDiffusionPropagationMode;
  label: string;
}> = [
  { value: "gimp", label: "gimp" },
  { value: "xnview", label: "xnview" },
];

export const IMAGE_QUANTIZATION_WITH_PROPAGATION = new Set<ImageQuantizationMode>(
  [
    "floyd-steinberg",
    "false-floyd-steinberg",
    "stucki",
    "atkinson",
    "jarvis",
    "burkes",
    "sierra",
    "two-sierra",
    "sierra-lite",
  ],
);
