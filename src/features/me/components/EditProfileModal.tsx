"use client";

import { useState } from "react";
import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import Modal from "@/features/shared/components/layout/Modal";
import type {
  UserProfile,
  UserProfileUpdate,
} from "@/features/users/types/user.type";
import useUpdateProfile from "../hooks/useUpdateProfile";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";

interface EditProfileModalProps {
  user: UserProfile | null;
  onClose: () => void;
}

export default function EditProfileModal({
  user,
  onClose,
}: EditProfileModalProps) {
  const [newProfileData, setNewProfileData] = useState<UserProfileUpdate>({
    name: user?.name || "",
    avatarUrl: user?.avatarUrl,
  });

  const { updateProfile, isPending } = useUpdateProfile();
  const { handleCriticalError } = useCriticalError();

  if (!user) return null;

  const updateForm = (field: keyof UserProfileUpdate, value: string) => {
    setNewProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const name = newProfileData.name?.trim();

    if (name && name !== user.name) {
      try {
        await updateProfile(newProfileData);
        onClose();
      } catch (error) {
        handleCriticalError(error);
      }
    } else {
      onClose();
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
    </div>
  );

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title={`Edytuj profil — ${user.name}`}
      footer={footerContent}
    >
      <div className="flex flex-col gap-5">
        <div className=" p-4 rounded-lg border border-primary-neutral-background-default/30">
          <h3 className="text-lg font-medium mb-3 text-text-main">Nazwa</h3>

          <div className="flex flex-col gap-3">
            <TextInput
              label="Nazwa użytkownika"
              value={newProfileData.name || ""}
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
                disabled={isPending || !newProfileData.name?.trim()}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
