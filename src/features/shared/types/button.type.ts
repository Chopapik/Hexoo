import type { MouseEventHandler, ReactNode } from "react";

export type ButtonVariant =
  | "default"
  | "glass-card"
  | "danger"
  | "secondary"
  | "transparent"
  | "outline"
  | "outline-fuchsia"
  | "ghost"
  | "success"
  | "warning"
  | "info";
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
