"use client";

import { useState } from "react";
import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import Modal from "@/features/shared/components/layout/Modal";
import type { UserProfile } from "@/features/users/types/user.type";
import useUpdateProfile from "../hooks/useUpdateProfile";
import { useUpdateProfileForm } from "../hooks/useUpdateProfileForm";
import { Avatar } from "@/features/posts/components/Avatar";
import cameraIcon from "@/features/shared/assets/icons/camera.svg?url";
import Image from "next/image";
import warningIcoUrl from "@/features/shared/assets/icons/warning.svg?url";
import { parseUpdateProfileErrorMessages } from "../utils/updateProfileFormValidation";
import type { UpdateProfileData } from "../me.type";

interface EditProfileModalProps {
  user: UserProfile | null;
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
    handleFileChange,
    triggerPicker,
    handleRemoveImage,
    watch,
  } = useUpdateProfileForm(user);

  const nameValue = watch("name") || "";
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
    errors.avatarFile?.message
  );
  const rootError = parseUpdateProfileErrorMessages(errors.root?.message);

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
        variant="gradient-fuchsia"
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
          className="flex flex-col gap-6"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div
                className="relative group cursor-pointer animate-in fade-in zoom-in-95 duration-200"
                onClick={triggerPicker}
              >
                <div className="w-24 h-24 rounded-xl p-px bg-[radial-gradient(circle_at_center,#262626_0%,#171717_100%)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-105">
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

              {/* Remove image button - only show if new image was selected */}
              {isNewImage && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition-all opacity-100 hover:scale-110 z-10"
                  type="button"
                  title="Usuń zdjęcie"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}

              {/* Change indicator */}
              {isNewImage && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary-fuchsia-stroke-default text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-200">
                  Zmieniono
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-text-neutral font-medium">
                Kliknij, aby zmienić zdjęcie profilowe
              </p>
              <p className="text-xs text-text-neutral/60">
                PNG, JPG lub WEBP (max 5MB)
              </p>
            </div>

            {avatarFileError.length > 0 && (
              <div className="px-1 pt-1 inline-flex justify-start items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200 w-full">
                <div className="flex justify-start items-start overflow-hidden pt-0.5">
                  <div data-svg-wrapper className="text-red-500">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 1.30929L11.6907 0L6.5 5.19071L1.30929 0L0 1.30929L5.19071 6.5L0 11.6907L1.30929 13L6.5 7.80929L11.6907 13L13 11.6907L7.80929 6.5L13 1.30929Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
                <div className="justify-start text-red-500 text-sm font-normal font-Roboto">
                  {avatarFileError[0].text}
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
            />
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
              <p className="text-xs text-text-neutral/60 ml-1">
                {nameValue.trim().length} / 30 znaków
              </p>
            </div>
          </div>

          {/* Root error */}
          {rootError.length > 0 && (
            <div className="px-1 pt-1 inline-flex justify-start items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200 w-full">
              <div className="flex justify-start items-start overflow-hidden pt-0.5">
                {rootError[0].type === "Warning" ? (
                  <div className="relative w-3.5 h-3.5">
                    <Image
                      src={warningIcoUrl}
                      alt="warning"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div data-svg-wrapper className="text-red-500">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 1.30929L11.6907 0L6.5 5.19071L1.30929 0L0 1.30929L5.19071 6.5L0 11.6907L1.30929 13L6.5 7.80929L11.6907 13L13 11.6907L7.80929 6.5L13 1.30929Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div
                className={`justify-start text-sm font-normal font-Roboto ${
                  rootError[0].type === "Warning"
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {rootError[0].text}
              </div>
            </div>
          )}
        </form>
      </Modal>
    </>
  );
}
