import React from "react";

type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "className"
> & {
  children: React.ReactNode;
  error?: string;
  className?: string;
};

const checkboxClasses =
  "peer size-5 appearance-none rounded border-2 border-checkbox-border-unchecked-default bg-checkbox-background-unchecked-default transition-all duration-200 hover:border-checkbox-border-unchecked-hover hover:bg-checkbox-background-unchecked-hover checked:border-checkbox-border-checked-default checked:bg-checkbox-background-checked-default checked:hover:border-checkbox-border-checked-hover checked:hover:bg-checkbox-background-checked-hover disabled:cursor-not-allowed disabled:border-checkbox-border-unchecked-disabled disabled:bg-checkbox-background-unchecked-disabled checked:disabled:border-checkbox-border-checked-disabled checked:disabled:bg-checkbox-background-checked-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default focus-visible:ring-offset-2 focus-visible:ring-offset-page-background-default";

const iconClasses =
  "pointer-events-none absolute h-3.5 w-3.5 text-checkbox-icon-default opacity-0 transition-opacity peer-checked:opacity-100 peer-disabled:text-checkbox-icon-disabled";

const labelClasses =
  "inline-flex items-center gap-1 font-sans text-xs font-medium text-checkbox-label-default group-has-[:disabled]:text-checkbox-label-disabled md:text-sm";

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ children, error, className = "", ...props }, ref) => {
    return (
      <div
        className={`flex w-full self-stretch flex-col items-center ${className}`}
      >
        <label className="group flex cursor-pointer items-center gap-3">
          <div className="relative flex items-center justify-center">
            <input
              {...props}
              ref={ref}
              type="checkbox"
              className={checkboxClasses}
            />

            <svg
              className={iconClasses}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <span className={labelClasses}>{children}</span>
        </label>

        {error && (
          <div className="mt-1 flex animate-in items-center gap-2 fade-in slide-in-from-top-1">
            <div className="text-validation-error-icon">
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                <path
                  d="M13 1.30929L11.6907 0L6.5 5.19071L1.30929 0L0 1.30929L5.19071 6.5L0 11.6907L1.30929 13L6.5 7.80929L11.6907 13L13 11.6907L7.80929 6.5L13 1.30929Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="font-sans text-xs font-normal text-validation-error-text">
              {error}
            </span>
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
