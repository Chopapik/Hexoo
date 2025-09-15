import type { MouseEventHandler, ReactNode } from "react";

export type ButtonVariant =
  | "gradient-fuchsia"
  | "icon-fuchsia-solid"
  | "icon-fuchsia-ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon" | "iconSm";

export interface ButtonProps {
  text?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  icon?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
