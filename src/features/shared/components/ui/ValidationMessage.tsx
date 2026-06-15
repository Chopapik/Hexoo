import React from "react";
import { Check, CircleAlert, X } from "lucide-react";
import type { ValidationMessage as ValidationMessageType } from "@/features/shared/types/validation.type";

interface ValidationMessageProps {
  message: ValidationMessageType;
  size?: "default" | "small";
  className?: string;
}

export default function ValidationMessage({
  message,
  size = "default",
  className = "",
}: ValidationMessageProps) {
  let colorClass = "";
  const sizeClass = size === "small" ? "text-xs" : "text-sm";
  const iconClass = size === "small" ? "size-3" : "size-5";
  let icon = <></>;

  switch (message.type) {
    case "Warning":
      colorClass = "text-validation-warning-text";
      icon = <CircleAlert aria-hidden className={iconClass} />;
      break;

    case "Dismiss":
      colorClass = "text-validation-error-text";
      icon = <X aria-hidden className={iconClass} />;
      break;

    case "Success":
      colorClass = "text-validation-success-text";
      icon = <Check aria-hidden className={iconClass} />;
      break;

    default:
      colorClass = "text-transparent";
      icon = <></>;
  }

  return (
    <div
      data-type={message.type}
      className={`inline-flex min-h-6 w-full animate-in items-center justify-start gap-1 fade-in slide-in-from-top-1 font-sans font-normal duration-200 ${colorClass} ${sizeClass} ${className}`}
    >
      <div className="flex size-6 shrink-0 items-center justify-center overflow-hidden">
        {icon}
      </div>
      <div className="min-w-0">{message.text}</div>
    </div>
  );
}
