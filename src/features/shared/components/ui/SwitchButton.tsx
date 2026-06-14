"use client";

import clsx from "clsx";
import { Switch } from "@headlessui/react";
import {
  buttonDefaultSurfaceClass,
  buttonSecondarySurfaceClass,
} from "./buttonSurfaceClasses";
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
          className="text-sm font-medium font-sans tabular-nums text-foreground-secondary-default min-w-9 text-right"
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
          "group relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card-background-default",
          checked ? buttonDefaultSurfaceClass : buttonSecondarySurfaceClass,
        )}
      >
        <span className="sr-only font-sans">{resolvedSwitchLabel}</span>
        <span
          aria-hidden
          className="pointer-events-none inline-block size-6 rounded-full bg-white shadow-md ring-1 ring-black/10 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-checked:translate-x-6"
        />
      </Switch>
    </div>
  );
}
