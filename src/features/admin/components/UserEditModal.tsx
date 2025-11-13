import { useState, useEffect } from "react";
import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import type {
  User,
  UserRole,
  UserDataUpdate,
} from "@/features/users/types/user.type";
import useUpdateUser from "../hooks/useUpdateUser";

export default function UserEditModal({
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

  const { updateUser, isPending } = useUpdateUser();

  useEffect(() => {
    if (user) {
      setNewUserData({
        name: user.name,
        role: user.role as UserRole,
      });
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
        className="relative w-[640px] rounded-2xl p-8 shadow-lg border border-primary-neutral-stroke-default
                      glass-card backdrop-blur-md glass-card"
      >
        <h2 className="text-2xl font-Albert_Sans font-semibold mb-4 text-text-main">
          Edytuj użytkownika {user.name}
        </h2>

        <div className="flex flex-col gap-3">
          <TextInput
            label="Nazwa"
            value={newUserData.name || ""}
            placeholder={user.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            showButton={false}
          />

          <label className="text-sm text-text-neutral">Rola</label>
          <select
            className="p-3 rounded-md bg-primary-neutral-background-default/40 text-text-main w-full"
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
              onClick={onClose}
              text="Anuluj"
              size="sm"
              variant="icon-fuchsia-ghost"
              disabled={isPending}
            />
            {/* <Button
              onClick={handleDelete}
              text={isPending ? "Usuwanie..." : "Usuń"}
              size="sm"
              variant="icon-fuchsia-solid"
              disabled={isPending}
            /> */}
            <Button
              onClick={() => updateUser({ uid: user.uid, data: newUserData })}
              text={isPending ? "Zapisywanie..." : "Zapisz"}
              size="sm"
              variant="gradient-fuchsia"
              disabled={isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
