"use client";

import { useState } from "react";
import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import Modal from "@/features/shared/components/layout/Modal";
import type { UserProfile } from "@/features/users/types/user.type";
import useUpdateProfile from "../hooks/useUpdateProfile";
import { useImagePicker } from "@/features/shared/hooks/useImagePicker";
import { Avatar } from "@/features/posts/components/Avatar";
import cameraIcon from "@/features/shared/assets/icons/camera.svg?url";
import Image from "next/image";
import toast from "react-hot-toast";
import AlertModal from "@/features/shared/components/layout/AlertModal";
import { ApiError } from "@/lib/AppError";

interface EditProfileModalProps {
  user: UserProfile | null;
  onClose: () => void;
}

export default function EditProfileModal({
  user,
  onClose,
}: EditProfileModalProps) {
  if (!user) {
    toast.error("Nie można edytować profilu: brak danych użytkownika.");
    return null;
  }
  const [name, setName] = useState(user.name);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const { imagePreview, fileInputRef, handleFileChange, triggerPicker } =
    useImagePicker({
      initialPreview: user?.avatarUrl,
    });

  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const { updateProfile, isPending } = useUpdateProfile();

  if (!user) return null;

  const onFileChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e);
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    try {
      await updateProfile({
        name: trimmedName,
        avatarFile: selectedFile,
      });
      onClose();
    } catch (error) {
      const isPolicyViolation =
        error instanceof ApiError && error.code === "POLICY_VIOLATION";
      const message = isPolicyViolation
        ? "Nie udało się zapisać profilu. Nazwa lub zdjęcie narusza zasady."
        : "Nie udało się zapisać profilu. Spróbuj ponownie.";
      setAlertMessage(message);
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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative group cursor-pointer"
            onClick={triggerPicker}
          >
            <div className="w-24 h-24 rounded-xl overflow-hidden border border-primary-neutral-stroke-default group-hover:border-fuchsia-500 transition-colors">
              <Avatar
                src={imagePreview || undefined}
                alt={user.name}
                width={96}
                height={96}
                className="w-full h-full border-none"
              />
            </div>

            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Image
                src={cameraIcon}
                alt="Zmień"
                width={24}
                height={24}
                className="opacity-80"
              />
            </div>
          </div>
          <p className="text-xs text-text-neutral">
            Kliknij, aby zmienić zdjęcie
          </p>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={onFileChangeWrapper}
          />
        </div>

        <div className="p-4 rounded-lg border border-primary-neutral-background-default/30">
          <h3 className="text-lg font-medium mb-3 text-text-main">Nazwa</h3>

          <div className="flex flex-col gap-3">
            <TextInput
              label="Nazwa użytkownika"
              value={name}
              placeholder="Twoja publiczna nazwa"
              onChange={(e) => setName(e.target.value)}
              showButton={false}
            />
            <p className="text-sm text-text-neutral">
              Ta nazwa będzie widoczna publicznie — możesz użyć nicku lub
              imienia.
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                onClick={handleSave}
                text="Zapisz"
                size="sm"
                variant="gradient-fuchsia"
                disabled={!name.trim() && !selectedFile}
                isLoading={isPending}
              />
            </div>
          </div>
        </div>
      </div>
      <AlertModal
        isOpen={!!alertMessage}
        onClose={() => setAlertMessage(null)}
        title="Profil nie został zapisany"
        message={alertMessage || ""}
      />
    </Modal>
  );
}
