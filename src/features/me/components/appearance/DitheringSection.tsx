"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import SwitchButton from "@/features/shared/components/ui/SwitchButton";
import SettingsSection from "../SettingsSection";
import { useAppStore } from "@/lib/store/store";
import DitheringSettingsModal from "./DitheringSettingsModal";
import { useI18n } from "@/i18n/useI18n";

export default function DitheringSection() {
  const { t } = useI18n();
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
        ? t("settings.dithering.colorsSummary", {
            count: settings.paletteSize,
            palette: settings.paletteQuantization,
            image: settings.imageQuantization,
          })
        : t("settings.dithering.offSummary"),
    [settings, t],
  );

  return (
    <>
      <SettingsSection title={t("settings.dithering.title")}>
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
            <div className="min-w-0 flex-1 text-left">
              <h4
                id="posts-dithering-label"
                className="font-semibold font-sans text-text-main"
              >
                {t("settings.dithering.enable")}
              </h4>
              <p className="text-xs sm:text-sm font-sans text-text-neutral">
                {t("settings.dithering.copy")}
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

          <div className="rounded-lg border border-primary-neutral-stroke-default/70 bg-secondary-neutral-background-default/40 p-2.5 sm:p-3 text-xs sm:text-sm font-sans text-text-neutral">
            <p className="font-medium font-sans text-text-main">
              {t("settings.dithering.summaryTitle")}
            </p>
            <p className="mt-1 font-sans">{summary}</p>
            <p className="mt-1 font-sans">
              Processing: {settings.processingWidth}px, Base:{" "}
              {settings.ditherBaseWidth}px, Distance:{" "}
              {settings.colorDistanceFormula}.
            </p>
          </div>

          <div className="flex w-full flex-row items-center gap-2 sm:gap-3">
            <div className="min-w-0 flex-1" />
            <div className="shrink-0">
              <Button
                text={t("common.configure")}
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
