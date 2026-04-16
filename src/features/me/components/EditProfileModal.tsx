"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import Modal from "@/features/shared/components/layout/Modal";
import RemoveImageButton from "@/features/shared/components/ui/RemoveImageButton";
import type { PublicUserResponseDto } from "@/features/users/types/user.dto";
import useUpdateProfile from "../hooks/useUpdateProfile";
import { useUpdateProfileForm } from "../hooks/useUpdateProfileForm";
import { Avatar } from "@/features/posts/components/Avatar";
import cameraIcon from "@/features/shared/assets/icons/camera.svg?url";
import Image from "next/image";
import { parseUpdateProfileErrorMessages } from "../utils/updateProfileErrorMap";
import type { UpdateProfileData } from "../me.type";
import ValidationMessage from "@/features/shared/components/ui/ValidationMessage";
import AvatarEditor from "react-avatar-editor";
import { canvasToFile } from "../utils/avatarEditor";

interface EditProfileModalProps {
  user: PublicUserResponseDto | null;
  onClose: () => void;
}

export default function EditProfileModal({
  user,
  onClose,
}: EditProfileModalProps) {
  if (!user) {
    return null;
  }

  const {
    register,
    handleSubmit,
    errors,
    isDirty,
    handleServerErrors,
    prepareFormData,
    imagePreview,
    fileInputRef,
    triggerPicker,
    setCroppedAvatar,
    validateAvatarFile,
    clearSelectedAvatar,
    watch,
  } = useUpdateProfileForm(user);
  const editorRef = useRef<AvatarEditor | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropImageFile, setCropImageFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1.2);

  const nameValue = watch("name") || "";
  const nameErrorCode = errors.name?.message as string | undefined;
  const nameLength = nameValue.trim().length;
  const avatarFileValue = watch("avatarFile");

  const { updateProfile, isPending } = useUpdateProfile(handleServerErrors);

  const isNewImage = imagePreview && imagePreview.startsWith("blob:");
  const hasChanges = isDirty;
  const hasNameValue = nameValue.trim().length > 0;
  const canSubmit = hasChanges && hasNameValue;

  const onSubmit = async (data: UpdateProfileData) => {
    const formData = prepareFormData(data);
    if (!formData) {
      return;
    }

    const updateData: { name?: string; avatarFile?: File } = {};
    if (formData.has("name")) {
      updateData.name = formData.get("name") as string;
    }
    if (formData.has("avatarFile")) {
      updateData.avatarFile = formData.get("avatarFile") as File;
    }

    await updateProfile(updateData);
    onClose();
  };

  const nameError = parseUpdateProfileErrorMessages(errors.name?.message);
  const avatarFileError = parseUpdateProfileErrorMessages(
    errors.avatarFile?.message,
  );
  const rootError = parseUpdateProfileErrorMessages(errors.root?.message);

  useEffect(() => {
    return () => {
      if (cropImageSrc) {
        URL.revokeObjectURL(cropImageSrc);
      }
    };
  }, [cropImageSrc]);

  const clearTemporaryCropState = () => {
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageFile(null);
    setCropImageSrc(null);
    setScale(1.2);
    setIsCropping(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAvatarInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid = validateAvatarFile(file);
    if (!isValid) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
    }

    setCropImageFile(file);
    setCropImageSrc(URL.createObjectURL(file));
    setScale(1.2);
    setIsCropping(true);
  };

  const handleApplyCrop = async () => {
    if (!editorRef.current || !cropImageFile) return;

    const canvas = editorRef.current.getImageScaledToCanvas();
    const outputType =
      cropImageFile.type === "image/jpeg" ||
      cropImageFile.type === "image/png" ||
      cropImageFile.type === "image/webp"
        ? cropImageFile.type
        : "image/png";
    const extension = outputType === "image/jpeg" ? "jpg" : outputType.split("/")[1];

    try {
      const croppedFile = await canvasToFile(canvas, {
        fileName: `avatar-cropped.${extension}`,
        type: outputType,
      });

      const previewUrl = URL.createObjectURL(croppedFile);
      setCroppedAvatar(croppedFile, previewUrl);
      clearTemporaryCropState();
    } catch {
      // Keep existing validation rendering contract and map crop failures to root.
      handleServerErrors("INTERNAL_ERROR");
    }
  };

  const handleSaveClick = () => {
    handleSubmit(onSubmit)();
  };

  const footerContent = (
    <div className="flex gap-3 justify-end w-full">
      <Button
        onClick={onClose}
        text="Anuluj"
        size="md"
        variant="secondary"
        disabled={isPending}
        type="button"
      />
      <Button
        onClick={handleSaveClick}
        text="Zapisz"
        size="md"
        variant="default"
        disabled={!canSubmit}
        isLoading={isPending}
        type="button"
      />
    </div>
  );

  return (
    <>
      <Modal
        isOpen={!!user}
        onClose={onClose}
        title={`Edytuj profil — ${user.name}`}
        footer={footerContent}
      >
        <form
          id="edit-profile-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-12"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {isCropping && cropImageSrc ? (
                <div className="w-full max-w-sm rounded-xl border border-primary-neutral-stroke-default/50 bg-secondary-neutral-background-default/30 p-4 flex flex-col gap-4">
                  <div className="mx-auto overflow-hidden rounded-xl">
                    <AvatarEditor
                      ref={editorRef}
                      image={cropImageSrc}
                      width={240}
                      height={240}
                      border={0}
                      borderRadius={16}
                      scale={scale}
                      rotate={0}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-neutral/80">
                      Powiekszenie
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.01}
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="accent-primary-fuchsia-stroke-default"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={clearTemporaryCropState}
                      text="Anuluj"
                      size="sm"
                      variant="secondary"
                      type="button"
                    />
                    <Button
                      onClick={handleApplyCrop}
                      text="Zastosuj"
                      size="sm"
                      variant="default"
                      type="button"
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="relative group cursor-pointer animate-in fade-in zoom-in-95 duration-200"
                  onClick={triggerPicker}
                >
                  <div className="w-32 h-32 rounded-xl p-px bg-[radial-gradient(circle_at_center,#262626_0%,#171717_100%)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-105">
                    <Avatar
                      src={imagePreview || undefined}
                      alt={user.name}
                      width={96}
                      height={96}
                      className="w-full h-full rounded-xl border-none"
                    />
                  </div>

                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-1">
                      <Image
                        src={cameraIcon}
                        alt="Zmień"
                        width={24}
                        height={24}
                        className="opacity-90"
                      />
                      <span className="text-white text-xs font-medium">
                        Zmień
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Remove image button - only show if new image was selected */}
              {isNewImage && !isCropping && (
                <RemoveImageButton
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelectedAvatar();
                  }}
                  variant="dark"
                  position="top-right"
                  alwaysVisible={true}
                />
              )}

              {/* Change indicator */}
              {isNewImage && !isCropping && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary-fuchsia-stroke-default text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-200">
                  Zmieniono
                </div>
              )}
            </div>

            <div className="flex flex-col items-center ">
              <p className="text-sm text-text-neutral font-medium">
                {isCropping
                  ? "Dopasuj kadr i kliknij Zastosuj"
                  : "Kliknij, aby zmienić zdjęcie profilowe"}
              </p>
            </div>
            <div className="flex flex-col gap-1 h-6">
              {avatarFileError.length > 0 && (
                <ValidationMessage message={avatarFileError[0]} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleAvatarInputChange}
              />
            </div>
          </div>

          {/* Name Section */}
          <div className="flex flex-col gap-4 p-4 rounded-xl bg-secondary-neutral-background-default/30 border border-primary-neutral-stroke-default/50">
            <TextInput
              label="Nazwa użytkownika"
              placeholder="Twoja publiczna nazwa"
              {...register("name")}
              messages={nameError}
              showButton={false}
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm text-text-neutral ml-1">
                Ta nazwa będzie widoczna publicznie — możesz użyć nicku lub
                imienia.
              </p>
              <p
                className={`text-xs ml-1 transition-colors ${
                  nameErrorCode === "name_too_short" ||
                  nameErrorCode === "name_too_long"
                    ? "text-red-500"
                    : "text-text-neutral/60"
                }`}
              >
                {nameLength} / 30 znaków
              </p>
            </div>
          </div>

          {/* Root error */}
          {rootError.length > 0 && <ValidationMessage message={rootError[0]} />}
        </form>
      </Modal>
    </>
  );
}
