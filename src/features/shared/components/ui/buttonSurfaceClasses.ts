export const buttonGradientSurfaceClass =
  "border-[0.75px] border-transparent [background:linear-gradient(180deg,var(--button-background-from)_0%,var(--button-background-to)_100%)_padding-box,linear-gradient(180deg,var(--button-border-from)_3%,var(--button-border-to)_100%)_border-box]";

export const buttonDefaultStateClass =
  "[--button-background-from:var(--color-button-default-background-default-from)] [--button-background-to:var(--color-button-default-background-default-to)] [--button-border-from:var(--color-button-default-border-default-from)] [--button-border-to:var(--color-button-default-border-default-to)] hover:[--button-background-from:var(--color-button-default-background-hover-from)] hover:[--button-background-to:var(--color-button-default-background-hover-to)] hover:[--button-border-from:var(--color-button-default-border-hover-from)] hover:[--button-border-to:var(--color-button-default-border-hover-to)]";

export const buttonDefaultDisabledStateClass =
  "[--button-background-from:var(--color-button-default-background-disabled-from)] [--button-background-to:var(--color-button-default-background-disabled-to)] [--button-border-from:var(--color-button-default-border-disabled-from)] [--button-border-to:var(--color-button-default-border-disabled-to)]";

type ButtonSurfaceState = "enabled" | "disabled";
type GradientButtonSurface =
  | "default"
  | "danger"
  | "secondary"
  | "success"
  | "warning"
  | "info";
type FlatButtonSurface =
  | "glass-card"
  | "transparent"
  | "outline"
  | "outline-fuchsia"
  | "ghost";

const buttonTextClass: Record<ButtonSurfaceState, string> = {
  enabled: "text-button-text-default",
  disabled: "text-button-text-disabled",
};

export const buttonGradientSurfaceClasses: Record<
  GradientButtonSurface,
  Record<ButtonSurfaceState, string>
> = {
  default: {
    enabled: `${buttonTextClass.enabled} ${buttonGradientSurfaceClass} ${buttonDefaultStateClass}`,
    disabled: `${buttonTextClass.disabled} ${buttonGradientSurfaceClass} ${buttonDefaultDisabledStateClass}`,
  },
  danger: {
    enabled: `${buttonTextClass.enabled} ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-danger-background-default-from)] [--button-background-to:var(--color-button-danger-background-default-to)] [--button-border-from:var(--color-button-danger-border-default-from)] [--button-border-to:var(--color-button-danger-border-default-to)] hover:[--button-background-from:var(--color-button-danger-background-hover-from)] hover:[--button-background-to:var(--color-button-danger-background-hover-to)] hover:[--button-border-from:var(--color-button-danger-border-hover-from)] hover:[--button-border-to:var(--color-button-danger-border-hover-to)]`,
    disabled: `${buttonTextClass.disabled} ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-danger-background-disabled-from)] [--button-background-to:var(--color-button-danger-background-disabled-to)] [--button-border-from:var(--color-button-danger-border-disabled-from)] [--button-border-to:var(--color-button-danger-border-disabled-to)]`,
  },
  secondary: {
    enabled: `${buttonTextClass.enabled} ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-secondary-background-default-from)] [--button-background-to:var(--color-button-secondary-background-default-to)] [--button-border-from:var(--color-button-secondary-border-default-from)] [--button-border-to:var(--color-button-secondary-border-default-to)] hover:[--button-background-from:var(--color-button-secondary-background-hover-from)] hover:[--button-background-to:var(--color-button-secondary-background-hover-to)] hover:[--button-border-from:var(--color-button-secondary-border-hover-from)] hover:[--button-border-to:var(--color-button-secondary-border-hover-to)]`,
    disabled: `${buttonTextClass.disabled} ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-secondary-background-disabled-from)] [--button-background-to:var(--color-button-secondary-background-disabled-to)] [--button-border-from:var(--color-button-secondary-border-disabled-from)] [--button-border-to:var(--color-button-secondary-border-disabled-to)]`,
  },
  success: {
    enabled: `${buttonTextClass.enabled} ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-success-background-default-from)] [--button-background-to:var(--color-button-success-background-default-to)] [--button-border-from:var(--color-button-success-border-default-from)] [--button-border-to:var(--color-button-success-border-default-to)] hover:[--button-background-from:var(--color-button-success-background-hover-from)] hover:[--button-background-to:var(--color-button-success-background-hover-to)] hover:[--button-border-from:var(--color-button-success-border-hover-from)] hover:[--button-border-to:var(--color-button-success-border-hover-to)]`,
    disabled: `${buttonTextClass.disabled} ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-success-background-disabled-from)] [--button-background-to:var(--color-button-success-background-disabled-to)] [--button-border-from:var(--color-button-success-border-disabled-from)] [--button-border-to:var(--color-button-success-border-disabled-to)]`,
  },
  warning: {
    enabled: `${buttonTextClass.enabled} ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-warning-background-default-from)] [--button-background-to:var(--color-button-warning-background-default-to)] [--button-border-from:var(--color-button-warning-border-default-from)] [--button-border-to:var(--color-button-warning-border-default-to)] hover:[--button-background-from:var(--color-button-warning-background-hover-from)] hover:[--button-background-to:var(--color-button-warning-background-hover-to)] hover:[--button-border-from:var(--color-button-warning-border-hover-from)] hover:[--button-border-to:var(--color-button-warning-border-hover-to)]`,
    disabled: `${buttonTextClass.disabled} ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-warning-background-disabled-from)] [--button-background-to:var(--color-button-warning-background-disabled-to)] [--button-border-from:var(--color-button-warning-border-disabled-from)] [--button-border-to:var(--color-button-warning-border-disabled-to)]`,
  },
  info: {
    enabled: `${buttonTextClass.enabled} ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-info-background-default-from)] [--button-background-to:var(--color-button-info-background-default-to)] [--button-border-from:var(--color-button-info-border-default-from)] [--button-border-to:var(--color-button-info-border-default-to)] hover:[--button-background-from:var(--color-button-info-background-hover-from)] hover:[--button-background-to:var(--color-button-info-background-hover-to)] hover:[--button-border-from:var(--color-button-info-border-hover-from)] hover:[--button-border-to:var(--color-button-info-border-hover-to)]`,
    disabled: `${buttonTextClass.disabled} ${buttonGradientSurfaceClass} [--button-background-from:var(--color-button-info-background-disabled-from)] [--button-background-to:var(--color-button-info-background-disabled-to)] [--button-border-from:var(--color-button-info-border-disabled-from)] [--button-border-to:var(--color-button-info-border-disabled-to)]`,
  },
};

export const buttonFlatSurfaceClasses: Record<
  FlatButtonSurface,
  Record<ButtonSurfaceState, string>
> = {
  "glass-card": {
    enabled:
      "border border-button-glass-card-border-default bg-button-glass-card-background-default text-button-text-default hover:border-button-glass-card-border-hover hover:bg-button-glass-card-background-hover",
    disabled:
      "border border-button-glass-card-border-disabled bg-button-glass-card-background-disabled text-button-text-disabled",
  },
  transparent: {
    enabled:
      "bg-button-transparent-background-default text-button-text-default hover:bg-button-transparent-background-hover",
    disabled:
      "bg-button-transparent-background-disabled text-button-text-disabled shadow-none",
  },
  outline: {
    enabled:
      "border-[0.75px] border-button-outline-border-default bg-button-outline-background-default text-button-text-default hover:border-button-outline-border-hover hover:bg-button-outline-background-hover",
    disabled:
      "border-[0.75px] border-button-outline-border-disabled bg-button-outline-background-disabled text-button-text-disabled shadow-none",
  },
  "outline-fuchsia": {
    enabled:
      "border-[0.75px] border-button-outline-fuchsia-border-default bg-button-outline-fuchsia-background-default text-button-text-default hover:border-button-outline-fuchsia-border-hover hover:bg-button-outline-fuchsia-background-hover",
    disabled:
      "border-[0.75px] border-button-outline-fuchsia-border-disabled bg-button-outline-fuchsia-background-disabled text-button-text-disabled shadow-none",
  },
  ghost: {
    enabled:
      "bg-button-ghost-background-default text-button-text-default hover:bg-button-ghost-background-hover",
    disabled:
      "bg-button-ghost-background-disabled text-button-text-disabled shadow-none",
  },
};

export const buttonSurfaceClasses = {
  ...buttonGradientSurfaceClasses,
  ...buttonFlatSurfaceClasses,
};
