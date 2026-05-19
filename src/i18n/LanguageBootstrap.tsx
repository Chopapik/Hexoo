"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/store";

export default function LanguageBootstrap() {
  const language = useAppStore((s) => s.settings.language);
  const initializeLanguage = useAppStore((s) => s.initializeLanguage);

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
