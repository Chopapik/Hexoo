"use client";

import { useAppStore } from "@/lib/store/store";
import AppearanceSection from "./appearance/AppearanceSection";
import AccountSection from "./account/AccountSection";
import DangerZoneSection from "./danger/DangerZoneSection";
import ContentSection from "./appearance/ContentSection";
import DitheringSection from "./appearance/DitheringSection";

export default function SettingsCard() {
  const user = useAppStore((s) => s.auth.user);

  if (!user) return null;

  return (
    <div className="w-full text-text-main flex flex-col gap-6 mt-4">
      <h2 className="text-3xl font-bold font-Albert_Sans text-text-main mb-2">
        Ustawienia
      </h2>
      <AppearanceSection />
      <ContentSection />
      <DitheringSection />
      <AccountSection />
      <DangerZoneSection />
    </div>
  );
}
