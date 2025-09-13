import type { ButtonProps, ButtonSize } from "@/types/button.type";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 min-w-[36px] px-3 text-sm rounded-xl",
  md: "h-11 min-w-[110px] px-4 text-base rounded-3xl",
  lg: "h-11 min-w-[250px] px-5 text-base rounded-xl",
  xl: "h-13 min-w-[350px] px-3 text-base rounded-xl",
};

const variantClasses: Record<string, string> = {
  "gradient-fuchsia":
    "text-white [--btn-fill:linear-gradient(180deg,#C026D3_0%,#86198F_100%)] hover:[--btn-fill:linear-gradient(180deg,#A21CAF_0%,#7E22CE_100%)]",
};

export const Button = ({
  text,
  leftIcon,
  rightIcon,
  size = "md",
  variant = "gradient-fuchsia",
  className = "",
  onClick,
}: ButtonProps) => {
  const baseClasses =
    "relative flex justify-center items-center gap-1 font-bold font-Plus_Jakarta_Sans leading-tight shrink-0 whitespace-nowrap cursor-pointer overflow-hidden transition-colors duration-300 ease-out shadow-sm hover:brightness-95 border-[0.75px] border-transparent [background:var(--btn-fill,_linear-gradient(180deg,#C026D3_0%,#86198F_100%))_padding-box,linear-gradient(180deg,#EF72FF_3%,#61006E_100%)_border-box]";

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button onClick={onClick} className={combinedClasses}>
      {leftIcon && <span className="size-2.5">{leftIcon}</span>}
      {text && <span>{text}</span>}
      {rightIcon && <span className="size-2.5">{rightIcon}</span>}
    </button>
  );
};
