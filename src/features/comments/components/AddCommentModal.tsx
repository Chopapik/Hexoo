"use client";

import Modal from "@/features/shared/components/layout/Modal";
import useAddComment from "../hooks/useAddComment";
import { AddCommentRequestDto } from "../types/comment.dto";
import Button from "@/features/shared/components/ui/Button";
import type { PublicPostResponseDto } from "@/features/posts/types/post.dto";
import useCommentForm from "../hooks/useCommentForm";
import { parseCommentErrorMessages } from "../utils/commentErrorMap";
import warningIconUrl from "@/features/shared/assets/icons/warning.svg?url";
import Image from "next/image";
import RemoveImageButton from "@/features/shared/components/ui/RemoveImageButton";
import { PaperclipIcon } from "@/features/posts/icons/PaperclipIcon";
import { useI18n } from "@/i18n/useI18n";

interface AddCommentModalProps {
  post: PublicPostResponseDto;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCommentModal({
  post,
  isOpen,
  onClose,
}: AddCommentModalProps) {
  const { lang, t } = useI18n();
  const {
    register,
    handleSubmit,
    reset,
    errors,
    handleServerErrors,
    isSubmitting,
    fileInputRef,
    imagePreview,
    removeImage,
    handleFileChange,
    checkFormat,
    triggerPicker,
  } = useCommentForm(post.id);

  const textError = parseCommentErrorMessages(
    errors.text?.message ?? errors.imageFile?.message ?? "",
    lang,
  );
  const rootError = parseCommentErrorMessages(errors.root?.message ?? "", lang);

  const { addComment, isPending } = useAddComment(
    () => {
      reset();
      onClose();
    },
    (errorCode) => handleServerErrors(errorCode),
  );

  const onSubmit = (data: AddCommentRequestDto) => {
    const formatted = checkFormat({ ...data, postId: post.id });
    addComment(formatted);
  };

  const isLoading = isPending || isSubmitting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("comment.addTitle", {
        name: post.userName || t("comment.anonymous"),
      })}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 flex flex-col gap-6 rounded-xl"
      >
        <div className="bg-surface-chrome-background-default p-3 rounded-lg text-foreground-secondary-default text-sm italic border border-surface-card-border-default">
          {t("comment.replyingTo", { text: post.text.substring(0, 100) })}
        </div>

        <div className="flex flex-col gap-2">
          {imagePreview && (
            <div className="relative w-fit group animate-in fade-in zoom-in-95 duration-200">
              <img
                src={imagePreview}
                alt={t("comment.previewAlt")}
                width={200}
                height={200}
                className="rounded-xl border border-surface-card-border-default object-cover max-h-48 w-auto"
              />
              <RemoveImageButton
                onClick={removeImage}
                variant="dark"
                position="top-right"
                showOnHover={true}
              />
            </div>
          )}

          <textarea
            {...register("text")}
            placeholder={t("comment.writePlaceholder")}
            className={`w-full p-3 bg-transparent border rounded-lg text-foreground-primary-default placeholder:text-foreground-secondary-default focus:outline-none resize-none h-32 transition-all ${
              textError
                ? "border-red-500 focus:border-red-500"
                : "border-surface-card-border-default focus:border-accent-fuchsia-border-default"
            }`}
          />
          {textError && (
            <p className="text-red-400 text-xs font-medium ml-1">
              {textError.text}
            </p>
          )}
        </div>

        {rootError && (
          <div className="w-full px-3 py-2 bg-red-600/10 border border-red-600/50 rounded-lg flex items-center gap-2">
            <Image src={warningIconUrl} alt="warning" width={16} height={16} />
            <span className="text-red-400 text-xs font-semibold">
              {rootError.text}
            </span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            onClick={triggerPicker}
            icon={<PaperclipIcon className="w-5 h-5" />}
            variant="transparent"
            size="icon"
            className="text-foreground-secondary-default hover:text-white"
            type="button"
          />
          <Button
            type="submit"
            isLoading={isLoading}
            text={t("comment.add")}
            variant="default"
            size="md"
          />
        </div>
      </form>
    </Modal>
  );
}
