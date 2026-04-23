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
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <h4
                id="posts-dithering-label"
                className="font-semibold text-text-main"
              >
                Włącz dithering
              </h4>
              <p className="text-sm text-text-neutral">
                Ustawienia wpływają na wygląd obrazków w postach i w podglądzie.
              </p>
            </div>
            <SwitchButton
              checked={settings.enabled}
              onChange={setDitheringEnabled}
              labelledBy="posts-dithering-label"
            />
          </div>

          <div className="rounded-lg border border-primary-neutral-stroke-default/70 bg-secondary-neutral-background-default/40 p-3 text-sm text-text-neutral">
            <p className="font-medium text-text-main">Aktualna konfiguracja</p>
            <p className="mt-1">{summary}</p>
            <p className="mt-1">
              Processing: {settings.processingWidth}px, Base:{" "}
              {settings.ditherBaseWidth}px, Distance:{" "}
              {settings.colorDistanceFormula}.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              text="Skonfiguruj"
              size="md"
              onClick={() => setIsModalOpen(true)}
            />
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
