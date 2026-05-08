"use client";

import React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { PaperclipIcon } from "../icons/PaperclipIcon";
import { SendIcon } from "../icons/SendIcon";
import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";
import RemoveImageButton from "@/features/shared/components/ui/RemoveImageButton";
import { POST_MAX_CHARS } from "../types/post.dto";

interface PostComposerModalProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  onClose: () => void;
  onSubmit: () => void;
  onImageSelect: () => void;
  onImageRemove: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textRegistration: UseFormRegisterReturn<"text">;
  textValue: string;
  imagePreview: string | null | undefined;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  displayError?: string | null;
  isPending: boolean;
  isOverLimit: boolean;
  isSubmitDisabled?: boolean;
  showRemoveImageButton?: boolean;
  acceptedImageTypes?: string;
  alert?: React.ReactNode;
}

export default function PostComposerModal({
  isOpen,
  title,
  placeholder,
  onClose,
  onSubmit,
  onImageSelect,
  onImageRemove,
  onFileChange,
  onTextKeyDown,
  textRegistration,
  textValue,
  imagePreview,
  fileInputRef,
  displayError,
  isPending,
  isOverLimit,
  isSubmitDisabled = isOverLimit,
  showRemoveImageButton = !!imagePreview,
  acceptedImageTypes = "image/png, image/jpeg, image/webp",
  alert,
}: PostComposerModalProps) {
  const hasText = textValue.trim().length > 0;
  const currentLength = textValue.length;

  const footerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          accept={acceptedImageTypes}
          onChange={onFileChange}
          className="hidden"
        />

        <Button
          onClick={onImageSelect}
          icon={<PaperclipIcon className="w-5 h-5" />}
          variant="transparent"
          size="icon"
          className="text-text-neutral hover:text-white"
          type="button"
        />
      </div>

      <span className="text-red-500 text-sm font-medium">{displayError}</span>

      <Button
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        isLoading={isPending}
        icon={<SendIcon className="w-5 h-5" />}
        variant="default"
        size="icon"
        type="submit"
      />
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        title={title}
        onClose={onClose}
        footer={footerContent}
        className="w-full h-[calc(100dvh-2rem)] lg:h-auto lg:max-h-[calc(100dvh-2rem)] lg:w-full lg:max-w-3xl"
      >
        <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-4">
          {imagePreview && (
            <div
              className={`relative w-fit group animate-in fade-in zoom-in-95 duration-200 transition-all ${
                hasText ? "max-w-[120px]" : "max-w-[220px]"
              }`}
            >
              <img
                src={imagePreview}
                alt="Preview"
                width={200}
                height={200}
                className={`rounded-xl border border-primary-neutral-stroke-default object-cover w-auto transition-all duration-300 ${
                  hasText ? "max-h-24" : "max-h-[min(32dvh,16rem)]"
                }`}
              />
              {showRemoveImageButton && (
                <RemoveImageButton
                  onClick={onImageRemove}
                  variant="dark"
                  position="top-right"
                  showOnHover={true}
                />
              )}
            </div>
          )}

          <div className="relative w-full">
            <textarea
              {...textRegistration}
              onKeyDown={onTextKeyDown}
              placeholder={placeholder}
              className={`w-full bg-transparent text-text-main placeholder:text-text-neutral/50 text-base resize-none outline-none leading-relaxed pb-6 transition-all duration-300 ${
                imagePreview ? "min-h-[140px]" : "min-h-[min(425px,55dvh)]"
              }`}
              autoFocus
            />

            <div
              className={`
                absolute bottom-0 right-0 text-xs font-medium transition-colors duration-200 pointer-events-none select-none
                ${
                  isOverLimit
                    ? "text-red-500"
                    : "text-text-neutral/40 group-focus-within:text-text-neutral/70"
                }
              `}
            >
              {currentLength} / {POST_MAX_CHARS}
            </div>
          </div>
        </div>
      </Modal>

      {alert}
    </>
  );
}
