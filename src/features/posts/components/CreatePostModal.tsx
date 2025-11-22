"use client";

import { useState, useRef, ChangeEvent } from "react";
import { PaperclipIcon } from "../icons/PaperclipIcon";
import { SendIcon } from "../icons/SendIcon";
import useCreatePost from "../hooks/useCreatePost";
import Image from "next/image";
import { useAppSelector } from "@/lib/store/hooks";
import Modal from "@/features/shared/components/layout/Modal";
interface CreatePostModalProps {
  onClose: () => void;
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useAppSelector((state) => state.auth.user);

  const { createPost, isPending } = useCreatePost(() => {
    onClose();
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!text.trim() && !imageFile) return;
    createPost({
      text,
      imageFile: imageFile || undefined,
      device: "Web",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSubmitDisabled = isPending || (!text.trim() && !imageFile);
  const footerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-text-neutral hover:text-text-main p-2 rounded-full hover:bg-white/10 transition-all"
          title="Dodaj zdjęcie"
        >
          <PaperclipIcon className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className={`
          p-2 rounded-xl transition-all duration-200 flex items-center justify-center
          ${
            isSubmitDisabled
              ? "bg-primary-neutral-stroke-default text-text-neutral cursor-not-allowed opacity-50"
              : "bg-white text-black hover:opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
          }
        `}
      >
        {isPending ? (
          <div className="w-5 h-5 border-2 border-t-transparent border-black rounded-full animate-spin" />
        ) : (
          <SendIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );

  return (
    <Modal title="Nowy post" onClose={onClose} footer={footerContent}>
      <div className="flex flex-col gap-4">
        {imagePreview && (
          <div className="relative w-fit group animate-in fade-in zoom-in-95 duration-200">
            <Image
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

        {/* Input Area */}
        <div className="relative w-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              user ? `Co u Ciebie słychać, ${user.name}?` : "Napisz coś..."
            }
            className="w-full bg-transparent text-text-main placeholder:text-text-neutral/50 text-base resize-none outline-none min-h-[100px] scrollbar-hide leading-relaxed"
            autoFocus
          />
        </div>
      </div>
    </Modal>
  );
}
