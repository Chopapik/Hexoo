"use client";
import Button from "@/features/shared/components/ui/Button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useDeleteAccount } from "@/features/me/hooks/useDeleteAccount";
export default function UserSettingsPage() {
  const { logout } = useLogout();
  const { deleteAccount } = useDeleteAccount();

  return (
    <>
      <span className="text-white">USTAWIENIA</span>
      <Button
        variant={"icon-fuchsia-solid"}
        text={"wyloguj"}
        onClick={() => logout()}
      />
      <Button
        variant="glass-card"
        text={"usun konto"}
        onClick={() => deleteAccount()}
      />
    </>
  );
}
