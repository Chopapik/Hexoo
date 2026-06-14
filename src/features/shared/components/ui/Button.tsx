import type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "../../types/button.type";
import Image from "next/image";
import { AppLoader } from "./AppLoader";
import {
  buttonDefaultDisabledStateClass,
  buttonDefaultStateClass,
  buttonGradientSurfaceClass,
} from "./buttonSurfaceClasses";

/**
 * Map Tailwind CSS classes to button sizes.
 * @type {Record<ButtonSize, string>}
 */
const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 min-w-7 px-3 text-xs rounded-xl",
  md: "h-10 min-w-10 px-3 text-sm rounded-3xl sm:h-9 sm:min-w-9 sm:px-4 sm:text-base",
  lg: "h-11 min-w-11 px-4 text-sm rounded-xl sm:px-5 sm:text-base",
  xl: "h-11 w-full px-3 text-sm rounded-xl sm:h-13 sm:text-base",
  // Icon-only sizes
  icon: "h-10 min-w-10 rounded-xl sm:h-9 sm:min-w-9",
  iconSm: "size-7 rounded-xl",
};

/**
 * Map Tailwind CSS classes to button variants.
 * Variants control visual style only; base keeps layout/interaction.
 * @type {Record<ButtonVariant, string>}
 */
const variantClasses: Record<ButtonVariant, string> = {
  default: `text-button-text-default ${buttonGradientSurfaceClass} ${buttonDefaultStateClass}`,
  "glass-card":
    "border border-button-glass-card-border-default bg-button-glass-card-background-default text-button-text-default hover:border-button-glass-card-border-hover hover:bg-button-glass-card-background-hover",
  danger:
    `text-button-text-default ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-danger-background-default-from)] [--button-background-to:var(--color-button-danger-background-default-to)] [--button-border-from:var(--color-button-danger-border-default-from)] [--button-border-to:var(--color-button-danger-border-default-to)] hover:[--button-background-from:var(--color-button-danger-background-hover-from)] hover:[--button-background-to:var(--color-button-danger-background-hover-to)] hover:[--button-border-from:var(--color-button-danger-border-hover-from)] hover:[--button-border-to:var(--color-button-danger-border-hover-to)]`,
  secondary:
    `text-button-text-default ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-secondary-background-default-from)] [--button-background-to:var(--color-button-secondary-background-default-to)] [--button-border-from:var(--color-button-secondary-border-default-from)] [--button-border-to:var(--color-button-secondary-border-default-to)] hover:[--button-background-from:var(--color-button-secondary-background-hover-from)] hover:[--button-background-to:var(--color-button-secondary-background-hover-to)] hover:[--button-border-from:var(--color-button-secondary-border-hover-from)] hover:[--button-border-to:var(--color-button-secondary-border-hover-to)]`,
  transparent:
    "bg-button-transparent-background-default text-button-text-default hover:bg-button-transparent-background-hover",
  outline:
    "border border-button-outline-border-default bg-button-outline-background-default text-button-text-default hover:border-button-outline-border-hover hover:bg-button-outline-background-hover",
  "outline-fuchsia":
    "border border-button-outline-fuchsia-border-default bg-button-outline-fuchsia-background-default text-button-text-default hover:border-button-outline-fuchsia-border-hover hover:bg-button-outline-fuchsia-background-hover",
  ghost:
    "bg-button-transparent-background-default text-button-text-default hover:bg-button-transparent-background-hover",
  success:
    `text-button-text-default ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-success-background-default-from)] [--button-background-to:var(--color-button-success-background-default-to)] [--button-border-from:var(--color-button-success-border-default-from)] [--button-border-to:var(--color-button-success-border-default-to)] hover:[--button-background-from:var(--color-button-success-background-hover-from)] hover:[--button-background-to:var(--color-button-success-background-hover-to)] hover:[--button-border-from:var(--color-button-success-border-hover-from)] hover:[--button-border-to:var(--color-button-success-border-hover-to)]`,
  warning:
    `text-button-text-default ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-warning-background-default-from)] [--button-background-to:var(--color-button-warning-background-default-to)] [--button-border-from:var(--color-button-warning-border-default-from)] [--button-border-to:var(--color-button-warning-border-default-to)] hover:[--button-background-from:var(--color-button-warning-background-hover-from)] hover:[--button-background-to:var(--color-button-warning-background-hover-to)] hover:[--button-border-from:var(--color-button-warning-border-hover-from)] hover:[--button-border-to:var(--color-button-warning-border-hover-to)]`,
  info: `text-button-text-default ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-info-background-default-from)] [--button-background-to:var(--color-button-info-background-default-to)] [--button-border-from:var(--color-button-info-border-default-from)] [--button-border-to:var(--color-button-info-border-default-to)] hover:[--button-background-from:var(--color-button-info-background-hover-from)] hover:[--button-background-to:var(--color-button-info-background-hover-to)] hover:[--button-border-from:var(--color-button-info-border-hover-from)] hover:[--button-border-to:var(--color-button-info-border-hover-to)]`,
};

/**
 * Classes used for the disabled/blocked state by variant.
 * Keeps each variant visually distinct when disabled.
 */
const disabledVariantClasses: Record<ButtonVariant, string> = {
  default: `text-button-text-disabled ${buttonGradientSurfaceClass} ${buttonDefaultDisabledStateClass}`,
  "glass-card":
    "border border-button-glass-card-border-disabled bg-button-glass-card-background-disabled text-button-text-disabled",
  danger:
    `text-button-text-disabled ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-danger-background-disabled-from)] [--button-background-to:var(--color-button-danger-background-disabled-to)] [--button-border-from:var(--color-button-danger-border-disabled-from)] [--button-border-to:var(--color-button-danger-border-disabled-to)]`,
  secondary:
    `text-button-text-disabled ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-secondary-background-disabled-from)] [--button-background-to:var(--color-button-secondary-background-disabled-to)] [--button-border-from:var(--color-button-secondary-border-disabled-from)] [--button-border-to:var(--color-button-secondary-border-disabled-to)]`,
  transparent:
    "bg-button-transparent-background-disabled text-button-text-disabled shadow-none",
  outline:
    "border border-button-outline-border-disabled bg-button-outline-background-disabled text-button-text-disabled shadow-none",
  "outline-fuchsia":
    "border border-button-outline-fuchsia-border-disabled bg-button-outline-fuchsia-background-disabled text-button-text-disabled shadow-none",
  ghost:
    "bg-button-transparent-background-disabled text-button-text-disabled shadow-none",
  success:
    `text-button-text-disabled ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-success-background-disabled-from)] [--button-background-to:var(--color-button-success-background-disabled-to)] [--button-border-from:var(--color-button-success-border-disabled-from)] [--button-border-to:var(--color-button-success-border-disabled-to)]`,
  warning:
    `text-button-text-disabled ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-warning-background-disabled-from)] [--button-background-to:var(--color-button-warning-background-disabled-to)] [--button-border-from:var(--color-button-warning-border-disabled-from)] [--button-border-to:var(--color-button-warning-border-disabled-to)]`,
  info: `text-button-text-disabled ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-info-background-disabled-from)] [--button-background-to:var(--color-button-info-background-disabled-to)] [--button-border-from:var(--color-button-info-border-disabled-from)] [--button-border-to:var(--color-button-info-border-disabled-to)]`,
};

/**
 * A customizable Button component that supports various sizes, visual variants,
 * and optional icons.
 *
 * @param {ButtonProps} props - The properties for the Button component.
 * @param {string} [props.text] - The text content of the button.
 * @param {string} [props.leftIconUrl] - URL for a left-aligned icon image.
 * @param {string} [props.rightIconUrl] - URL for a right-aligned icon image.
 * @param {ReactNode} [props.leftIcon] - ReactNode for a left-aligned icon (takes precedence over leftIconUrl).
 * @param {ReactNode} [props.rightIcon] - ReactNode for a right-aligned icon (takes precedence over rightIconUrl).
 * @param {ReactNode} [props.icon] - ReactNode for a central icon (takes precedence over all other icon props).
 * @param {ButtonSize} [props.size='md'] - The size of the button ('sm', 'md', 'lg', 'xl', 'icon', 'iconSm').
 * @param {ButtonVariant} [props.variant='default'] - The visual style variant of the button.
 * @param {string} [props.className=''] - Additional Tailwind CSS classes for custom styling.
 * @param {MouseEventHandler<HTMLButtonElement>} [props.onClick] - Event handler for button clicks.
 * @param {string} [props.leftIconClassName=''] - Additional Tailwind CSS classes for the left icon.
 * @param {string} [props.rightIconClassName=''] - Additional Tailwind CSS classes for the right icon.
 * @param {'submit' | 'reset' | 'button'} [props.type='button'] - The native button type.
 * @param {boolean} [props.disabled] - If true, the button will be disabled.
 */
export default function Button({
  text,
  leftIconUrl,
  rightIconUrl,
  leftIcon,
  rightIcon,
  icon, // Added icon prop
  size = "md",
  variant = "default",
  className = "",
  leftIconClassName = "",
  rightIconClassName = "",
  type = "button",
  disabled,
  onClick,
  isLoading = false,
}: ButtonProps) {
  // Keep base layout/interaction minimal so variants can fully style background/borders.
  const baseClasses =
    "relative inline-flex justify-center items-center gap-2 font-bold font-sans leading-tight shrink-0 cursor-pointer overflow-hidden transition-colors duration-300 ease-out";

  // When disabled or loading, use the per-variant blocked look.
  const visualClasses =
    disabled || isLoading
      ? disabledVariantClasses[variant]
      : variantClasses[variant];

  // Ensure className from props overrides default styles
  const combinedClasses = `${baseClasses} ${
    sizeClasses[size]
  } ${visualClasses} ${
    disabled || isLoading ? "cursor-not-allowed pointer-events-none" : ""
  } ${className}`;

  return (
    <button
      onClick={onClick}
      className={combinedClasses}
      type={type}
      disabled={disabled || isLoading}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AppLoader
            size={size === "sm" || size === "iconSm" ? "sm" : "md"}
          />
        </div>
      )}
      <div
        className={`flex items-center gap-2 ${isLoading ? "invisible" : ""}`}
      >
        {icon ? ( // Handle central icon prop
          icon
        ) : (
          <>
            {leftIcon ||
              (leftIconUrl && (
                <Image src={leftIconUrl} alt="" className={leftIconClassName} />
              ))}
            {text && <span>{text}</span>}
            {rightIcon ||
              (rightIconUrl && (
                <Image
                  src={rightIconUrl}
                  alt=""
                  className={rightIconClassName}
                />
              ))}
          </>
        )}
      </div>
    </button>
  );
}
