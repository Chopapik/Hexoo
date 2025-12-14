"use client";

import { useAppSelector } from "@/lib/store/hooks";
import AppearanceSection from "./appearance/AppearanceSection";
import AccountSection from "./account/AccountSection";
import DangerZoneSection from "./danger/DangerZoneSection";

export default function SettingsCard() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  return (
    <div className="w-full text-text-main flex flex-col gap-6 mt-4">
      <h2 className="text-3xl font-bold font-Albert_Sans text-text-main mb-2">
        Ustawienia
      </h2>
      <AppearanceSection />
      <AccountSection />
      <DangerZoneSection />
    </div>
  );
}
