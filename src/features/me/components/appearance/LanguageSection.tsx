"use client";

import LanguageSwitch from "@/features/shared/components/i18n/LanguageSwitch";
import { useI18n } from "@/i18n/useI18n";
import SettingsSection from "../SettingsSection";

export default function LanguageSection() {
  const { t } = useI18n();

  return (
    <SettingsSection title={t("settings.language.title")}>
      <div className="flex w-full flex-row items-center justify-between gap-2 md:gap-3">
        <div className="min-w-0 flex-1 text-left">
          <h4 className="font-sans text-base font-semibold leading-6 text-foreground-primary-default">
            {t("common.language")}
          </h4>
          <p className="font-sans text-xs leading-4 text-foreground-secondary-default md:text-sm md:leading-5">
            {t("settings.language.copy")}
          </p>
        </div>
        <div className="shrink-0">
          <LanguageSwitch />
        </div>
      </div>
    </SettingsSection>
  );
}
