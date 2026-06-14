import React, { ChangeEvent, FocusEvent } from "react";

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
  "rounded-lg border-b-4 border-input-border-default bg-input-background-default backdrop-blur-sm focus-within:border-input-border-hover";

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
        <div className="ml-1 font-sans text-sm font-semibold text-input-text-label">
          {label}
        </div>
      )}

      <div
        className={`self-stretch h-11 min-w-48 px-4 inline-flex justify-start items-center gap-2 overflow-hidden transition-all duration-200 ${baseBorderClasses}`}
      >
        <select
          name={name}
          className="h-full w-full flex-1 cursor-pointer appearance-none border-none bg-transparent font-sans text-base font-medium text-input-text-value outline-none placeholder:text-input-text-placeholder disabled:cursor-not-allowed disabled:text-input-button-disabled"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
        >
          <option
            value=""
            disabled
            className="bg-input-background-default text-input-text-placeholder"
          >
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-input-background-default text-input-text-value"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow Icon */}
        <div className="pointer-events-none absolute right-4 text-input-button-default">
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
