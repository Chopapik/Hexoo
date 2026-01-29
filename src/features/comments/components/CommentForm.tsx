"use client";

import { AddCommentDto, COMMENT_MAX_CHARS } from "../types/comment.type";
import Button from "@/features/shared/components/ui/Button";
import useCommentForm from "../hooks/useCommentForm";
import useAddComment from "../hooks/useAddComment";
import { parseCommentErrorMessages } from "../utils/commentFormValidation";
import { SendIcon } from "@/features/posts/icons/SendIcon";

interface CommentFormProps {
  postId: string;
}

export const CommentForm = ({ postId }: CommentFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    errors,
    handleServerErrors,
    isSubmitting,
  } = useCommentForm(postId);

  const validationErrorRaw =
    errors.text?.message || errors.root?.message || "";
  const parsedError = parseCommentErrorMessages(validationErrorRaw);
  const displayError = parsedError?.text;

  const { addComment, isPending } = useAddComment(
    () => {
      reset();
    },
    (errorCode) => handleServerErrors(errorCode),
  );

  const onSubmit = (data: AddCommentDto) => {
    addComment({ ...data, postId });
  };

  const isLoading = isPending || isSubmitting;
  const textValue = watch("text") || "";
  const currentLength = textValue.length;
  const isOverLimit = currentLength > COMMENT_MAX_CHARS;
  const hasContentError = parsedError?.field === "content";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="relative w-full group">
        <textarea
          {...register("text")}
          placeholder="Napisz komentarz..."
          className="w-full bg-transparent text-text-main placeholder:text-text-neutral/50 text-base resize-none outline-none min-h-[90px] scrollbar-hide leading-relaxed pb-6"
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
          {currentLength} / {COMMENT_MAX_CHARS}
        </div>
      </div>
      <div className="flex items-center justify-between w-full">
        <span className="text-red-500 text-sm font-medium">{displayError}</span>
        <Button
          type="submit"
          isLoading={isLoading}
          icon={<SendIcon className="w-5 h-5" />}
          variant="default"
          size="icon"
          disabled={isOverLimit || hasContentError}
        />
      </div>
    </form>
  );
};
