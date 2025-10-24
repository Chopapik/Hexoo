import React, { useState, ChangeEvent } from "react";
import eyeIcon from "@/assets/icons/eye.svg";
import eyeOffIcon from "@/assets/icons/eye-off.svg";
import Image from "next/image";

export type Status = "Default" | "Warning" | "Dismiss" | "Success";

export interface Message {
  type: Status;
  text: string;
}

interface InputProps {
  label?: string;
  name: string;
  type?: "text" | "password" | "email";
  placeholder?: string;
  messages?: Message[];
  status?: Status;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  showButton?: boolean;
}

const borderClasses: Record<Status, string> = {
  Default: "bg-white rounded-lg",
  Warning: "bg-white rounded-lg border-b-4 border-yellow-500",
  Dismiss: "bg-white rounded-lg border-b-4 border-red-600",
  Success: "bg-white rounded-lg",
};

export default function TextInput({
  label = "",
  type = "text",
  placeholder,
  messages = [],
  status = "Default",
  value,
  onChange,
  showButton = true,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const renderMessage = (msg: Message, index: number) => {
    let colorClass = "";
    const sizeClass = "text-sm font-normal font-Roboto";
    let iconSizeClass = "";

    switch (msg.type) {
      case "Warning":
        colorClass = "text-yellow-500";
        iconSizeClass = "w-3.5 h-3.5 relative bg-yellow-500";
        break;
      case "Dismiss":
        colorClass = "text-red-600";
        iconSizeClass = "w-3 h-3 bg-red-600";
        break;
      case "Success":
        colorClass = "text-green-600";
        iconSizeClass = "w-4 h-3.5 relative bg-green-600";
        break;
      default:
        colorClass = "text-text-neutral/0";
        iconSizeClass = "";
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
        {iconSizeClass && (
          <div className="flex justify-start items-start overflow-hidden">
            <div className={iconSizeClass} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-w-64 min-h-24 inline-flex flex-col justify-start items-start gap-2">
      {label && (
        <div className="self-stretch h-5 relative">
          <div className="w-80 h-5 left-0 top-0 absolute justify-start text-text-neutral text-sm font-semibold font-Plus_Jakarta_Sans">
            {label}
          </div>
        </div>
      )}

      <div
        data-show-button={showButton}
        data-status={status}
        className={`self-stretch h-11 min-w-48 p-4 inline-flex justify-start items-center gap-2 overflow-hidden ${borderClasses[status]}`}
      >
        <input
          type={type === "password" && showPassword ? "text" : type}
          name={name}
          placeholder={placeholder}
          className="flex-1 h-5 justify-start text-black placeholder:text-text-neutral text-base font-semibold font-Plus_Jakarta_Sans bg-transparent outline-none"
          value={value}
          onChange={onChange}
        />
        {type === "password" && showButton && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="w-5 h-3.5 relative flex justify-center items-center"
          >
            <Image
              src={showPassword ? eyeOffIcon : eyeIcon}
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
