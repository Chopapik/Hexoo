"use client";

import LanguageSwitch from "@/features/shared/components/i18n/LanguageSwitch";
import { useI18n } from "@/i18n/useI18n";
import SettingsSection from "../SettingsSection";

export default function LanguageSection() {
  const { t } = useI18n();

  return (
    <SettingsSection title={t("settings.language.title")}>
      <div className="flex flex-row items-center justify-between gap-2 md:gap-3">
        <div className="min-w-0 flex-1 text-left">
          <h4 className="font-semibold font-sans text-foreground-primary-default">
            {t("common.language")}
          </h4>
          <p className="font-sans text-xs text-foreground-secondary-default md:text-sm">
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
