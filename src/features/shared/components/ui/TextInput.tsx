import React, { useId, useState, ChangeEvent, FocusEvent } from "react";
import eyeIconUrl from "../../assets/icons/eye.svg?url";
import eyeOffIconUrl from "../../assets/icons/eye-off.svg?url";
import Image from "next/image";
import ValidationMessage from "./ValidationMessage";
import { useI18n } from "@/i18n/useI18n";

export type Status = "Default" | "Warning" | "Dismiss" | "Success";

export interface Message {
  type: Status;
  text: string;
}

interface TextInputProps {
  id?: string;
  label?: string;
  name?: string;
  type?: "text" | "password" | "email";
  placeholder?: string;
  messages?: Message[];
  status?: Status;
  defaultValue?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  showButton?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

const borderClasses: Record<Status, string> = {
  Default:
    "border-b-4 border-input-border-default focus-within:border-input-border-hover",
  Warning:
    "border-b-4 border-validation-warning-border focus-within:border-validation-warning-border",
  Dismiss:
    "border-b-4 border-validation-error-border focus-within:border-validation-error-border",
  Success:
    "border-b-4 border-validation-success-border focus-within:border-validation-success-border",
};

const baseBorderClasses =
  "rounded-lg bg-input-background-default backdrop-blur-sm hover:bg-input-background-hover";

export default function TextInput({
  ref,
  id,
  label = "",
  name,
  type = "text",
  placeholder,
  messages = [],
  status = "Default",
  defaultValue,
  value,
  onChange,
  onBlur,
  showButton = true,
}: TextInputProps) {
  const { t } = useI18n();
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const lastMessageType: Status =
    messages.length > 0 ? messages[messages.length - 1].type : status;

  return (
    <div className="inline-flex w-full min-w-0 flex-col items-start justify-start gap-1.5 font-sans sm:min-w-64">
      {label && (
        <label
          htmlFor={inputId}
          className="font-sans text-sm font-semibold text-input-text-label"
        >
          {label}
        </label>
      )}

      <div
        data-show-button={showButton}
        data-status={lastMessageType}
        className={`inline-flex h-11 min-w-0 self-stretch items-center justify-start gap-2 overflow-hidden px-4 font-sans transition-colors duration-200 sm:min-w-48 ${baseBorderClasses} ${borderClasses[lastMessageType]}`}
      >
        <input
          id={inputId}
          type={type === "password" && showPassword ? "text" : type}
          name={name}
          placeholder={placeholder}
          className="h-full w-full flex-1 border-none bg-transparent font-sans text-base font-medium text-input-text-value outline-none placeholder:text-input-text-placeholder"
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
        />

        {type === "password" && showButton && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="relative flex size-5 items-center justify-center rounded-sm text-input-button-default opacity-60 transition-colors hover:text-input-button-hover hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60 dark:invert"
          >
            <Image
              src={showPassword ? eyeOffIconUrl : eyeIconUrl}
              alt={showPassword ? t("ui.hidePassword") : t("ui.showPassword")}
              className="w-5 h-5"
            />
          </button>
        )}
      </div>

      <div className="min-h-6">
        {messages.length > 0 &&
          messages.map((msg, index) => (
            <ValidationMessage key={index} message={msg} />
          ))}
      </div>
    </div>
  );
}
