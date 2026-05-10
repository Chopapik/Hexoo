"use client";

import { useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useDeleteAccount } from "@/features/me/hooks/useDeleteAccount";
import SettingsSection from "../SettingsSection";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { LogOut, Trash2 } from "lucide-react";

export default function DangerZoneSection() {
  const { logout } = useLogout();
  const { deleteAccount } = useDeleteAccount();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <>
      <SettingsSection title="Strefa niebezpieczna">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="min-w-0 flex-1 text-left">
            <h4 className="font-semibold font-sans text-text-main">
              Wyloguj się
            </h4>
            <p className="text-sm font-sans text-text-neutral">
              Zakończ obecną sesję na tym urządzeniu.
            </p>
          </div>
          <div className="shrink-0">
            <Button
              variant="default"
              text="Wyloguj się"
              rightIcon={<LogOut className="size-4" />}
              onClick={() => logout()}
            />
          </div>
        </div>
        <div className="w-full h-px bg-primary-neutral-stroke-default my-2" />
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="min-w-0 flex-1 text-left">
            <h4 className="font-semibold font-sans text-red-500">Usuń konto</h4>
            <p className="text-sm font-sans text-text-neutral">
              Trwałe usunięcie konta i wszystkich powiązanych z nim danych. Tej
              akcji nie można cofnąć.
            </p>
          </div>
          <div className="shrink-0">
            <Button
              variant="danger"
              text="Usuń konto"
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
