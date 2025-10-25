import React, { useState, ChangeEvent } from "react";
import eyeIconUrl from "@/assets/icons/eye.svg?url";
import eyeOffIconUrl from "@/assets/icons/eye-off.svg?url";
import warningIcoUrl from "@/assets/icons/warning.svg?url";
import Image from "next/image";

export type Status = "Default" | "Warning" | "Dismiss" | "Success";

export interface Message {
  type: Status;
  text: string;
}

interface InputProps {
  label?: string;
  name?: string;
  type?: "text" | "password" | "email";
  placeholder?: string;
  messages?: Message[];
  status?: Status;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  showButton?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

const borderClasses: Record<Status, string> = {
  Default: "bg-white rounded-lg",
  Warning: "bg-white rounded-lg border-b-4 border-yellow-500",
  Dismiss: "bg-white rounded-lg border-b-4 border-red-600",
  Success: "bg-white rounded-lg",
};

export default function TextInput({
  ref,
  label = "",
  name,
  type = "text",
  placeholder,
  messages = [],
  value,
  onChange,
  showButton = true,
}: InputProps) {
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 14C3.1339 14 0 10.8661 0 7C0 3.1339 3.1339 0 7 0C10.8661 0 14 3.1339 14 7C14 10.8661 10.8661 14 7 14ZM6.3 9.1V10.5H7.7V9.1H6.3ZM6.3 3.5V7.7H7.7V3.5H6.3Z"
              fill="var(--yellow-500, #EAB308)"
            />
          </svg>
        );
        break;
      case "Dismiss":
        colorClass = "text-red-600";
        icon = (
          <div data-svg-wrapper>
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 1.30929L11.6907 0L6.5 5.19071L1.30929 0L0 1.30929L5.19071 6.5L0 11.6907L1.30929 13L6.5 7.80929L11.6907 13L13 11.6907L7.80929 6.5L13 1.30929Z"
                fill="var(--red-600, #DC2626)"
              />
            </svg>
          </div>
        );
        break;
      case "Success":
        colorClass = "text-green-600";
        icon = (
          <div data-svg-wrapper>
            <svg
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.5 1.41L5.5 13.41L0 7.91L1.41 6.5L5.5 10.58L16.09 0L17.5 1.41Z"
                fill="var(--green-600, #16A34A)"
              />
            </svg>
          </div>
        );
        break;
      default:
        colorClass = "text-text-neutral/0";
        icon = <></>;
    }

    return (
      <div
        key={index}
        data-type={msg.type}
        className="px-4 inline-flex justify-center items-center gap-1"
      >
        <div className="inline-flex flex-col justify-center items-center gap-2.5">
          <div className={`justify-start ${colorClass} ${sizeClass}`}>
            {msg.text}
          </div>
        </div>

        <div className="flex justify-start items-start overflow-hidden">
          {icon}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-w-64 min-h-25 inline-flex flex-col justify-start items-start gap-2 ">
      {label && (
        <div className="self-stretch h-5 relative">
          <div className="w-80 h-5 left-0 top-0 absolute justify-start text-text-neutral text-sm font-semibold font-Plus_Jakarta_Sans">
            {label}
          </div>
        </div>
      )}

      <div
        data-show-button={showButton}
        data-status={lastMessageType}
        className={`self-stretch h-11 min-w-48 p-4 inline-flex justify-start items-center gap-2 overflow-hidden ${borderClasses[lastMessageType]}`}
      >
        <input
          type={type === "password" && showPassword ? "text" : type}
          name={name}
          placeholder={placeholder}
          className="flex-1 h-5 justify-start text-black placeholder:text-text-neutral text-base font-semibold font-Plus_Jakarta_Sans bg-transparent outline-none"
          value={value}
          onChange={onChange}
          ref={ref}
        />
        {type === "password" && showButton && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="w-5 h-3.5 relative flex justify-center items-center"
          >
            <Image
              src={showPassword ? eyeOffIconUrl : eyeIconUrl}
              alt={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
              className="w-5 h-5"
            />
          </button>
        )}
      </div>

      {messages.map((msg, index) => renderMessage(msg, index))}
    </div>
  );
}
