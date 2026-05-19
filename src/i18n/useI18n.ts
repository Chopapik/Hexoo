"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store/store";
import {
  DEFAULT_LANG,
  translate,
  type Lang,
  type TranslationKey,
} from "./translations";

type TranslationParams = Record<string, string | number>;

export function useI18n() {
  const language = useAppStore((s) => s.settings.language) ?? DEFAULT_LANG;
  const setLanguage = useAppStore((s) => s.setLanguage);

  return useMemo(
    () => ({
      lang: language,
      setLanguage,
      t: (key: TranslationKey, params?: TranslationParams) =>
        translate(language, key, params),
    }),
    [language, setLanguage],
  );
}

export type { Lang, TranslationKey };
