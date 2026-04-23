import { create } from "zustand";
import type { SessionData } from "@/features/me/me.type";
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

export interface AuthState {
  user: SessionData | null;
  ready: boolean;
}

export interface SettingsState {
  showNSFWPosts: boolean;
  showNSFWComments: boolean;
  postDithering: PostDitheringSettings;
}

export interface CreatePostModalState {
  isOpen: boolean;
}

export interface PresenceStateSlice {
  /** UIDs currently tracked on the global Realtime Presence channel. */
  onlineUids: Set<string>;
}

interface AppState {
  auth: AuthState;
  settings: SettingsState;
  createPostModal: CreatePostModalState;
  presence: PresenceStateSlice;

  setUser: (user: SessionData | null) => void;
  clearUser: () => void;
  setReady: (ready: boolean) => void;

  setPresenceOnlineUids: (uids: Set<string>) => void;

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

  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;
}

const readBootstrapUser = (): SessionData | null => {
  if (typeof window === "undefined") return null;
  return window.__HEXOO_BOOTSTRAP__?.sessionUser ?? null;
};

const readBoolean = (raw: string | null): boolean | null => {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as boolean;
  } catch {
    return null;
  }
};

const readNumber = (raw: string | null): number | null => {
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const clampNumber = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

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

const writeLocalStorage = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
};

const readEnumValue = <T extends string>(
  raw: string | null,
  allowedValues: readonly T[],
): T | null => {
  if (!raw) return null;
  return allowedValues.includes(raw as T) ? (raw as T) : null;
};

export const useAppStore = create<AppState>((set) => ({
  auth: {
    user: readBootstrapUser(),
    ready: true,
  },
  settings: {
    showNSFWPosts: false,
    showNSFWComments: false,
    postDithering: DEFAULT_POST_DITHERING_SETTINGS,
  },
  createPostModal: {
    isOpen: false,
  },
  presence: {
    onlineUids: new Set(),
  },

  setUser: (user) => set((s) => ({ auth: { ...s.auth, user } })),
  clearUser: () => set((s) => ({ auth: { ...s.auth, user: null } })),
  setReady: (ready) => set((s) => ({ auth: { ...s.auth, ready } })),

  setPresenceOnlineUids: (onlineUids) =>
    set((s) => ({
      presence: { ...s.presence, onlineUids: new Set(onlineUids) },
    })),

  setNsfwVisibility: (value) =>
    set((s) => ({ settings: { ...s.settings, showNSFWPosts: value } })),
  setCommentsNsfwVisibility: (value) =>
    set((s) => ({ settings: { ...s.settings, showNSFWComments: value } })),
  initializeSettings: () => {
    if (typeof window === "undefined") return;
    const storedPosts = readBoolean(
      localStorage.getItem("user_settings_nsfw_posts") ??
        localStorage.getItem("user_settings_nsfw"),
    );
    const storedComments = readBoolean(
      localStorage.getItem("user_settings_nsfw_comments"),
    );
    set((s) => ({
      settings: {
        showNSFWPosts: storedPosts ?? s.settings.showNSFWPosts,
        showNSFWComments: storedComments ?? s.settings.showNSFWComments,
        postDithering: s.settings.postDithering,
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

    set((s) => ({
      settings: {
        ...s.settings,
        postDithering: {
          enabled:
            storedEnabled ?? DEFAULT_POST_DITHERING_SETTINGS.enabled,
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
    writeLocalStorage(DITHERING_LOCAL_STORAGE_KEYS.enabled, JSON.stringify(value));
    set((s) => ({
      settings: {
        ...s.settings,
        postDithering: { ...s.settings.postDithering, enabled: value },
      },
    }));
  },
  setDitheringPaletteSize: (value) => {
    const safe = clampNumber(value, 2, 256);
    writeLocalStorage(DITHERING_LOCAL_STORAGE_KEYS.paletteSize, String(safe));
    set((s) => ({
      settings: {
        ...s.settings,
        postDithering: { ...s.settings.postDithering, paletteSize: safe },
      },
    }));
  },
  setDitheringProcessingWidth: (value) => {
    const safe = clampNumber(value, 64, 2048);
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.processingWidth,
      String(safe),
    );
    set((s) => ({
      settings: {
        ...s.settings,
        postDithering: { ...s.settings.postDithering, processingWidth: safe },
      },
    }));
  },
  setDitheringBaseWidth: (value) => {
    const safe = clampNumber(value, 16, 1024);
    writeLocalStorage(DITHERING_LOCAL_STORAGE_KEYS.ditherBaseWidth, String(safe));
    set((s) => ({
      settings: {
        ...s.settings,
        postDithering: { ...s.settings.postDithering, ditherBaseWidth: safe },
      },
    }));
  },
  setDitheringColorDistanceFormula: (value) => {
    writeLocalStorage(DITHERING_LOCAL_STORAGE_KEYS.colorDistanceFormula, value);
    set((s) => ({
      settings: {
        ...s.settings,
        postDithering: { ...s.settings.postDithering, colorDistanceFormula: value },
      },
    }));
  },
  setDitheringPaletteQuantization: (value) => {
    writeLocalStorage(DITHERING_LOCAL_STORAGE_KEYS.paletteQuantization, value);
    set((s) => ({
      settings: {
        ...s.settings,
        postDithering: { ...s.settings.postDithering, paletteQuantization: value },
      },
    }));
  },
  setDitheringImageQuantization: (value) => {
    writeLocalStorage(DITHERING_LOCAL_STORAGE_KEYS.imageQuantization, value);
    set((s) => ({
      settings: {
        ...s.settings,
        postDithering: { ...s.settings.postDithering, imageQuantization: value },
      },
    }));
  },
  setDitheringErrorDiffusionPropagation: (value) => {
    writeLocalStorage(
      DITHERING_LOCAL_STORAGE_KEYS.errorDiffusionPropagation,
      value,
    );
    set((s) => ({
      settings: {
        ...s.settings,
        postDithering: {
          ...s.settings.postDithering,
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

    set((s) => ({
      settings: {
        ...s.settings,
        postDithering: DEFAULT_POST_DITHERING_SETTINGS,
      },
    }));
  },

  openCreatePostModal: () => set({ createPostModal: { isOpen: true } }),
  closeCreatePostModal: () => set({ createPostModal: { isOpen: false } }),
}));
