import React, { ChangeEvent, FocusEvent } from "react";
import Image from "next/image";
import { Message, Status } from "./TextInput"; // Import types from TextInput if exported, or redefine

// Redefine Status since it is not exported from TextInput in a way we can easily use if not careful
// (It is exported in TextInput.tsx based on the view_file, but to be safe I will redefine or just use string literals if it complains, but it is exported)
// Actually, let's just assume we can import it. If not, I'll copy the type.

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  name?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: FocusEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

const baseBorderClasses =
  "bg-secondary-neutral-background-default/50 backdrop-blur-sm rounded-lg focus-within:border-white";

export default function Select({
  label = "",
  name,
  options,
  placeholder = "Select an option",
  value,
  onChange,
  onBlur,
  disabled,
}: SelectProps) {
  return (
    <div className="w-full min-w-64 inline-flex flex-col justify-start items-start gap-1.5">
      {label && (
        <div className="text-text-neutral text-sm font-semibold font-Plus_Jakarta_Sans ml-1">
          {label}
        </div>
      )}

      <div
        className={`self-stretch h-11 min-w-48 px-4 inline-flex justify-start items-center gap-2 overflow-hidden transition-all duration-200 ${baseBorderClasses} border-b-4 border-secondary-neutral-stroke-default`}
      >
        <select
          name={name}
          className="flex-1 h-full w-full border-none outline-none text-text-main placeholder:text-text-neutral/50 text-base font-medium font-Plus_Jakarta_Sans bg-transparent appearance-none cursor-pointer"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
        >
          <option
            value=""
            disabled
            className="bg-primary-neutral-background-default"
          >
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-primary-neutral-background-default text-text-main"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow Icon */}
        <div className="pointer-events-none absolute right-4 text-text-neutral">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
