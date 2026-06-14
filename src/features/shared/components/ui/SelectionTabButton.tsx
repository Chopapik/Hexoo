import React from "react";
import {
  buttonDefaultStateClass,
  buttonGradientSurfaceClass,
} from "./buttonSurfaceClasses";

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
    "rounded-lg px-4 py-2 text-sm font-sans font-medium transition-colors";

  const selected =
    `text-button-text-default ${buttonGradientSurfaceClass} ${buttonDefaultStateClass} cursor-default`;

  const unselected =
    "bg-button-transparent-background-default text-foreground-secondary-default hover:bg-button-transparent-background-hover hover:text-foreground-primary-default";

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
