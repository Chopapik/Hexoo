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
    <div className="mx-auto mt-2 flex w-full flex-col gap-2 text-foreground-primary-default md:mt-0 md:gap-3 pb-16">
      <h2 className="px-3 font-serif text-2xl font-bold leading-8 text-foreground-primary-default md:px-4">
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
