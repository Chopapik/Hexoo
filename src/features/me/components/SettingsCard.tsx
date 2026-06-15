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
    <div className="mt-3 flex w-full flex-col gap-4 text-foreground-primary-default md:mt-4 md:gap-6">
      <h2 className="ml-1 font-serif text-3xl font-bold text-foreground-primary-default md:ml-2 md:text-4xl">
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
