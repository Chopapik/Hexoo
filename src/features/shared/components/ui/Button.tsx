import type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "../../types/button.type";
import Image from "next/image";
import { Loader } from "lucide-react";

/**
 * Map Tailwind CSS classes to button sizes.
 * @type {Record<ButtonSize, string>}
 */
const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 min-w-7 px-3 text-xs rounded-xl",
  md: "h-9 min-w-9 px-4 text-base rounded-3xl",
  lg: "h-11 min-w-11 px-5 text-base rounded-xl",
  xl: "h-13 w-full px-3 text-base rounded-xl",
  // Icon-only sizes
  icon: "h-9 min-w-9 rounded-xl",
  iconSm: "size-7 rounded-xl",
};

/**
 * Map Tailwind CSS classes to button variants.
 * Variants control visual style only; base keeps layout/interaction.
 * @type {Record<ButtonVariant, string>}
 */
const variantClasses: Record<ButtonVariant, string> = {
  // Text button with gradient fill and subtle gradient border - matching Figma design
  default:
    "text-white border-[0.75px] border-transparent [--btn-fill:linear-gradient(180deg,#C026D3_0%,#86198F_100%)] [background:var(--btn-fill,_linear-gradient(180deg,#C026D3_0%,#86198F_100%))_padding-box,linear-gradient(180deg,#EF72FF_3%,#61006E_100%)_border-box] shadow-md hover:brightness-90 hover:shadow-lg transition-all",
  // Note: 'glass-card' relies on an external global CSS class for its styling.
  "glass-card": "text-white glass-card",
  // Danger variant for destructive actions
  danger:
    "text-white bg-gradient-to-b from-red-600 to-red-800 shadow-md hover:brightness-90 hover:shadow-lg transition-all",
  // Secondary variant (neutral)
  secondary:
    "bg-white/5 border border-white/10 text-white hover:bg-white/10 shadow-sm backdrop-blur-sm",
  // Transparent variant with flat hover
  transparent: "bg-transparent hover:bg-white/10 transition-colors",
  // Neutral outline
  outline:
    "text-white/90 border border-white/20 bg-transparent hover:bg-white/10 transition-colors",
  // Fuchsia outline
  "outline-fuchsia":
    "text-fuchsia-200 border border-fuchsia-500/60 bg-transparent hover:bg-fuchsia-500/10 transition-colors",
  // Ghost text-only
  ghost: "text-white/80 bg-transparent hover:bg-white/10 transition-colors",
  // Status variants
  success:
    "text-white bg-gradient-to-b from-emerald-600 to-emerald-800 shadow-md hover:brightness-90 hover:shadow-lg transition-all",
  warning:
    "text-white bg-gradient-to-b from-amber-500 to-amber-700 shadow-md hover:brightness-90 hover:shadow-lg transition-all",
  info: "text-white bg-gradient-to-b from-sky-500 to-sky-700 shadow-md hover:brightness-90 hover:shadow-lg transition-all",
};

/**
 * Classes used for the disabled/blocked state by variant.
 * Keeps each variant visually distinct when disabled.
 */
const disabledVariantClasses: Record<ButtonVariant, string> = {
  default:
    "text-white/80 border border-fuchsia-400/20 bg-fuchsia-700/25 shadow-none",
  "glass-card": "text-white/70 glass-card opacity-60 saturate-50",
  danger: "text-white/80 bg-red-900/40 border border-red-500/30 shadow-none",
  secondary: "text-white/60 bg-white/5 border border-white/10 shadow-none",
  transparent: "text-white/50 bg-transparent shadow-none",
  outline: "text-white/50 border border-white/10 bg-transparent shadow-none",
  "outline-fuchsia":
    "text-fuchsia-200/50 border border-fuchsia-500/20 bg-transparent shadow-none",
  ghost: "text-white/40 bg-transparent shadow-none",
  success:
    "text-white/70 bg-emerald-900/40 border border-emerald-500/25 shadow-none",
  warning:
    "text-white/70 bg-amber-900/40 border border-amber-500/25 shadow-none",
  info: "text-white/70 bg-sky-900/40 border border-sky-500/25 shadow-none",
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
    "relative inline-flex justify-center items-center gap-2 font-bold font-Plus_Jakarta_Sans leading-tight shrink-0 cursor-pointer overflow-hidden transition-all duration-300 ease-out";

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
          <Loader
            className={`animate-spin ${
              size === "sm" || size === "iconSm" ? "size-3.5" : "size-5"
            }`}
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
