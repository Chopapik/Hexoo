"use client";

import React, { useState } from "react";
import { PaperclipIcon } from "../icons/PaperclipIcon";
import { SendIcon } from "../icons/SendIcon";
import { useAppSelector } from "@/lib/store/hooks";
import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";
import AlertModal from "@/features/shared/components/layout/AlertModal";
import RemoveImageButton from "@/features/shared/components/ui/RemoveImageButton";
import useCreatePostForm from "../hooks/useCreatePostForm";
import useCreatePost from "../hooks/useCreatePost";
import { CreatePostDto } from "../types/post.dto";
import { parseErrorMessages } from "../utils/postFormValidation";
import { POST_MAX_CHARS } from "../types/post.type";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const {
    register,
    handleSubmit,
    fileInputRef,
    imagePreview,
    removeImage,
    handleFileChange,
    checkFormat,
    formState,
    watch,
    triggerPicker,
  } = useCreatePostForm();

  const [rootError, setRootError] = useState<string | null>(null);
  const [moderationBlockReason, setModerationBlockReason] = useState<
    string | null
  >(null);

  const validationErrorRaw =
    formState.errors.text?.message || formState.errors.imageFile?.message || "";

  const clientError = parseErrorMessages(validationErrorRaw)?.text;

  const textValue = watch("text") || "";
  const currentLength = textValue.length;
  const isOverLimit = currentLength > POST_MAX_CHARS;

  const { createPost, isPending } = useCreatePost(
    () => {
      removeImage();
      onClose();
    },
    (error) => {
      const parsedError = parseErrorMessages(error);

      if (parsedError?.text) {
        setRootError(parsedError.text);
      } else {
        const message =
          error?.response?.data?.message ||
          "Twój post nie mógł zostać opublikowany z powodów bezpieczeństwa.";

        setModerationBlockReason(message);
      }
    },
  );

  const submit = handleSubmit((data: CreatePostDto) => {
    if (isOverLimit) return;

    setRootError(null);
    setModerationBlockReason(null);

    const formatted = checkFormat(data);
    createPost(formatted);
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const user = useAppSelector((state) => state.auth.user);

  const displayError = clientError || rootError;

  const footerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          onClick={triggerPicker}
          icon={<PaperclipIcon className="w-5 h-5" />}
          variant="transparent"
          size="icon"
          className="text-text-neutral hover:text-white"
          type="button"
        />
      </div>

      <span className="text-red-500 text-sm font-medium">{displayError}</span>

      <Button
        onClick={submit}
        disabled={isOverLimit || !!clientError}
        isLoading={isPending}
        icon={<SendIcon className="w-5 h-5" />}
        variant="icon-fuchsia-solid"
        size="icon"
        type="submit"
      />
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        title="Nowy post"
        onClose={onClose}
        footer={footerContent}
      >
        <div className="flex flex-col gap-4">
          {imagePreview && (
            <div className="relative w-fit group animate-in fade-in zoom-in-95 duration-200">
              <img
                src={imagePreview}
                alt="Preview"
                width={200}
                height={200}
                className="rounded-xl border border-primary-neutral-stroke-default object-cover max-h-64 w-auto"
              />
              <RemoveImageButton
                onClick={removeImage}
                variant="dark"
                position="top-right"
                showOnHover={true}
              />
            </div>
          )}

          <div className="relative w-full">
            <textarea
              {...register("text")}
              onKeyDown={handleKeyDown}
              placeholder={
                user ? `Co u Ciebie słychać, ${user.name}?` : "Napisz coś..."
              }
              className="w-full bg-transparent text-text-main placeholder:text-text-neutral/50 text-base resize-none outline-none min-h-[100px] scrollbar-hide leading-relaxed pb-6"
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
      <AlertModal
        isOpen={!!moderationBlockReason}
        onClose={() => setModerationBlockReason(null)}
        title="Post odrzucony"
        message={moderationBlockReason || ""}
      />
    </>
  );
}
