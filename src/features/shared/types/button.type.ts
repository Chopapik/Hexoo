import type React from "react";

export type ButtonVariant =
  | "default"
  | "outline"
  | "danger"
  | "secondary"
  | "success"
  | "warning"
  | "info"
  | "ghost";
export type ButtonSize = "sm" | "md" | "xl";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  isLoading?: boolean;
  iconOnly?: boolean;

  leftIconUrl?: string;
  rightIconUrl?: string;
  iconUrl?: string;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;

  leftIconClassName?: string;
  rightIconClassName?: string;
  iconClassName?: string;
}
