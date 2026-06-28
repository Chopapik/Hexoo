"use client";

import React, { useState, useRef } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { PaperclipIcon } from "../icons/PaperclipIcon";
import { SendIcon } from "../icons/SendIcon";
import { YouTubeIcon } from "../icons/YouTubeIcon";
import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";
import RemoveImageButton from "@/features/shared/components/ui/RemoveImageButton";
import { POST_MAX_CHARS } from "../types/post.dto";
import { useI18n } from "@/i18n/useI18n";

interface PostComposerModalProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  onClose: () => void;
  onSubmit: () => void;
  onImageSelect: () => void;
  onImageRemove: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textRegistration: UseFormRegisterReturn<"text">;
  textValue: string;
  imagePreview: string | null | undefined;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  displayError?: string | null;
  isPending: boolean;
  isOverLimit: boolean;
  isSubmitDisabled?: boolean;
  showRemoveImageButton?: boolean;
  acceptedImageTypes?: string;
  alert?: React.ReactNode;
  onYouTubeConfirm?: (url: string) => Promise<boolean>;
  onYouTubeDraftChange?: () => void;
  onYouTubeRemove?: () => void;
  youtubeUrl?: string | null;
  youtubeUrlError?: string | null;
}

export default function PostComposerModal({
  isOpen,
  title,
  placeholder,
  onClose,
  onSubmit,
  onImageSelect,
  onImageRemove,
  onFileChange,
  onTextKeyDown,
  textRegistration,
  textValue,
  imagePreview,
  fileInputRef,
  displayError,
  isPending,
  isOverLimit,
  isSubmitDisabled = isOverLimit,
  showRemoveImageButton = !!imagePreview,
  acceptedImageTypes = "image/png, image/jpeg, image/webp",
  alert,
  onYouTubeConfirm,
  onYouTubeDraftChange,
  onYouTubeRemove,
  youtubeUrl,
  youtubeUrlError,
}: PostComposerModalProps) {
  const { t } = useI18n();
  const hasText = textValue.trim().length > 0;
  const currentLength = textValue.length;

  const [showYouTubeInput, setShowYouTubeInput] = useState(false);
  const [youtubeInputValue, setYoutubeInputValue] = useState("");
  const youtubeInputRef = useRef<HTMLInputElement>(null);

  const handleYouTubeConfirm = async () => {
    const trimmed = youtubeInputValue.trim();
    if (!trimmed) return;
    const accepted = (await onYouTubeConfirm?.(trimmed)) ?? false;
    if (!accepted) return;
    setYoutubeInputValue("");
    setShowYouTubeInput(false);
  };

  const handleYouTubeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleYouTubeConfirm();
    }
    if (e.key === "Escape") {
      setYoutubeInputValue("");
      setShowYouTubeInput(false);
    }
  };

  const footerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          accept={acceptedImageTypes}
          onChange={onFileChange}
          className="hidden"
        />

        <Button
          onClick={onImageSelect}
          icon={<PaperclipIcon className="w-5 h-5" />}
          variant="ghost"
          size="md"
          iconOnly
          aria-label={t("post.createImageAction")}
          className="text-foreground-secondary-default hover:text-foreground-primary-default"
          type="button"
        />

        <Button
          onClick={() => {
            if (!showYouTubeInput && !youtubeUrl) {
              setShowYouTubeInput(true);
              setTimeout(() => youtubeInputRef.current?.focus(), 50);
            } else if (showYouTubeInput) {
              setYoutubeInputValue("");
              setShowYouTubeInput(false);
            }
          }}
          icon={
            <YouTubeIcon
              className={`w-5 h-5 transition-colors ${showYouTubeInput || youtubeUrl ? "text-red-500" : ""}`}
            />
          }
          variant="ghost"
          size="md"
          iconOnly
          aria-label="YouTube"
          className="text-foreground-secondary-default hover:text-red-500"
          type="button"
        />
      </div>

      <span className="text-validation-error-text text-sm font-medium">{displayError}</span>

      <Button
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        isLoading={isPending}
        icon={<SendIcon className="w-5 h-5" />}
        variant="default"
        size="md"
        iconOnly
        aria-label={t("post.createTextAction")}
        type="submit"
      />
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        title={title}
        onClose={onClose}
        footer={footerContent}
        className="w-full h-dvh max-h-dvh lg:h-auto lg:max-h-[calc(100dvh-2rem)] lg:w-full lg:max-w-3xl"
      >
        <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-4">
          {imagePreview && (
            <div
              className={`relative w-fit group animate-in fade-in zoom-in-95 duration-200 transition-all ${
                hasText ? "max-w-[96px] sm:max-w-[120px]" : "max-w-[180px] sm:max-w-[220px]"
              }`}
            >
              <img
                src={imagePreview}
                alt="Preview"
                width={200}
                height={200}
                className={`rounded-xl border border-surface-card-border-default object-cover w-auto transition-all duration-300 ${
                  hasText ? "max-h-20 sm:max-h-24" : "max-h-[min(28dvh,12rem)] sm:max-h-[min(32dvh,16rem)]"
                }`}
              />
              {showRemoveImageButton && (
                <RemoveImageButton
                  onClick={onImageRemove}
                  variant="dark"
                  position="top-right"
                  showOnHover={true}
                />
              )}
            </div>
          )}

          {youtubeUrl ? (
            <div className="relative group flex items-center gap-2 px-3 py-2 rounded-lg border border-modal-surface-border-default bg-modal-surface-background-default w-full animate-in fade-in zoom-in-95 duration-200">
              <YouTubeIcon className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm text-foreground-primary-default truncate flex-1 font-sans pr-4">
                {youtubeUrl}
              </span>
              <RemoveImageButton
                onClick={(e) => { e.stopPropagation(); onYouTubeRemove?.(); }}
                variant="dark"
                position="top-right"
                showOnHover={true}
              />
            </div>
          ) : showYouTubeInput ? (
            <div className="flex flex-col gap-1 w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-modal-surface-border-default bg-modal-surface-background-default w-full">
                <YouTubeIcon className="w-4 h-4 text-red-500 shrink-0" />
                <input
                  ref={youtubeInputRef}
                  type="url"
                  value={youtubeInputValue}
                  onChange={(e) => {
                    setYoutubeInputValue(e.target.value);
                    onYouTubeDraftChange?.();
                  }}
                  onKeyDown={handleYouTubeKeyDown}
                  placeholder={t("post.youtubePlaceholder")}
                  autoFocus
                  className="flex-1 bg-transparent text-foreground-primary-default placeholder:text-foreground-secondary-default/50 text-sm outline-none"
                />
                <Button
                  type="button"
                  onClick={() => void handleYouTubeConfirm()}
                  disabled={!youtubeInputValue.trim()}
                  text={t("common.add")}
                  size="sm"
                  variant="default"
                />
                <Button
                  type="button"
                  onClick={() => {
                    setYoutubeInputValue("");
                    setShowYouTubeInput(false);
                  }}
                  text={t("common.cancel")}
                  size="sm"
                  variant="ghost"
                />
              </div>
              {youtubeUrlError ? (
                <p className="text-xs text-validation-error-text px-1">{youtubeUrlError}</p>
              ) : null}
            </div>
          ) : null}

          <div className="relative w-full">
            <textarea
              {...textRegistration}
              onKeyDown={onTextKeyDown}
              placeholder={placeholder}
              className={`w-full bg-transparent text-foreground-primary-default placeholder:text-foreground-secondary-default/50 text-base resize-none outline-none leading-relaxed pb-6 transition-all duration-300 ${
                imagePreview ? "min-h-[120px] sm:min-h-[140px]" : "min-h-[min(320px,48dvh)] sm:min-h-[min(425px,55dvh)]"
              }`}
              autoFocus
            />

            <div
              className={`
                absolute bottom-0 right-0 text-xs font-medium transition-colors duration-200 pointer-events-none select-none
                ${
                  isOverLimit
                    ? "text-validation-error-text"
                    : "text-foreground-secondary-default/40 group-focus-within:text-foreground-secondary-default/70"
                }
              `}
            >
              {currentLength} / {POST_MAX_CHARS}
            </div>
          </div>
        </div>
      </Modal>

      {alert}
    </>
  );
}
