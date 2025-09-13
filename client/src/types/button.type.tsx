import type { MouseEventHandler, ReactNode } from "react";

export type ButtonVariant = "gradient-fuchsia";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps {
  text?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
