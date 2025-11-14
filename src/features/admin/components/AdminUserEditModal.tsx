"use client";

import { useState, useEffect } from "react";
import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import type {
  User,
  UserRole,
  UserDataUpdate,
} from "@/features/users/types/user.type";
import useUpdateUserData from "../hooks/useUpdateUserData";
import useUpdateUserPassword from "../hooks/useUpdateUserPassword";
import useBlockUser from "../hooks/useBlockUser";
import useUnblockUser from "../hooks/useUnblockUser";

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
  const { updateUserData, isPending: isUpdatingData } = useUpdateUserData();
  const { updateUserPassword, isPending: isUpdatingPassword } =
    useUpdateUserPassword();

  const { blockUser, isPending: isBlockingUser } = useBlockUser();
  const { unBlockUser, isPending: isUnblockingUser } = useUnblockUser();

  useEffect(() => {
    console.log(user);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-[640px] rounded-2xl p-6 shadow-lg border border-primary-neutral-stroke-default
                    glass-card backdrop-blur-md"
      >
        <h2 className="text-2xl font-Albert_Sans font-semibold mb-4 text-text-main">
          Edytuj użytkownika {user.name}
        </h2>

        <div className="flex flex-col gap-5">
          <div className="col-span-2 md:col-span-1 bg-white/5 p-4 rounded-lg border border-primary-neutral-background-default/30">
            <h3 className="text-lg font-medium mb-3 text-text-main">Dane</h3>

            <div className="flex flex-col gap-3">
              <TextInput
                label="Nazwa"
                value={newUserData.name ?? ""}
                placeholder={user.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                showButton={false}
              />

              <label className="text-sm text-text-neutral">Rola</label>
              <select
                className="p-3 rounded-md bg-white w-full"
                value={newUserData.role ?? ""}
                onChange={(e) =>
                  handleFieldChange("role", e.target.value as UserRole)
                }
              >
                <option value="">— Aktualna: {user.role ?? "Brak"} —</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">Użytkownik</option>
              </select>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  onClick={() =>
                    updateUserData({ uid: user.uid, data: newUserData })
                  }
                  text={isUpdatingData ? "Zapisywanie..." : "Zapisz"}
                  size="sm"
                  variant="gradient-fuchsia"
                  disabled={isUpdatingData}
                />
              </div>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white/5 p-4 rounded-lg border border-primary-neutral-background-default/30">
            <h3 className="text-lg font-medium mb-3 text-text-main">
              Zmień hasło
            </h3>

            <div className="flex flex-col gap-3">
              <TextInput
                label="Nowe hasło"
                value={newPassword}
                placeholder="Wpisz nowe hasło"
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                showButton={true}
              />

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  onClick={() =>
                    updateUserPassword({
                      uid: user.uid,
                      newPassword: newPassword,
                    })
                  }
                  text={
                    isUpdatingPassword ? "Przetwarzanie..." : "Zapisz hasło"
                  }
                  size="sm"
                  variant="gradient-fuchsia"
                  disabled={isUpdatingPassword}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full gap-2">
            <Button
              onClick={onClose}
              text="Usuń"
              size="sm"
              variant="icon-fuchsia-ghost"
              className="bg-red-700 flex-1"
              disabled={isUpdatingData || isUpdatingPassword}
            />

            {user.isBanned ? (
              <>
                <Button
                  onClick={() => unBlockUser({ uid: user.uid })}
                  text={isUnblockingUser ? "Przetwarzanie..." : "Odblokuj"}
                  size="sm"
                  variant="icon-fuchsia-ghost"
                  className="bg-neutral-600 flex-1"
                  disabled={isUnblockingUser}
                />
              </>
            ) : (
              <>
                <Button
                  onClick={() => blockUser({ uid: user.uid })}
                  size="sm"
                  text={isBlockingUser ? "Przetwarzanie..." : "Zablokuj"}
                  variant="icon-fuchsia-ghost"
                  className="bg-red-700 flex-1"
                  disabled={isBlockingUser}
                />
              </>
            )}
          </div>

          <Button
            onClick={onClose}
            text="Anuluj"
            size="sm"
            variant="icon-fuchsia-ghost"
            disabled={isUpdatingData || isUpdatingPassword}
          />
        </div>
      </div>
    </div>
  );
}
