import {
  COLOR_DISTANCE_FORMULA_OPTIONS,
  DEFAULT_POST_DITHERING_SETTINGS,
  ERROR_DIFFUSION_PROPAGATION_OPTIONS,
  IMAGE_QUANTIZATION_OPTIONS,
  PALETTE_QUANTIZATION_OPTIONS,
  type ColorDistanceFormula,
  type ErrorDiffusionPropagationMode,
  type ImageQuantizationMode,
  type PaletteQuantization,
  type PostDitheringSettings,
} from "@/features/shared/types/dithering";
import {
  DEFAULT_LANG,
  normalizeLang,
  type Lang,
} from "@/i18n/translations";
import {
  clampNumber,
  readBoolean,
  readEnumValue,
  readNumber,
  writeLocalStorage,
} from "@/lib/store/storage";
import type { StoreSlice } from "@/lib/store/storeSlice.type";

export interface SettingsState {
  language: Lang;
  languageOverriddenByUser: boolean;
  showNSFWPosts: boolean;
  showNSFWComments: boolean;
  postDithering: PostDitheringSettings;
}

export interface SettingsSlice {
  settings: SettingsState;

  setLanguage: (value: Lang) => void;
  initializeLanguage: () => void;

  setNsfwVisibility: (value: boolean) => void;
  setCommentsNsfwVisibility: (value: boolean) => void;
  initializeSettings: () => void;

  initializeDitheringSettings: () => void;
  setDitheringEnabled: (value: boolean) => void;
  setDitheringPaletteSize: (value: number) => void;
  setDitheringProcessingWidth: (value: number) => void;
  setDitheringBaseWidth: (value: number) => void;
  setDitheringColorDistanceFormula: (value: ColorDistanceFormula) => void;
  setDitheringPaletteQuantization: (value: PaletteQuantization) => void;
  setDitheringImageQuantization: (value: ImageQuantizationMode) => void;
  setDitheringErrorDiffusionPropagation: (
    value: ErrorDiffusionPropagationMode,
  ) => void;
  resetDitheringSettings: () => void;
}

const LANGUAGE_LOCAL_STORAGE_KEY = "hexoo_language";
const LANGUAGE_OVERRIDE_LOCAL_STORAGE_KEY = "hexoo_language_overridden_by_user";

const DITHERING_LOCAL_STORAGE_KEYS = {
  enabled: "user_settings_dithering_enabled",
  paletteSize: "user_settings_dithering_palette_size",
  processingWidth: "user_settings_dithering_processing_width",
  ditherBaseWidth: "user_settings_dithering_base_width",
  colorDistanceFormula: "user_settings_dithering_color_distance_formula",
  paletteQuantization: "user_settings_dithering_palette_quantization",
  imageQuantization: "user_settings_dithering_image_quantization",
  errorDiffusionPropagation:
    "user_settings_dithering_error_diffusion_propagation",
} as const;

const detectClientLanguage = (): Lang => {
  if (typeof navigator === "undefined") {
    return DEFAULT_LANG;
  }

  const preferredLocales = [
    ...(navigator.languages ?? []),
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().locale,
  ];

  for (const locale of preferredLocales) {
    if (typeof locale !== "string") continue;

    const lowerLocale = locale.toLowerCase();

    if (!lowerLocale.startsWith("en") && !lowerLocale.startsWith("pl")) {
      continue;
    }

    return normalizeLang(locale);
  }

  return DEFAULT_LANG;
};

export const createSettingsSlice: StoreSlice<SettingsSlice> = (set) => ({
  settings: {
    language: DEFAULT_LANG,
    languageOverriddenByUser: false,
    showNSFWPosts: false,
    showNSFWComments: false,
    postDithering: DEFAULT_POST_DITHERING_SETTINGS,
  },

  setLanguage: (language) => {
    writeLocalStorage(LANGUAGE_LOCAL_STORAGE_KEY, language);
    writeLocalStorage(LANGUAGE_OVERRIDE_LOCAL_STORAGE_KEY, "1");

    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }

    set((state) => ({
      settings: {
        ...state.settings,
        language,
        languageOverriddenByUser: true,
      },
    }));
  },

  initializeLanguage: () => {
    if (typeof window === "undefined") return;

    const storedLanguageRaw = localStorage.getItem(LANGUAGE_LOCAL_STORAGE_KEY);
    const languageOverriddenByUser =
      localStorage.getItem(LANGUAGE_OVERRIDE_LOCAL_STORAGE_KEY) === "1";

    const language =
      languageOverriddenByUser && storedLanguageRaw !== null
        ? normalizeLang(storedLanguageRaw)
        : detectClientLanguage();

    document.documentElement.lang = language;
    writeLocalStorage(LANGUAGE_LOCAL_STORAGE_KEY, language);

    set((state) => ({
      settings: {
        ...state.settings,
        language,
        languageOverriddenByUser,
      },
    }));
  },

  setNsfwVisibility: (value) =>
    set((state) => ({
      settings: {
        ...state.settings,
        showNSFWPosts: value,
      },
    })),

  setCommentsNsfwVisibility: (value) =>
    set((state) => ({
      settings: {
        ...state.settings,
        showNSFWComments: value,
      },
    })),

  initializeSettings: () => {
    if (typeof window === "undefined") return;

    const storedPosts = readBoolean(
      localStorage.getItem("user_settings_nsfw_posts") ??
        localStorage.getItem("user_settings_nsfw"),
    );

    const storedComments = readBoolean(
      localStorage.getItem("user_settings_nsfw_comments"),
    );

    set((state) => ({
      settings: {
        ...state.settings,
        showNSFWPosts: storedPosts ?? state.settings.showNSFWPosts,
        showNSFWComments: storedComments ?? state.settings.showNSFWComments,
      },
    }));
  },

  initializeDitheringSettings: () => {
    if (typeof window === "undefined") return;

    const storedEnabled = readBoolean(
      localStorage.getItem(DITHERING_LOCAL_STORAGE_KEYS.enabled),
    );

    const storedPaletteSize = readNumber(
      localStorage.getItem(DITHERING_LOCAL_STORAGE_KEYS.paletteSize),
    );

    const storedProcessingWidth = readNumber(
      localStorage.getItem(DITHERING_LOCAL_STORAGE_KEYS.processingWidth),
    );

    const storedDitherBaseWidth = readNumber(
      localStorage.getItem(DITHERING_LOCAL_STORAGE_KEYS.ditherBaseWidth),
    );

    const storedColorDistanceFormula = readEnumValue(
      localStorage.getItem(DITHERING_LOCAL_STORAGE_KEYS.colorDistanceFormula),
      COLOR_DISTANCE_FORMULA_OPTIONS.map((option) => option.value),
    ) as ColorDistanceFormula | null;

    const storedPaletteQuantization = readEnumValue(
      localStorage.getItem(DITHERING_LOCAL_STORAGE_KEYS.paletteQuantization),
      PALETTE_QUANTIZATION_OPTIONS.map((option) => option.value),
    ) as PaletteQuantization | null;

    const storedImageQuantization = readEnumValue(
      localStorage.getItem(DITHERING_LOCAL_STORAGE_KEYS.imageQuantization),
      IMAGE_QUANTIZATION_OPTIONS.map((option) => option.value),
    ) as ImageQuantizationMode | null;

    const storedErrorDiffusionPropagation = readEnumValue(
      localStorage.getItem(
        DITHERING_LOCAL_STORAGE_KEYS.errorDiffusionPropagation,
      ),
      ERROR_DIFFUSION_PROPAGATION_OPTIONS.map((option) => option.value),
    ) as ErrorDiffusionPropagationMode | null;

    set((state) => ({
      settings: {
        ...state.settings,
        postDithering: {
          enabled: storedEnabled ?? DEFAULT_POST_DITHERING_SETTINGS.enabled,
          paletteSize: clampNumber(
            storedPaletteSize ?? DEFAULT_POST_DITHERING_SETTINGS.paletteSize,
            2,
            256,
          ),
          processingWidth: clampNumber(
            storedProcessingWidth ??
              DEFAULT_POST_DITHERING_SETTINGS.processingWidth,
            64,
            2048,
          ),
          ditherBaseWidth: clampNumber(
            storedDitherBaseWidth ??
              DEFAULT_POST_DITHERING_SETTINGS.ditherBaseWidth,
            16,
            1024,
          ),
          colorDistanceFormula:
            storedColorDistanceFormula ??
            DEFAULT_POST_DITHERING_SETTINGS.colorDistanceFormula,
          paletteQuantization:
            storedPaletteQuantization ??
            DEFAULT_POST_DITHERING_SETTINGS.paletteQuantization,
          imageQuantization:
            storedImageQuantization ??
            DEFAULT_POST_DITHERING_SETTINGS.imageQuantization,
          errorDiffusionPropagation:
            storedErrorDiffusionPropagation ??
            DEFAULT_POST_DITHERING_SETTINGS.errorDiffusionPropagation,
        },
      },
    }));
  },

  setDitheringEnabled: (value) => {
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.enabled,
      JSON.stringify(value),
    );

    set((state) => ({
      settings: {
        ...state.settings,
        postDithering: {
          ...state.settings.postDithering,
          enabled: value,
        },
      },
    }));
  },

  setDitheringPaletteSize: (value) => {
    const safe = clampNumber(value, 2, 256);

    writeLocalStorage(DITHERING_LOCAL_STORAGE_KEYS.paletteSize, String(safe));

    set((state) => ({
      settings: {
        ...state.settings,
        postDithering: {
          ...state.settings.postDithering,
          paletteSize: safe,
        },
      },
    }));
  },

  setDitheringProcessingWidth: (value) => {
    const safe = clampNumber(value, 64, 2048);

    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.processingWidth,
      String(safe),
    );

    set((state) => ({
      settings: {
        ...state.settings,
        postDithering: {
          ...state.settings.postDithering,
          processingWidth: safe,
        },
      },
    }));
  },

  setDitheringBaseWidth: (value) => {
    const safe = clampNumber(value, 16, 1024);

    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.ditherBaseWidth,
      String(safe),
    );

    set((state) => ({
      settings: {
        ...state.settings,
        postDithering: {
          ...state.settings.postDithering,
          ditherBaseWidth: safe,
        },
      },
    }));
  },

  setDitheringColorDistanceFormula: (value) => {
    writeLocalStorage(DITHERING_LOCAL_STORAGE_KEYS.colorDistanceFormula, value);

    set((state) => ({
      settings: {
        ...state.settings,
        postDithering: {
          ...state.settings.postDithering,
          colorDistanceFormula: value,
        },
      },
    }));
  },

  setDitheringPaletteQuantization: (value) => {
    writeLocalStorage(DITHERING_LOCAL_STORAGE_KEYS.paletteQuantization, value);

    set((state) => ({
      settings: {
        ...state.settings,
        postDithering: {
          ...state.settings.postDithering,
          paletteQuantization: value,
        },
      },
    }));
  },

  setDitheringImageQuantization: (value) => {
    writeLocalStorage(DITHERING_LOCAL_STORAGE_KEYS.imageQuantization, value);

    set((state) => ({
      settings: {
        ...state.settings,
        postDithering: {
          ...state.settings.postDithering,
          imageQuantization: value,
        },
      },
    }));
  },

  setDitheringErrorDiffusionPropagation: (value) => {
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.errorDiffusionPropagation,
      value,
    );

    set((state) => ({
      settings: {
        ...state.settings,
        postDithering: {
          ...state.settings.postDithering,
          errorDiffusionPropagation: value,
        },
      },
    }));
  },

  resetDitheringSettings: () => {
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.enabled,
      JSON.stringify(DEFAULT_POST_DITHERING_SETTINGS.enabled),
    );
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.paletteSize,
      String(DEFAULT_POST_DITHERING_SETTINGS.paletteSize),
    );
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.processingWidth,
      String(DEFAULT_POST_DITHERING_SETTINGS.processingWidth),
    );
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.ditherBaseWidth,
      String(DEFAULT_POST_DITHERING_SETTINGS.ditherBaseWidth),
    );
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.colorDistanceFormula,
      DEFAULT_POST_DITHERING_SETTINGS.colorDistanceFormula,
    );
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.paletteQuantization,
      DEFAULT_POST_DITHERING_SETTINGS.paletteQuantization,
    );
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.imageQuantization,
      DEFAULT_POST_DITHERING_SETTINGS.imageQuantization,
    );
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.errorDiffusionPropagation,
      DEFAULT_POST_DITHERING_SETTINGS.errorDiffusionPropagation,
    );

    set((state) => ({
      settings: {
        ...state.settings,
        postDithering: DEFAULT_POST_DITHERING_SETTINGS,
      },
    }));
  },
});
