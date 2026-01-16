import type { MouseEventHandler, ReactNode } from "react";

export type ButtonVariant =
  | "gradient-fuchsia"
  | "icon-fuchsia-solid"
  | "icon-fuchsia-ghost"
  | "glass-card"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon" | "iconSm";

export interface ButtonProps {
  text?: string;
  leftIconUrl?: string;
  rightIconUrl?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  icon?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  leftIconClassName?: string;
  rightIconClassName?: string;
  type?: "submit" | "reset" | "button";
  disabled?: boolean;
  isLoading?: boolean;
}
