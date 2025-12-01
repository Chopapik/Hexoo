"use client";

import { useState } from "react";
import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import Modal from "@/features/shared/components/layout/Modal";
import type { PasswordUpdate } from "../me.type";
import { useUpdatePassword } from "../hooks/useUpdatePassword";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const { updatePassword, isPending } = useUpdatePassword();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [passwordData, setPasswordData] = useState<PasswordUpdate>({
    oldPassword: "",
    newPassword: "",
    reOldPassword: "",
  });

  const [error, setError] = useState<string | null>(null);

  const updateForm = (field: keyof PasswordUpdate, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validate = (): boolean => {
    if (
      !passwordData.newPassword ||
      !passwordData.oldPassword ||
      !passwordData.reOldPassword
    ) {
      setError("Wypełnij wszystkie pola.");
      return false;
    }
    if (passwordData.newPassword.length < 8) {
      setError("Nowe hasło musi mieć przynajmniej 8 znaków.");
      return false;
    }
    if (passwordData.newPassword !== passwordData.reOldPassword) {
      setError("Nowe hasła nie są identyczne.");
      return false;
    }
    return true;
  };

  const handlePasswordChange = async () => {
    if (!executeRecaptcha) {
      setError("reCAPTCHA nie jest jeszcze gotowa. Spróbuj za chwilę.");
      return;
    }

    setError(null);
    if (isPending || !validate()) return;

    try {
      const token = await executeRecaptcha("change_password");
      await updatePassword({ ...passwordData, recaptchaToken: token });
      onClose(); // Close modal on success
    } catch (error: any) {
      setError(error?.message ?? "Wystąpił błąd podczas zmiany hasła.");
    }
  };

  const footerContent = (
    <div className="flex gap-3 justify-end w-full">
      <Button
        onClick={onClose}
        text="Anuluj"
        size="sm"
        variant="icon-fuchsia-ghost"
        disabled={isPending}
      />
      <Button
        onClick={handlePasswordChange}
        text={isPending ? "Zapisywanie..." : "Zapisz zmiany"}
        size="sm"
        variant="gradient-fuchsia"
        disabled={isPending}
      />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Zmiana hasła"
      footer={footerContent}
    >
      <div className="flex flex-col gap-4 pt-2">
        <TextInput
          type="password"
          label="Aktualne hasło"
          value={passwordData.oldPassword}
          onChange={(e) => updateForm("oldPassword", e.target.value)}
          placeholder="Wpisz swoje aktualne hasło"
        />
        <TextInput
          type="password"
          label="Nowe hasło"
          value={passwordData.newPassword}
          onChange={(e) => updateForm("newPassword", e.target.value)}
          placeholder="Minimum 8 znaków"
        />
        <TextInput
          type="password"
          label="Powtórz nowe hasło"
          value={passwordData.reOldPassword}
          onChange={(e) => updateForm("reOldPassword", e.target.value)}
          placeholder="Potwierdź nowe hasło"
        />
        {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
      </div>
    </Modal>
  );
}
