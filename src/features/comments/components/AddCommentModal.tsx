"use client";

import Modal from "@/features/shared/components/layout/Modal";
import useAddComment from "../hooks/useAddComment";
import { AddCommentDto } from "../types/comment.type";
import Button from "@/features/shared/components/ui/Button";
import type { Post } from "@/features/posts/types/post.type";
import useCommentForm from "../hooks/useCommentForm";
import { parseCommentErrorMessages } from "../utils/commentFormValidation";
import warningIconUrl from "@/features/shared/assets/icons/warning.svg?url";
import Image from "next/image";

interface AddCommentModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCommentModal({
  post,
  isOpen,
  onClose,
}: AddCommentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    errors,
    handleServerErrors,
    isSubmitting,
  } = useCommentForm(post.id);

  const textError = parseCommentErrorMessages(errors.text?.message ?? "");
  const rootError = parseCommentErrorMessages(errors.root?.message ?? "");

  const { addComment, isPending } = useAddComment(
    () => {
      reset();
      onClose();
    },
    (errorCode) => handleServerErrors(errorCode)
  );

  const onSubmit = (data: AddCommentDto) => {
    addComment({ ...data, postId: post.id });
  };

  const isLoading = isPending || isSubmitting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Skomentuj post użytkownika: ${post.userName || "Anonim"}`}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 flex flex-col gap-6 rounded-xl"
      >
        <div className="bg-secondary-neutral-background-default p-3 rounded-lg text-text-neutral text-sm italic border border-primary-neutral-stroke-default">
          Odpisujesz na: "{post.text.substring(0, 100)}..."
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            {...register("text")}
            placeholder="Wpisz swój komentarz..."
            className={`w-full p-3 bg-transparent border rounded-lg text-text-main placeholder:text-text-neutral focus:outline-none resize-none h-32 transition-all ${
              textError
                ? "border-red-500 focus:border-red-500"
                : "border-primary-neutral-stroke-default focus:border-primary-fuchsia-stroke-default"
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
          <Button
            type="submit"
            isLoading={isLoading}
            text="Dodaj komentarz"
            variant="gradient-fuchsia"
            size="md"
          />
        </div>
      </form>
    </Modal>
  );
}
