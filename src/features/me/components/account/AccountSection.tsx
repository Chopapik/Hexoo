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
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h4 className="font-semibold text-text-main">Zmiana hasła</h4>
            <p className="text-sm text-text-neutral">
              Zaktualizuj swoje hasło, aby zwiększyć bezpieczeństwo konta.
            </p>
          </div>
          <Button
            text="Zmień hasło"
            onClick={() => setPasswordModalOpen(true)}
          />
        </div>
      </SettingsSection>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
}
