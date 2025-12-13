"use client";

import React, { useEffect, useState } from "react";
import { PaperclipIcon } from "../icons/PaperclipIcon";
import { SendIcon } from "../icons/SendIcon";
import Image from "next/image";
import { useAppSelector } from "@/lib/store/hooks";
import Modal from "@/features/shared/components/layout/Modal";
import useCreatePostForm from "../hooks/useCreatePostForm";
import useCreatePost from "../hooks/useCreatePost";
import type { CreatePost } from "../types/post.type";
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
      parsedError && setRootError(parsedError.text);
    }
  );

  const submit = handleSubmit((data: CreatePost) => {
    if (isOverLimit) return;

    setRootError(null);

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

        <button
          onClick={triggerPicker}
          className="text-text-neutral hover:text-text-main p-2 rounded-xl hover:bg-secondary-neutral-background-hover transition-all"
          title="Dodaj zdjęcie"
        >
          <PaperclipIcon className="w-5 h-5" />
        </button>
      </div>

      <span className="text-red-500 text-sm font-medium animate-pulse">
        {displayError}
      </span>

      <button
        onClick={submit}
        disabled={isPending || isOverLimit || !!clientError}
        className={`
          p-2 rounded-xl transition-all duration-200 flex items-center justify-center
          ${
            isPending || isOverLimit || !!clientError
              ? "bg-primary-neutral-stroke-default text-text-neutral cursor-not-allowed opacity-50"
              : "bg-white text-black hover:opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
          }
        `}
      >
        {isPending ? (
          <div className="w-5 h-5 border-2 border-t-transparent border-black rounded-xl animate-spin" />
        ) : (
          <SendIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );

  return (
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
            <button
              onClick={removeImage}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
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
  );
}
