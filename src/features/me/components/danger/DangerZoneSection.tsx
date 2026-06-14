"use client";

import { useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useDeleteAccount } from "@/features/me/hooks/useDeleteAccount";
import SettingsSection from "../SettingsSection";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { LogOut, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

export default function DangerZoneSection() {
  const { t } = useI18n();
  const { logout } = useLogout();
  const { deleteAccount } = useDeleteAccount();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <>
      <SettingsSection title={t("settings.danger.title")}>
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1 text-left">
            <h4 className="font-semibold font-sans text-foreground-primary-default">
              {t("settings.danger.logout")}
            </h4>
            <p className="text-xs sm:text-sm font-sans text-foreground-secondary-default">
              {t("settings.danger.logoutCopy")}
            </p>
          </div>
          <div className="shrink-0">
            <Button
              variant="default"
              text={t("settings.danger.logout")}
              rightIcon={<LogOut className="size-4" />}
              onClick={() => logout()}
            />
          </div>
        </div>
        <div className="w-full h-px bg-surface-card-border-default my-2" />
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1 text-left">
            <h4 className="font-semibold font-sans text-validation-error-text">
              {t("settings.danger.deleteAccount")}
            </h4>
            <p className="text-xs sm:text-sm font-sans text-foreground-secondary-default">
              {t("settings.danger.deleteCopy")}
            </p>
          </div>
          <div className="shrink-0">
            <Button
              variant="danger"
              text={t("settings.danger.deleteAccount")}
              rightIcon={<Trash2 className="size-4" />}
              onClick={() => setDeleteModalOpen(true)}
            />
          </div>
        </div>
      </SettingsSection>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteAccount}
      />
    </>
  );
}
