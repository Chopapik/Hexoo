import type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "../../types/button.type";
import Image from "next/image";
import { Loader2 } from "lucide-react";

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
  "gradient-fuchsia":
    "text-white border-[0.75px] border-transparent [--btn-fill:linear-gradient(180deg,#C026D3_0%,#86198F_100%)] [background:var(--btn-fill,_linear-gradient(180deg,#C026D3_0%,#86198F_100%))_padding-box,linear-gradient(180deg,#EF72FF_3%,#61006E_100%)_border-box] shadow-md hover:brightness-90 hover:shadow-lg transition-all",
  // Icon-only solid magenta with raised/glossy effect
  "icon-fuchsia-solid":
    "text-white bg-gradient-to-b from-fuchsia-600 via-fuchsia-700 to-fuchsia-900 shadow-md hover:brightness-90 hover:shadow-lg transition-all",
  // Icon-only ghost magenta
  "icon-fuchsia-ghost": "text-white bg-fuchsia-700/20 hover:bg-fuchsia-700/30 transition-colors",
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
 * @param {ButtonVariant} [props.variant='gradient-fuchsia'] - The visual style variant of the button.
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
  variant = "gradient-fuchsia",
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

  // Ensure className from props overrides default styles
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button
      onClick={onClick}
      className={combinedClasses}
      type={type}
      disabled={disabled || isLoading}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2
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
