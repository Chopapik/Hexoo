"use client";

import React from "react";
import { useI18n } from "@/i18n/useI18n";

interface RemoveImageButtonProps {
  /** Called after the button is clicked. */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Wariant stylu przycisku: 'dark' (czarny) lub 'red' (czerwony) */
  variant?: "dark" | "red";
  /** Pozycja przycisku (dla pozycjonowania absolute) */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Opcjonalne klasy CSS */
  className?: string;
  /** Whether the button should only be visible on hover (requires a parent group). */
  showOnHover?: boolean;
  /** Whether the button should always be visible. */
  alwaysVisible?: boolean;
  /** Icon size (defaults to 12). */
  iconSize?: number;
}

/**
 * Button with a close icon for removing images.
 * Can be used as a standalone element or inside RemovableImagePreview.
 */
export default function RemoveImageButton({
  onClick,
  variant = "dark",
  position,
  className = "",
  showOnHover = false,
  alwaysVisible = false,
  iconSize = 12,
}: RemoveImageButtonProps) {
  const { t } = useI18n();
  const positionClasses = {
    "top-right": "top-1 right-1",
    "top-left": "top-1 left-1",
    "bottom-right": "bottom-1 right-1",
    "bottom-left": "bottom-1 left-1",
  };

  const variantClasses = {
    dark: "bg-modal-overlay-background-default text-button-text-default hover:bg-button-transparent-background-hover",
    red: "bg-button-danger-background-default-from text-button-text-default shadow-lg hover:bg-button-danger-background-hover-from",
  };

  const positionClass = position ? positionClasses[position] : "";
  const variantClass = variantClasses[variant];
  const opacityClass = alwaysVisible || !showOnHover ? "opacity-100" : "opacity-0 group-hover:opacity-100";

  // If className contains its own positioning, do not apply positionClass.
  const hasCustomPosition = className.match(/\b(top|right|left|bottom)-/);
  const finalPositionClass = hasCustomPosition ? "" : positionClass;

  return (
    <button
      onClick={onClick}
      className={`absolute ${finalPositionClass} ${variantClass} rounded-full p-1 hover:scale-110 transition-all ${opacityClass} z-10 ${className}`}
      type="button"
      title={t("ui.removeImage")}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  );
}
