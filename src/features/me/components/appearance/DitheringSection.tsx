"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import SwitchButton from "@/features/shared/components/ui/SwitchButton";
import SettingsSection from "../SettingsSection";
import { useAppStore } from "@/lib/store/store";
import DitheringSettingsModal from "./DitheringSettingsModal";

export default function DitheringSection() {
  const settings = useAppStore((s) => s.settings.postDithering);
  const initializeDitheringSettings = useAppStore(
    (s) => s.initializeDitheringSettings,
  );
  const setDitheringEnabled = useAppStore((s) => s.setDitheringEnabled);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    initializeDitheringSettings();
  }, [initializeDitheringSettings]);

  const summary = useMemo(
    () =>
      settings.enabled
        ? `${settings.paletteSize} kolorów, ${settings.paletteQuantization}, ${settings.imageQuantization}`
        : "Wyłączony - obrazy są wyświetlane bez przeróbki",
    [settings],
  );

  return (
    <>
      <SettingsSection title="Dithering postów">
        <div className="flex flex-col gap-5">
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="min-w-0 flex-1 text-left">
              <h4
                id="posts-dithering-label"
                className="font-semibold font-sans text-text-main"
              >
                Włącz dithering
              </h4>
              <p className="text-sm font-sans text-text-neutral">
                Ustawienia wpływają na wygląd obrazków w postach i w podglądzie.
              </p>
            </div>
            <div className="shrink-0">
              <SwitchButton
                checked={settings.enabled}
                onChange={setDitheringEnabled}
                labelledBy="posts-dithering-label"
              />
            </div>
          </div>

          <div className="rounded-lg border border-primary-neutral-stroke-default/70 bg-secondary-neutral-background-default/40 p-3 text-sm font-sans text-text-neutral">
            <p className="font-medium font-sans text-text-main">
              Aktualna konfiguracja
            </p>
            <p className="mt-1 font-sans">{summary}</p>
            <p className="mt-1 font-sans">
              Processing: {settings.processingWidth}px, Base:{" "}
              {settings.ditherBaseWidth}px, Distance:{" "}
              {settings.colorDistanceFormula}.
            </p>
          </div>

          <div className="flex w-full flex-row items-center gap-3">
            <div className="min-w-0 flex-1" />
            <div className="shrink-0">
              <Button
                text="Skonfiguruj"
                size="md"
                onClick={() => setIsModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      <DitheringSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
