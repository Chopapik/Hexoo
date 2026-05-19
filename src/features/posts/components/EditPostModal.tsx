"use client";

import React, { useState } from "react";
import AlertModal from "@/features/shared/components/layout/AlertModal";
import useEditPostForm from "../hooks/useEditPostForm";
import useEditPost from "../hooks/useEditPost";
import { PublicPostResponseDto, UpdatePostRequestDto } from "../types/post.dto";
import { parseErrorMessages } from "../utils/postErrorMap";
import { POST_MAX_CHARS } from "../types/post.dto";
import { ApiError } from "@/lib/AppError";
import PostComposerModal from "./PostComposerModal";
import { useI18n } from "@/i18n/useI18n";

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
  const { lang, t } = useI18n();
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

  const clientError = parseErrorMessages(validationErrorRaw, lang)?.text;

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
      const code = error instanceof ApiError ? error.code : "INTERNAL_ERROR";
      const parsedError = parseErrorMessages(code, lang);

      if (parsedError?.text) {
        setRootError(parsedError.text);
      } else {
        setRootError(t("post.unknownErrorRetry"));
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

  return (
    <PostComposerModal
      isOpen={isOpen}
      title={t("post.edit")}
      placeholder={t("post.editPlaceholder")}
      onClose={onClose}
      onSubmit={submit}
      onImageSelect={triggerPicker}
      onImageRemove={removeImage}
      onFileChange={handleFileChange}
      onTextKeyDown={handleKeyDown}
      textRegistration={register("text")}
      textValue={textValue}
      imagePreview={currentImageUrl}
      fileInputRef={fileInputRef}
      displayError={displayError}
      isPending={isPending}
      isOverLimit={isOverLimit}
      isSubmitDisabled={isOverLimit || !!clientError}
      showRemoveImageButton={!!imagePreview}
      alert={
        <AlertModal
          isOpen={!!moderationBlockReason}
          onClose={() => setModerationBlockReason(null)}
          title={t("post.editRejected")}
          message={moderationBlockReason || ""}
        />
      }
    />
  );
}
