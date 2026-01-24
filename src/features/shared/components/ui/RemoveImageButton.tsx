"use client";

import React from "react";

interface RemoveImageButtonProps {
  /** Funkcja wywoływana po kliknięciu przycisku */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Wariant stylu przycisku: 'dark' (czarny) lub 'red' (czerwony) */
  variant?: "dark" | "red";
  /** Pozycja przycisku (dla pozycjonowania absolute) */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Opcjonalne klasy CSS */
  className?: string;
  /** Czy przycisk ma być widoczny tylko na hover (wymaga grupy parent) */
  showOnHover?: boolean;
  /** Czy przycisk ma być zawsze widoczny */
  alwaysVisible?: boolean;
  /** Rozmiar ikony (domyślnie 12) */
  iconSize?: number;
}

/**
 * Przycisk z ikoną krzyżyka do usuwania zdjęć.
 * Może być używany jako osobny element lub w komponencie RemovableImagePreview.
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
  const positionClasses = {
    "top-right": "top-1 right-1",
    "top-left": "top-1 left-1",
    "bottom-right": "bottom-1 right-1",
    "bottom-left": "bottom-1 left-1",
  };

  const variantClasses = {
    dark: "bg-black/70 text-white hover:bg-black",
    red: "bg-red-600 hover:bg-red-700 text-white shadow-lg",
  };

  const positionClass = position ? positionClasses[position] : "";
  const variantClass = variantClasses[variant];
  const opacityClass = alwaysVisible || !showOnHover ? "opacity-100" : "opacity-0 group-hover:opacity-100";

  // Jeśli className zawiera własne pozycjonowanie (top-, right-, left-, bottom-), nie używaj positionClass
  const hasCustomPosition = className.match(/\b(top|right|left|bottom)-/);
  const finalPositionClass = hasCustomPosition ? "" : positionClass;

  return (
    <button
      onClick={onClick}
      className={`absolute ${finalPositionClass} ${variantClass} rounded-full p-1 hover:scale-110 transition-all ${opacityClass} z-10 ${className}`}
      type="button"
      title="Usuń zdjęcie"
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
