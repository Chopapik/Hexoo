import React, { ChangeEvent, FocusEvent, useId } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
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
  "rounded-lg border-b-4 border-input-border-default bg-input-background-default backdrop-blur-sm transition-colors hover:bg-input-background-hover focus-within:border-input-border-hover focus-within:bg-input-background-hover";

export default function Select({
  id,
  label = "",
  name,
  options,
  placeholder = "Select an option",
  value,
  onChange,
  onBlur,
  disabled,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="inline-flex w-full min-w-64 flex-col items-start justify-start gap-1.5 font-sans">
      {label && (
        <label
          htmlFor={selectId}
          className="font-sans text-sm font-semibold text-input-text-label"
        >
          {label}
        </label>
      )}

      <div
        className={`relative inline-flex h-11 min-w-48 self-stretch items-center justify-start gap-2 overflow-hidden px-4 ${baseBorderClasses}`}
      >
        <select
          id={selectId}
          name={name}
          className="h-full w-full flex-1 cursor-pointer appearance-none border-none bg-transparent pr-6 font-sans text-base font-medium text-input-text-value outline-none disabled:cursor-not-allowed disabled:text-input-button-disabled"
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
