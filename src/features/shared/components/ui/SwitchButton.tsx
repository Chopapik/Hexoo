"use client";

import clsx from "clsx";
import { Switch } from "@headlessui/react";
import { useI18n } from "@/i18n/useI18n";

export type SwitchButtonProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** `id` of the visible heading/label for `aria-labelledby` */
  labelledBy?: string;
  /** Short on/off hint beside the track (e.g. On / Off) */
  onLabel?: string;
  offLabel?: string;
  showOnOffLabels?: boolean;
  /** Visually hidden name for the switch */
  switchLabel?: string;
  className?: string;
};

export default function SwitchButton({
  checked,
  onChange,
  labelledBy,
  onLabel,
  offLabel,
  showOnOffLabels = true,
  switchLabel,
  className,
}: SwitchButtonProps) {
  const { t } = useI18n();
  const resolvedOnLabel = onLabel ?? t("ui.on");
  const resolvedOffLabel = offLabel ?? t("ui.off");
  const resolvedSwitchLabel = switchLabel ?? t("ui.switch");

  return (
    <div className={clsx("flex items-center gap-3 shrink-0", className)}>
      {showOnOffLabels && (
        <span
          className={clsx(
            "min-w-9 text-right font-sans text-sm font-medium tabular-nums",
            checked ? "text-switch-label-checked" : "text-switch-label-default",
          )}
          aria-hidden
        >
          {checked ? resolvedOnLabel : resolvedOffLabel}
        </span>
      )}
      <Switch
        checked={checked}
        onChange={onChange}
        aria-labelledby={labelledBy}
        className={clsx(
          "group relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-transparent p-1 [background:linear-gradient(180deg,var(--switch-background-from)_0%,var(--switch-background-to)_100%)_padding-box,linear-gradient(180deg,var(--switch-border-from)_3%,var(--switch-border-to)_100%)_border-box] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card-background-default",
          checked
            ? "[--switch-background-from:var(--color-switch-track-checked-background-default-from)] [--switch-background-to:var(--color-switch-track-checked-background-default-to)] [--switch-border-from:var(--color-switch-track-checked-border-default-from)] [--switch-border-to:var(--color-switch-track-checked-border-default-to)] hover:[--switch-background-from:var(--color-switch-track-checked-background-hover-from)] hover:[--switch-background-to:var(--color-switch-track-checked-background-hover-to)] hover:[--switch-border-from:var(--color-switch-track-checked-border-hover-from)] hover:[--switch-border-to:var(--color-switch-track-checked-border-hover-to)]"
            : "[--switch-background-from:var(--color-switch-track-unchecked-background-default-from)] [--switch-background-to:var(--color-switch-track-unchecked-background-default-to)] [--switch-border-from:var(--color-switch-track-unchecked-border-default-from)] [--switch-border-to:var(--color-switch-track-unchecked-border-default-to)] hover:[--switch-background-from:var(--color-switch-track-unchecked-background-hover-from)] hover:[--switch-background-to:var(--color-switch-track-unchecked-background-hover-to)] hover:[--switch-border-from:var(--color-switch-track-unchecked-border-hover-from)] hover:[--switch-border-to:var(--color-switch-track-unchecked-border-hover-to)]",
        )}
      >
        <span className="sr-only font-sans">{resolvedSwitchLabel}</span>
        <span
          aria-hidden
          className="pointer-events-none inline-block size-6 rounded-full border border-switch-thumb-border-default bg-switch-thumb-background-default shadow-md transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-checked:translate-x-6"
        />
      </Switch>
    </div>
  );
}
