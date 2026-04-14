"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";
import { SendIcon } from "@/features/posts/icons/SendIcon";
import useEditComment from "../hooks/useEditComment";
import {
  COMMENT_MAX_CHARS,
  UpdateCommentSchema,
  UpdateCommentRequestDto,
  PublicCommentResponseDto,
} from "../types/comment.dto";

interface EditCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: PublicCommentResponseDto;
}

export default function EditCommentModal({
  isOpen,
  onClose,
  comment,
}: EditCommentModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateCommentRequestDto>({
    resolver: zodResolver(UpdateCommentSchema),
    defaultValues: {
      text: comment.text,
    },
  });

  const [rootError, setRootError] = useState<string | null>(null);

  const textValue = watch("text") || "";
  const currentLength = textValue.length;
  const isOverLimit = currentLength > COMMENT_MAX_CHARS;

  const { editComment, isPending } = useEditComment(
    comment.id,
    comment.postId,
    () => {
      setRootError(null);
      onClose();
    },
    () => {
      setRootError("Nie udało się zaktualizować komentarza.");
    },
  );

  const submit = handleSubmit((data: UpdateCommentRequestDto) => {
    if (isOverLimit) return;
    setRootError(null);
    editComment(data);
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const displayError = errors.text?.message || rootError;

  const footerContent = (
    <div className="flex items-center justify-between w-full">
      <span className="text-red-500 text-sm font-medium">{displayError}</span>

      <Button
        onClick={submit}
        disabled={isOverLimit || !textValue.trim()}
        isLoading={isPending}
        icon={<SendIcon className="w-5 h-5" />}
        variant="default"
        size="icon"
        type="submit"
      />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      title="Edytuj komentarz"
      onClose={onClose}
      footer={footerContent}
      className="w-full h-fit lg:w-full lg:max-w-xl"
    >
      <div className="flex flex-col gap-4 p-4 w-full">
        <div className="relative w-full group">
          <textarea
            {...register("text")}
            onKeyDown={handleKeyDown}
            placeholder="Edytuj komentarz..."
            className="w-full bg-transparent text-text-main placeholder:text-text-neutral/50 text-base resize-none outline-none min-h-[120px] leading-relaxed pb-6"
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
            {currentLength} / {COMMENT_MAX_CHARS}
          </div>
        </div>
      </div>
    </Modal>
  );
}
