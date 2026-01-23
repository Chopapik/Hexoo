import React, { useState, ChangeEvent, FocusEvent } from "react";
import eyeIconUrl from "../../assets/icons/eye.svg?url";
import eyeOffIconUrl from "../../assets/icons/eye-off.svg?url";
import Image from "next/image";
import ValidationMessage from "./ValidationMessage";

export type Status = "Default" | "Warning" | "Dismiss" | "Success";

export interface Message {
  type: Status;
  text: string;
}

interface TextInputProps {
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
  Default: "border-b-4 border-secondary-neutral-stroke-default",
  Warning: "border-b-4 border-yellow-500",
  Dismiss: "border-b-4 border-red-600",
  Success: "border-b-4 border-green-500/50",
};

const baseBorderClasses =
  "bg-secondary-neutral-background-default/50 backdrop-blur-sm rounded-lg focus-within:border-white";

export default function TextInput({
  ref,
  label = "",
  name,
  type = "text",
  placeholder,
  messages = [],
  defaultValue,
  value,
  onChange,
  onBlur,
  showButton = true,
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const lastMessageType: Status =
    messages.length > 0 ? messages[messages.length - 1].type : "Default";

  return (
    <div className="w-full min-w-64 inline-flex flex-col justify-start items-start gap-1.5">
      {label && (
        <div className="text-text-neutral text-sm font-semibold font-Plus_Jakarta_Sans ml-1">
          {label}
        </div>
      )}

      <div
        data-show-button={showButton}
        data-status={lastMessageType}
        className={`self-stretch h-11 min-w-48 px-4 inline-flex justify-start items-center gap-2 overflow-hidden transition-all duration-200 ${baseBorderClasses} ${borderClasses[lastMessageType]}`}
      >
        <input
          type={type === "password" && showPassword ? "text" : type}
          name={name}
          placeholder={placeholder}
          className="flex-1 h-full w-full border-none outline-none text-text-main placeholder:text-text-neutral/50 text-base font-medium font-Plus_Jakarta_Sans bg-transparent"
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
            className="w-5 h-5 relative flex justify-center items-center opacity-60 hover:opacity-100 transition-opacity dark:invert"
          >
            <Image
              src={showPassword ? eyeOffIconUrl : eyeIconUrl}
              alt={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
              className="w-5 h-5"
            />
          </button>
        )}
      </div>

      <div className="min-h-8">
        {messages.length > 0 &&
          messages.map((msg, index) => (
            <ValidationMessage key={index} message={msg} />
          ))}
      </div>
    </div>
  );
}
