"use client";

import { useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import SettingsSection from "../SettingsSection";
import ChangePasswordModal from "./ChangePasswordModal";

export default function AccountSection() {
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <>
      <SettingsSection title="Konto">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="min-w-0 flex-1 text-left">
            <h4 className="font-semibold font-sans text-text-main">
              Zmiana hasła
            </h4>
            <p className="text-sm font-sans text-text-neutral">
              Zaktualizuj swoje hasło, aby zwiększyć bezpieczeństwo konta.
            </p>
          </div>
          <div className="shrink-0">
            <Button
              text="Zmień hasło"
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
