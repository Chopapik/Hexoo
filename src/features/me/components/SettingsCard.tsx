"use client";

import { useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import TextInput from "@/features/shared/components/ui/TextInput";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useDeleteAccount } from "@/features/me/hooks/useDeleteAccount";
import { useUpdatePassword } from "../hooks/useUpdatePassword";
import type { PasswordUpdate } from "../me.type";

export default function SettingsPage() {
  const { logout } = useLogout();
  const { deleteAccount } = useDeleteAccount();
  const { updatePassword, isPending } = useUpdatePassword();

  const [passwordData, setPasswordData] = useState<PasswordUpdate>({
    oldPassword: "",
    newPassword: "",
    reOldPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateForm = (field: keyof PasswordUpdate, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
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
      setError("Nowe hasło i potwierdzenie nie są takie same.");
      return false;
    }
    return true;
  };

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(null);

    if (isPending) return;
    if (!validate()) return;

    try {
      await updatePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        reOldPassword: passwordData.reOldPassword,
      });
      setSuccess("Hasło zmienione pomyślnie.");
      setPasswordData({ oldPassword: "", newPassword: "", reOldPassword: "" });
    } catch (error: any) {
      setError(error?.message ?? "Wystąpił błąd podczas zmiany hasła.");
    }
  };

  return (
    <div className="max-w-[400px] w-full mx-auto mt-10 p-6 text-text-main flex flex-col gap-6">
      <h2 className="text-2xl font-semibold font-Albert_Sans text-text-main text-center mb-2">
        Ustawienia konta
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-xl border border-primary-neutral-background-default/30">
          <span className="text-sm text-text-neutral">Zmiana hasła</span>

          <TextInput
            type="password"
            value={passwordData.oldPassword}
            onChange={(e) => updateForm("oldPassword", e.target.value)}
            placeholder="Aktualne hasło"
          />

          <TextInput
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => updateForm("newPassword", e.target.value)}
            placeholder="Nowe hasło"
          />

          <TextInput
            type="password"
            value={passwordData.reOldPassword}
            onChange={(e) => updateForm("reOldPassword", e.target.value)}
            placeholder="Powtórz nowe hasło"
          />

          {error && <div className="text-sm text-red-400 mt-1">{error}</div>}
          {success && (
            <div className="text-sm text-green-400 mt-1">{success}</div>
          )}

          <Button
            text={isPending ? "Zapisywanie..." : "Zmień hasło"}
            variant="gradient-fuchsia"
            onClick={handlePasswordChange}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-xl border border-primary-neutral-background-default/30">
          <span className="text-sm text-text-neutral">Zarządzanie kontem</span>
          <Button
            variant="icon-fuchsia-solid"
            text="Wyloguj się"
            onClick={() => logout()}
          />
          <Button
            variant="glass-card"
            text="Usuń konto"
            onClick={() => deleteAccount()}
          />
        </div>
      </div>
    </div>
  );
}
