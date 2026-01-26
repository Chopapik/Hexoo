import React from "react";
import Image from "next/image";
import warningIcoUrl from "../../assets/icons/warning.svg?url";
import type { ValidationMessage as ValidationMessageType } from "@/features/shared/types/validation.type";

interface ValidationMessageProps {
  message: ValidationMessageType;
  className?: string;
}

export default function ValidationMessage({
  message,
  className = "",
}: ValidationMessageProps) {
  let colorClass = "";
  const sizeClass =
    "text-sm font-normal font-Roboto transition-colors duration-300 ease-in-out";
  let icon = <></>;

  switch (message.type) {
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
      data-type={message.type}
      className={`px-1 pt-1 inline-flex justify-start items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200 transition-all ease-in-out w-full ${className}`}
    >
      <div className="flex justify-start items-start overflow-hidden pt-0.5 transition-colors duration-300 ease-in-out">
        {icon}
      </div>
      <div className={`justify-start ${colorClass} ${sizeClass}`}>
        {message.text}
      </div>
    </div>
  );
}
