"use client";

import { useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import SettingsSection from "../SettingsSection";
import ChangePasswordModal from "./ChangePasswordModal";
import { useI18n } from "@/i18n/useI18n";

export default function AccountSection() {
  const { t } = useI18n();
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <>
      <SettingsSection title={t("settings.account.title")}>
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1 text-left">
            <h4 className="font-semibold font-sans text-text-main">
              {t("settings.account.passwordTitle")}
            </h4>
            <p className="text-xs sm:text-sm font-sans text-text-neutral">
              {t("settings.account.passwordCopy")}
            </p>
          </div>
          <div className="shrink-0">
            <Button
              text={t("settings.account.changePassword")}
              onClick={() => setPasswordModalOpen(true)}
            />
          </div>
        </div>
      </SettingsSection>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
}
