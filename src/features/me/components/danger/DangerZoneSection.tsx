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
        <div className="flex w-full flex-row items-center justify-between gap-2 md:gap-3">
          <div className="min-w-0 flex-1 text-left">
            <h4 className="font-sans text-base font-semibold leading-6 text-foreground-primary-default">
              {t("settings.danger.logout")}
            </h4>
            <p className="font-sans text-xs leading-4 text-foreground-secondary-default md:text-sm md:leading-5">
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
        <div className="my-1 h-px w-full bg-surface-card-border-default" />
        <div className="flex w-full flex-row items-center justify-between gap-2 md:gap-3">
          <div className="min-w-0 flex-1 text-left">
            <h4 className="font-sans text-base font-semibold leading-6 text-validation-error-text">
              {t("settings.danger.deleteAccount")}
            </h4>
            <p className="font-sans text-xs leading-4 text-foreground-secondary-default md:text-sm md:leading-5">
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
