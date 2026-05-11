"use client";

import { useAppStore } from "@/lib/store/store";
// import AppearanceSection from "./appearance/AppearanceSection";
import AccountSection from "./account/AccountSection";
import DangerZoneSection from "./danger/DangerZoneSection";
import ContentSection from "./appearance/ContentSection";
import DitheringSection from "./appearance/DitheringSection";

export default function SettingsCard() {
  const user = useAppStore((s) => s.auth.user);

  if (!user) return null;

  return (
    <div className="w-full text-text-main flex flex-col gap-4 sm:gap-6 mt-3 sm:mt-4">
      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-text-main ml-1 sm:ml-2">
        Ustawienia
      </h2>
      {/* <AppearanceSection /> */}
      <ContentSection />
      <DitheringSection />
      <AccountSection />
      <DangerZoneSection />
    </div>
  );
}
