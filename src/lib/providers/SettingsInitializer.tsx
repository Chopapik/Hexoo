"use client";

import { useEffect } from "react";

import { useAppStore } from "@/lib/store/store";

let hasInitializedSettings = false;

export default function SettingsInitializer() {
  useEffect(() => {
    if (hasInitializedSettings) return;
    hasInitializedSettings = true;

    const { initializeSettings, initializeDitheringSettings } =
      useAppStore.getState();

    initializeSettings();
    initializeDitheringSettings();
  }, []);

  return null;
}
