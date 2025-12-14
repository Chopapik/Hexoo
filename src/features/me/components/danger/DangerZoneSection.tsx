"use client";

import { useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useDeleteAccount } from "@/features/me/hooks/useDeleteAccount";
import SettingsSection from "../SettingsSection";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function DangerZoneSection() {
  const { logout } = useLogout();
  const { deleteAccount } = useDeleteAccount();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <>
      <SettingsSection title="Strefa niebezpieczna">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h4 className="font-semibold text-text-main">Wyloguj się</h4>
            <p className="text-sm text-text-neutral">
              Zakończ obecną sesję na tym urządzeniu.
            </p>
          </div>
          <Button
            variant="icon-fuchsia-solid"
            text="Wyloguj się"
            onClick={() => logout()}
          />
        </div>
        <div className="w-full h-px bg-primary-neutral-stroke-default my-2" />
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h4 className="font-semibold text-red-500">Usuń konto</h4>
            <p className="text-sm text-text-neutral">
              Trwałe usunięcie konta i wszystkich powiązanych z nim danych. Tej
              akcji nie można cofnąć.
            </p>
          </div>
          <Button
            variant="danger"
            text="Usuń konto"
            onClick={() => setDeleteModalOpen(true)}
          />
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
