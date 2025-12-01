"use client";

import { useState, type ReactNode } from "react";
import Button from "@/features/shared/components/ui/Button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useDeleteAccount } from "@/features/me/hooks/useDeleteAccount";
import ChangePasswordModal from "./ChangePasswordModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const SettingsSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="w-full p-4 md:px-6 md:py-5 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default shadow-lg">
    <h3 className="text-lg font-semibold font-Albert_Sans text-text-main mb-4">
      {title}
    </h3>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

export default function SettingsPage() {
  const { logout } = useLogout();
  const { deleteAccount } = useDeleteAccount();
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <>
      <div className="w-full text-text-main flex flex-col gap-6 mt-4">
        <h2 className="text-3xl font-bold font-Albert_Sans text-text-main mb-2">
          Ustawienia konta
        </h2>

        {/* --- Password Change Section --- */}
        <SettingsSection title="Bezpieczeństwo">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h4 className="font-semibold text-text-main">Hasło</h4>
              <p className="text-sm text-text-neutral">
                Regularna zmiana hasła zwiększa bezpieczeństwo Twojego konta.
              </p>
            </div>
            <Button
              text="Zmień hasło"
              variant="gradient-fuchsia"
              onClick={() => setPasswordModalOpen(true)}
            />
          </div>
        </SettingsSection>

        {/* --- Account Management Section --- */}
        <SettingsSection title="Zarządzanie kontem">
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
                Trwałe usunięcie konta i wszystkich powiązanych z nim danych.
                Tej akcji nie można cofnąć.
              </p>
            </div>
            <Button
              variant="danger"
              text="Usuń konto"
              onClick={() => setDeleteModalOpen(true)}
            />
          </div>
        </SettingsSection>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteAccount}
      />
    </>
  );
}
