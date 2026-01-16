"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import type {
  User,
  UserRole,
  UserDataUpdate,
} from "@/features/users/types/user.type";
import useAdminUpdateUserAccount from "../hooks/user/useAdminUpdateUserAccount";
import useAdminUpdateUserPassword from "../hooks/user/useAdminUpdateUserPassword";
import useBlockUser from "../hooks/user/useBlockUser";
import useUnblockUser from "../hooks/user/useUnblockUser";
import defaultAvatarUrl from "@/features/shared/assets/defaultAvatar.svg?url";
import useAdminDeleteUser from "../hooks/user/useAdminDeleteUser";
import { formatDate } from "@/features/shared/utils/dateUtils";

export default function AdminUserEditModal({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  const [newUserData, setNewUserData] = useState<Partial<UserDataUpdate>>({
    name: "",
    role: undefined,
  });

  const [newPassword, setNewPassword] = useState<string>("");
  const { adminUpdateUserAccount, isPending: isUpdatingData } =
    useAdminUpdateUserAccount();
  const { adminUpdateUserPassword, isPending: isUpdatingPassword } =
    useAdminUpdateUserPassword();

  const { blockUser, isPending: isBlockingUser } = useBlockUser();
  const { unBlockUser, isPending: isUnblockingUser } = useUnblockUser();
  const { adminDeleteUser, isPending: isDeletingUser } = useAdminDeleteUser();

  useEffect(() => {
    if (user) {
      setNewUserData({
        name: user.name,
        role: user.role as UserRole,
      });
      setNewPassword("");
    }
  }, [user]);

  const handleFieldChange = (
    field: keyof UserDataUpdate,
    value: string | UserRole
  ) => {
    setNewUserData((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  if (!user) return null;

  const displayRole = newUserData.role || user.role || "user";
  const displayName = newUserData.name || user.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-3xl rounded-2xl p-6 shadow-2xl border border-primary-neutral-stroke-default
                    glass-card backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-Albert_Sans font-semibold text-text-main">
            Edycja użytkownika
          </h2>
          <button
            onClick={onClose}
            className="text-text-neutral hover:text-text-main transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-8 p-5 rounded-xl border border-primary-neutral-stroke-default bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <Image
                src={user.avatarUrl || defaultAvatarUrl}
                alt={user.name}
                width={80}
                height={80}
                className="rounded-2xl border border-white/10 shadow-lg object-cover w-20 h-20 sm:w-24 sm:h-24"
              />
              <div
                className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-black/20 ${
                  user.isBanned
                    ? "bg-red-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                {user.isBanned ? "Zbanowany" : "Aktywny"}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-text-main font-Albert_Sans truncate">
                  {displayName}
                </h3>
                <span className="px-2 py-1 rounded text-xs font-medium bg-primary-neutral-stroke-default text-text-neutral mb-1.5">
                  {displayRole}
                </span>
              </div>

              <p className="text-text-neutral text-sm mb-3 font-mono">
                {user.email}
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-text-neutral/70 border-t border-white/5 pt-3">
                <div className="flex flex-col">
                  <span className="uppercase text-[10px] font-semibold tracking-wider opacity-50">
                    ID Użytkownika
                  </span>
                  <span className="font-mono text-text-neutral select-all">
                    {user.uid}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="uppercase text-[10px] font-semibold tracking-wider opacity-50">
                    Dołączył
                  </span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 p-5 rounded-xl border border-primary-neutral-background-default/30 h-full flex flex-col">
              <h3 className="text-lg font-medium mb-4 text-text-main flex items-center gap-2">
                Dane profilowe
              </h3>

              <div className="flex flex-col gap-4 flex-1">
                <TextInput
                  label="Nazwa wyświetlana"
                  value={newUserData.name ?? ""}
                  placeholder={user.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  showButton={false}
                />

                <div>
                  <label className="block text-sm text-text-neutral mb-2 font-semibold">
                    Rola w systemie
                  </label>
                  <select
                    className="w-full p-3 rounded-lg bg-black/20 border border-primary-neutral-stroke-default text-text-main focus:outline-none focus:border-fuchsia-600 transition-colors appearance-none"
                    value={newUserData.role ?? ""}
                    onChange={(e) =>
                      handleFieldChange("role", e.target.value as UserRole)
                    }
                  >
                    <option value="" disabled>
                      — Wybierz rolę —
                    </option>
                    <option value="user">Użytkownik</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() =>
                    adminUpdateUserAccount({ uid: user.uid, data: newUserData })
                  }
                  text="Zapisz zmiany"
                  size="sm"
                  variant="gradient-fuchsia"
                  disabled={isUpdatingData}
                  isLoading={isUpdatingData}
                  className="w-full md:w-auto"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white/5 p-5 rounded-xl border border-primary-neutral-background-default/30 h-full flex flex-col">
              <h3 className="text-lg font-medium mb-4 text-text-main flex items-center gap-2">
                Bezpieczeństwo
              </h3>

              <div className="flex flex-col gap-4 flex-1">
                <TextInput
                  label="Ustaw nowe hasło"
                  value={newPassword}
                  placeholder="Min. 8 znaków"
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  showButton={true}
                />
                <p className="text-xs text-text-neutral/60">
                  Pozostaw puste, jeśli nie chcesz zmieniać hasła użytkownika.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() =>
                    adminUpdateUserPassword({
                      uid: user.uid,
                      newPassword: newPassword,
                    })
                  }
                  text="Zmień hasło"
                  size="sm"
                  variant="gradient-fuchsia"
                  disabled={isUpdatingPassword || !newPassword}
                  isLoading={isUpdatingPassword}
                  className="w-full md:w-auto"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <Button
            onClick={onClose}
            text="Anuluj i zamknij"
            disabled={isUpdatingData || isUpdatingPassword}
            className="text-text-neutral hover:text-white order-2 md:order-1"
          />

          <div className="flex gap-3 w-full md:w-auto order-1 md:order-2">
            {user.isBanned ? (
              <Button
                onClick={() => unBlockUser({ uid: user.uid })}
                text="Odblokuj konto"
                size="sm"
                variant="glass-card"
                className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                disabled={isUnblockingUser}
                isLoading={isUnblockingUser}
              />
            ) : (
              <Button
                onClick={() => blockUser({ uid: user.uid })}
                text="Zablokuj konto"
                size="md"
                variant="glass-card"
                className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                disabled={isBlockingUser}
                isLoading={isBlockingUser}
              />
            )}

            <Button
              onClick={() => adminDeleteUser(user.uid)}
              text="Usuń użytkownika"
              size="md"
              variant="glass-card"
              className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              disabled={isUpdatingData}
              isLoading={isDeletingUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
