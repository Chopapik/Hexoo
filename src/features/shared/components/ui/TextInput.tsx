import React, { useState, ChangeEvent, FocusEvent } from "react";
import eyeIconUrl from "../../assets/icons/eye.svg?url";
import eyeOffIconUrl from "../../assets/icons/eye-off.svg?url";
import warningIcoUrl from "../../assets/icons/warning.svg?url";
import Image from "next/image";

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

  const renderMessage = (msg: Message, index: number) => {
    let colorClass = "";
    const sizeClass = "text-sm font-normal font-Roboto";
    let icon = <></>;

    switch (msg.type) {
      case "Warning":
        colorClass = "text-yellow-500";
        icon = (
          <div className="relative w-3.5 h-3.5">
            <Image
              src={warningIcoUrl}
              alt="warning"
              fill
              className="object-contain"
            />
          </div>
        );
        break;

      case "Dismiss":
        colorClass = "text-red-500";
        icon = (
          <div data-svg-wrapper className="text-red-500">
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 1.30929L11.6907 0L6.5 5.19071L1.30929 0L0 1.30929L5.19071 6.5L0 11.6907L1.30929 13L6.5 7.80929L11.6907 13L13 11.6907L7.80929 6.5L13 1.30929Z"
                fill="currentColor"
              />
            </svg>
          </div>
        );
        break;

      case "Success":
        colorClass = "text-green-500";
        icon = (
          <div data-svg-wrapper className="text-green-500">
            <svg
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.5 1.41L5.5 13.41L0 7.91L1.41 6.5L5.5 10.58L16.09 0L17.5 1.41Z"
                fill="currentColor"
              />
            </svg>
          </div>
        );
        break;

      default:
        colorClass = "text-transparent";
        icon = <></>;
    }

    return (
      <div
        key={index}
        data-type={msg.type}
        className="px-1 pt-1 inline-flex justify-start items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200 w-full"
      >
        <div className="flex justify-start items-start overflow-hidden pt-0.5">
          {icon}
        </div>
        <div className={`justify-start ${colorClass} ${sizeClass}`}>
          {msg.text}
        </div>
      </div>
    );
  };

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
          messages.map((msg, index) => renderMessage(msg, index))}
      </div>
    </div>
  );
}
