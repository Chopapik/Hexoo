"use client";

import React, { useState } from "react";
import { PaperclipIcon } from "../icons/PaperclipIcon";
import { SendIcon } from "../icons/SendIcon";
import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";
import AlertModal from "@/features/shared/components/layout/AlertModal";
import RemoveImageButton from "@/features/shared/components/ui/RemoveImageButton";
import useEditPostForm from "../hooks/useEditPostForm";
import useEditPost from "../hooks/useEditPost";
import { PublicPostResponseDto, UpdatePostRequestDto } from "../types/post.dto";
import { parseErrorMessages } from "../utils/postErrorMap";
import { POST_MAX_CHARS } from "../types/post.dto";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PublicPostResponseDto;
}

export default function EditPostModal({
  isOpen,
  onClose,
  post,
}: EditPostModalProps) {
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
    resetForm,
  } = useEditPostForm(post);

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

  const { editPost, isPending } = useEditPost(
    post.id,
    () => {
      resetForm();
      setRootError(null);
      setModerationBlockReason(null);
      onClose();
    },
    (error) => {
      const parsedError = parseErrorMessages(error);

      if (parsedError?.text) {
        setRootError(parsedError.text);
      } else {
        const message =
          error?.response?.data?.message ||
          "Twój post nie mógł zostać zaktualizowany z powodów bezpieczeństwa.";

        setModerationBlockReason(message);
      }
    },
  );

  const submit = handleSubmit((data: UpdatePostRequestDto) => {
    if (isOverLimit) return;

    setRootError(null);
    setModerationBlockReason(null);

    const formatted = checkFormat(data);
    editPost(formatted);
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const displayError = clientError || rootError;

  const currentImageUrl = imagePreview || post.imageUrl;

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
        title="Edytuj post"
        onClose={onClose}
        footer={footerContent}
        className="w-full h-full lg:h-fit lg:w-full lg:max-w-3xl"
      >
        <div className="flex flex-col gap-4 p-4 w-full">
          {currentImageUrl && (
            <div className="relative w-fit group animate-in fade-in zoom-in-95 duration-200">
              <img
                src={currentImageUrl}
                alt="Preview"
                width={200}
                height={200}
                className="rounded-xl border border-primary-neutral-stroke-default object-cover max-h-64 w-auto"
              />
              {imagePreview && (
                <RemoveImageButton
                  onClick={removeImage}
                  variant="dark"
                  position="top-right"
                  showOnHover={true}
                />
              )}
            </div>
          )}

          <div className="relative w-full">
            <textarea
              {...register("text")}
              onKeyDown={handleKeyDown}
              placeholder="Edytuj treść posta..."
              className={`w-full bg-transparent text-text-main placeholder:text-text-neutral/50 text-base resize-none outline-none leading-relaxed pb-6 transition-all duration-300 ${
                currentImageUrl && !textValue.trim()
                  ? "min-h-[150px]"
                  : "min-h-[425px]"
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

      <AlertModal
        isOpen={!!moderationBlockReason}
        onClose={() => setModerationBlockReason(null)}
        title="Edycja odrzucona"
        message={moderationBlockReason || ""}
      />
    </>
  );
}
