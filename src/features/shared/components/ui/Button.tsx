import type { ButtonProps, ButtonSize } from "../../types/button.type";
import Image from "next/image";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 min-w-9 px-3 text-xs rounded-xl",
  md: "h-9 min-w-[110px] px-4 text-base rounded-3xl",
  lg: "h-11 min-w-[190px] px-5 text-base rounded-xl",
  xl: "h-13 w-full px-3 text-base rounded-xl",
  // Icon-only sizes
  icon: "h-9 min-w-9 rounded-xl",
  iconSm: "size-7 rounded-xl",
};

// Variants control visual style only; base keeps layout/interaction.
const variantClasses: Record<string, string> = {
  // Text button with gradient fill and subtle gradient border
  "gradient-fuchsia":
    "text-white border-[0.75px] border-transparent [--btn-fill:linear-gradient(180deg,#C026D3_0%,#86198F_100%)] [background:var(--btn-fill,_linear-gradient(180deg,#C026D3_0%,#86198F_100%))_padding-box,linear-gradient(180deg,#EF72FF_3%,#61006E_100%)_border-box] shadow-sm hover:brightness-90",
  // Icon-only solid magenta (as in the mockup)
  "icon-fuchsia-solid":
    "text-white bg-gradient-to-b from-fuchsia-600 to-fuchsia-800 outline outline-[0.75px] outline-offset-[-0.75px] outline-fuchsia-400",
  // Icon-only ghost magenta
  "icon-fuchsia-ghost": "text-white bg-fuchsia-700/20",
  "glass-card": "text-white glass-card",
};

export default function Button({
  text,
  leftIconUrl,
  rightIconUrl,
  leftIcon,
  rightIcon,
  size = "md",
  variant = "gradient-fuchsia",
  className = "",
  leftIconClassName = "",
  rightIconClassName = "",
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  // Keep base layout/interaction minimal so variants can fully style background/borders.
  const baseClasses =
    "relative inline-flex justify-center items-center gap-2 font-bold font-Plus_Jakarta_Sans leading-tight shrink-0 cursor-pointer overflow-hidden transition-all duration-300 ease-out";

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button
      onClick={onClick}
      className={combinedClasses}
      type={type}
      disabled={disabled}
    >
      {leftIcon ||
        (leftIconUrl && (
          <Image src={leftIconUrl} alt="" className={leftIconClassName} />
        ))}
      {text && <span>{text}</span>}
      {rightIcon ||
        (rightIconUrl && (
          <Image src={rightIconUrl} alt="" className={rightIconClassName} />
        ))}
    </button>
  );
}
