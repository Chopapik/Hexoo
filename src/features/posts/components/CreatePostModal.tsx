"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store/store";
import AlertModal from "@/features/shared/components/layout/AlertModal";
import useCreatePostForm from "../hooks/useCreatePostForm";
import useCreatePost from "../hooks/useCreatePost";
import { CreatePostRequestDto } from "../types/post.dto";
import { parseErrorMessages } from "../utils/postErrorMap";
import { POST_MAX_CHARS } from "../types/post.dto";
import { ApiError } from "@/lib/AppError";
import PostComposerModal from "./PostComposerModal";
import { useI18n } from "@/i18n/useI18n";

export default function CreatePostModal() {
  const { lang, t } = useI18n();
  const isCreatePostModalOpen = useAppStore(
    (state) => state.createPostModal.isOpen,
  );
  const closeCreatePostModal = useAppStore(
    (state) => state.closeCreatePostModal,
  );
  const user = useAppStore((state) => state.auth.user);
  const isOpen = Boolean(user) && isCreatePostModalOpen;
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
    setValue,
    trigger,
    clearErrors,
  } = useCreatePostForm();

  const [rootError, setRootError] = useState<string | null>(null);
  const [moderationBlockReason, setModerationBlockReason] = useState<
    string | null
  >(null);

  const validationErrorRaw =
    formState.errors.text?.message ||
    formState.errors.imageFile?.message ||
    formState.errors.youtubeUrl?.message ||
    "";

  const clientError = parseErrorMessages(validationErrorRaw, lang)?.text;
  const youtubeUrlError = parseErrorMessages(
    formState.errors.youtubeUrl?.message as string,
    lang,
  )?.text;

  const textValue = watch("text") || "";
  const youtubeUrlValue = watch("youtubeUrl") || "";
  const currentLength = textValue.length;
  const isOverLimit = currentLength > POST_MAX_CHARS;

  const { createPost, isPending } = useCreatePost(
    () => {
      resetForm();
      setRootError(null);
      setModerationBlockReason(null);
      closeCreatePostModal();
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

  const submit = handleSubmit((data: CreatePostRequestDto) => {
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

  const handleYouTubeConfirm = async (url: string): Promise<boolean> => {
    setValue("youtubeUrl", url, { shouldValidate: true });
    const valid = await trigger("youtubeUrl");
    if (!valid) {
      setValue("youtubeUrl", "", { shouldValidate: false });
      return false;
    }
    clearErrors("youtubeUrl");
    return true;
  };

  const handleYouTubeRemove = () => {
    setValue("youtubeUrl", "", { shouldValidate: true });
    clearErrors("youtubeUrl");
  };

  const displayError = clientError || rootError;

  return (
    <PostComposerModal
      isOpen={isOpen}
      title={t("post.new")}
      placeholder={
        user
          ? t("post.placeholder", { name: user.name })
          : t("post.placeholderGuest")
      }
      onClose={closeCreatePostModal}
      onSubmit={submit}
      onImageSelect={triggerPicker}
      onImageRemove={removeImage}
      onFileChange={handleFileChange}
      onTextKeyDown={handleKeyDown}
      textRegistration={register("text")}
      textValue={textValue}
      imagePreview={imagePreview}
      fileInputRef={fileInputRef}
      displayError={displayError}
      isPending={isPending}
      isOverLimit={isOverLimit}
      isSubmitDisabled={isOverLimit || !!clientError}
      acceptedImageTypes="image/png, image/jpeg, image/webp, image/gif"
      onYouTubeConfirm={handleYouTubeConfirm}
      onYouTubeDraftChange={() => clearErrors("youtubeUrl")}
      onYouTubeRemove={handleYouTubeRemove}
      youtubeUrl={youtubeUrlValue}
      youtubeUrlError={youtubeUrlError}
      alert={
        <AlertModal
          isOpen={!!moderationBlockReason}
          onClose={() => setModerationBlockReason(null)}
          title={t("post.rejected")}
          message={moderationBlockReason || ""}
        />
      }
    />
  );
}
