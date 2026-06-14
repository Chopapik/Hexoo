"use client";

import { useAppStore } from "@/lib/store/store";
// import AppearanceSection from "./appearance/AppearanceSection";
import AccountSection from "./account/AccountSection";
import DangerZoneSection from "./danger/DangerZoneSection";
import ContentSection from "./appearance/ContentSection";
import DitheringSection from "./appearance/DitheringSection";
import LanguageSection from "./appearance/LanguageSection";
import { useI18n } from "@/i18n/useI18n";

export default function SettingsCard() {
  const { t } = useI18n();
  const user = useAppStore((s) => s.auth.user);

  if (!user) return null;

  return (
    <div className="w-full text-foreground-primary-default flex flex-col gap-4 sm:gap-6 mt-3 sm:mt-4">
      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground-primary-default ml-1 sm:ml-2">
        {t("settings.title")}
      </h2>
      {/* <AppearanceSection /> */}
      <LanguageSection />
      <ContentSection />
      <DitheringSection />
      <AccountSection />
      <DangerZoneSection />
    </div>
  );
}
