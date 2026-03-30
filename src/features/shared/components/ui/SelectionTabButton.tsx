import React from "react";
import { fuchsiaGradientSurfaceClass } from "./buttonSurfaceClasses";

type Props = {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

export default function SelectionTabButton({
  isSelected,
  onClick,
  children,
  className = "",
}: Props) {
  const base =
    "rounded-lg px-4 py-2 text-sm font-Albert_Sans font-medium transition-colors";

  const selected =
    `text-fuchsia-100 ${fuchsiaGradientSurfaceClass} shadow-sm brightness-90 saturate-90 cursor-default`;

  const unselected = "text-text-neutral hover:text-text-main hover:bg-white/5";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`${base} ${isSelected ? selected : unselected} ${className}`}
    >
      {children}
    </button>
  );
}

