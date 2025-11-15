"use client";

import { useState, useEffect } from "react";
import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import type {
  User,
  UserDataUpdate,
  UserProfile,
  UserProfileUpdate,
} from "@/features/users/types/user.type";
import useUpdateProfile from "../hooks/useUpdateProfile";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";
export default function EditProfileModal({
  user,
  onClose,
}: {
  user: UserProfile | null;
  onClose: () => void;
}) {
  if (!user) return null;

  const [newProfileData, setNewProfileData] = useState<UserProfileUpdate>({
    name: user.name,
    avatarUrl: user.avatarUrl,
  });

  const { updateProfile, isPending } = useUpdateProfile();

  const { handleCriticalError } = useCriticalError();

  const updateForm = (field: "name", value: string) => {
    setNewProfileData({ ...newProfileData, [field]: value });
  };

  const handleSave = async () => {
    if (
      newProfileData.name.trim() !== "" ||
      newProfileData.name !== user.name
    ) {
      try {
        await updateProfile(newProfileData);
      } catch (error) {
        handleCriticalError(error);
      }
      onClose();
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        className="relative w-[560px] rounded-2xl p-6 shadow-lg border border-primary-neutral-stroke-default
                   glass-card backdrop-blur-md"
      >
        <h2 className="text-2xl font-Albert_Sans font-semibold mb-4 text-text-main">
          Edytuj profil — {user.name}
        </h2>

        <div className="flex flex-col gap-5">
          <div className="bg-white/5 p-4 rounded-lg border border-primary-neutral-background-default/30">
            <h3 className="text-lg font-medium mb-3 text-text-main">Nazwa</h3>

            <div className="flex flex-col gap-3">
              <TextInput
                label="Nazwa użytkownika"
                value={newProfileData.name}
                placeholder="Twoja publiczna nazwa"
                onChange={(e) => updateForm("name", e.target.value)}
                showButton={false}
              />
              <p className="text-sm text-text-neutral">
                Ta nazwa będzie widoczna publicznie — możesz użyć nicku lub
                imienia.
              </p>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  onClick={handleSave}
                  text={isPending ? "Zapisywanie..." : "Zapisz"}
                  size="sm"
                  variant="gradient-fuchsia"
                  disabled={isPending || newProfileData.name.trim() === ""}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end w-full">
            <Button
              onClick={onClose}
              text="Anuluj"
              size="sm"
              variant="icon-fuchsia-ghost"
              disabled={isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
