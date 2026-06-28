import type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "../../types/button.type";
import { cn } from "../../utils/utils";
import Image from "next/image";
import { AppLoader } from "./AppLoader";
import { buttonSurfaceClasses } from "./buttonSurfaceClasses";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 min-h-7 max-h-7 min-w-7 rounded-xl px-[17px] py-px",
  md: "h-10 min-h-10 max-h-10 min-w-10 rounded-3xl px-[17px] py-[0.75px]",
  xl: "h-[52px] min-h-[52px] max-h-[52px] min-w-[52px] rounded-xl px-[17px] py-[0.75px]",
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: "size-7 min-h-7 max-h-7 min-w-7 max-w-7 rounded-xl p-px",
  md: "size-10 min-h-10 max-h-10 min-w-10 max-w-10 rounded-3xl px-0 py-[0.75px]",
  xl: "size-[52px] min-h-[52px] max-h-[52px] min-w-[52px] max-w-[52px] rounded-xl px-0 py-[0.75px]",
};

const gradientButtonVariants = new Set<ButtonVariant>([
  "default",
  "danger",
  "secondary",
  "success",
  "warning",
  "info",
]);

const iconSlotSizeClasses: Record<ButtonSize, string> = {
  sm: "size-4",
  md: "size-5",
  xl: "size-5",
};

export default function Button({
  text,
  leftIconUrl,
  rightIconUrl,
  iconUrl,
  leftIcon,
  rightIcon,
  icon,
  iconOnly = false,
  size = "md",
  variant = "default",
  className = "",
  leftIconClassName = "",
  rightIconClassName = "",
  iconClassName = "",
  type = "button",
  disabled,
  onClick,
  isLoading = false,
  ...buttonProps
}: ButtonProps) {
  const baseClasses =
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden font-sans text-sm font-medium leading-5 tracking-[-0.14px] transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60 focus-visible:ring-offset-2 focus-visible:ring-offset-page-background-default";

  const isBlocked = Boolean(disabled || isLoading);
  const hasOnlyIcon = iconOnly;
  const visualClasses = buttonSurfaceClasses[variant][
    isBlocked ? "disabled" : "enabled"
  ];

  const combinedClasses = cn(
    baseClasses,
    hasOnlyIcon ? "gap-0" : "gap-2",
    hasOnlyIcon ? iconOnlySizeClasses[size] : sizeClasses[size],
    visualClasses,
    hasOnlyIcon &&
      size === "sm" &&
      gradientButtonVariants.has(variant) &&
      "border",
    isBlocked && "pointer-events-none cursor-not-allowed",
    className,
  );

  const renderIconImage = (src: string, iconClassName?: string) => (
    <Image
      src={src}
      alt=""
      width={20}
      height={20}
      aria-hidden="true"
      className={cn(iconSlotSizeClasses[size], "shrink-0", iconClassName)}
    />
  );

  return (
    <button
      {...buttonProps}
      onClick={onClick}
      className={combinedClasses}
      type={type}
      disabled={isBlocked}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AppLoader size={size === "sm" ? "sm" : "md"} />
        </div>
      )}
      <div
        className={cn(
          "flex min-w-0 items-center justify-center",
          hasOnlyIcon ? iconSlotSizeClasses[size] : "gap-2",
          isLoading && "invisible",
        )}
      >
        {hasOnlyIcon ? (
          icon || (iconUrl && renderIconImage(iconUrl, iconClassName))
        ) : (
          <>
            {leftIcon ||
              (leftIconUrl && renderIconImage(leftIconUrl, leftIconClassName))}
            {text && <span>{text}</span>}
            {rightIcon ||
              (rightIconUrl &&
                renderIconImage(rightIconUrl, rightIconClassName))}
          </>
        )}
      </div>
    </button>
  );
}
