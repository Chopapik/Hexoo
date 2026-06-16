import Button from "@/features/shared/components/ui/Button";
import type {
  ButtonSize,
  ButtonVariant,
} from "@/features/shared/types/button.type";
import chevronRightUrl from "@/features/shared/assets/icons/chevronRight.svg?url";
import {
  Heart,
  Plus,
  Search,
  Send,
  Settings,
} from "lucide-react";
import {
  buttonModes,
  buttonSizes,
  buttonVariants,
} from "../_lib/demo-data";
import { DemoSection } from "./DemoSection";

const BUTTONS_SECTION_WIDTH = 1500;

function renderButtonForMode(
  mode: (typeof buttonModes)[number],
  variant: ButtonVariant,
  size: ButtonSize,
) {
  const isIconSize = size === "icon" || size === "iconSm";
  const text = isIconSize ? undefined : size.toUpperCase();

  switch (mode) {
    case "Text":
      return (
        <Button
          variant={variant}
          size={size}
          text={text}
          icon={isIconSize ? <Plus className="size-4" /> : undefined}
        />
      );
    case "Left icon":
      return (
        <Button
          variant={variant}
          size={size}
          text={text ?? undefined}
          icon={isIconSize ? <Send className="size-4" /> : undefined}
          leftIcon={!isIconSize ? <Send className="size-4" /> : undefined}
        />
      );
    case "Right icon":
      return (
        <Button
          variant={variant}
          size={size}
          text={text ?? undefined}
          icon={isIconSize ? <Heart className="size-4" /> : undefined}
          rightIcon={!isIconSize ? <Heart className="size-4" /> : undefined}
        />
      );
    case "Both icons":
      return (
        <Button
          variant={variant}
          size={size}
          text={text ?? undefined}
          icon={isIconSize ? <Search className="size-4" /> : undefined}
          leftIcon={!isIconSize ? <Search className="size-4" /> : undefined}
          rightIcon={!isIconSize ? <Settings className="size-4" /> : undefined}
        />
      );
    case "Icon only":
      return (
        <Button
          variant={variant}
          size={size}
          icon={<Plus className="size-4" />}
          iconOnly
        />
      );
    case "Loading":
      return (
        <Button
          variant={variant}
          size={size}
          text={text ?? "Load"}
          icon={isIconSize ? <Plus className="size-4" /> : undefined}
          isLoading
        />
      );
    case "Disabled":
      return (
        <Button
          variant={variant}
          size={size}
          text={text ?? "Off"}
          icon={isIconSize ? <Plus className="size-4" /> : undefined}
          disabled
        />
      );
    case "URL icon":
      return (
        <Button
          variant={variant}
          size={size}
          text={text ?? undefined}
          icon={isIconSize ? <Plus className="size-4" /> : undefined}
          rightIconUrl={!isIconSize ? chevronRightUrl : undefined}
        />
      );
  }
}

function ButtonMatrix() {
  return (
    <div className="space-y-8">
      {buttonVariants.map((variant) => (
        <div key={variant} className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="text-lg font-semibold capitalize text-foreground-primary-default">
              {variant.replace(/-/g, " ")}
            </h3>
            <p className="text-xs text-foreground-secondary-default">
              {buttonSizes.length} sizes x {buttonModes.length} content states
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {buttonModes.map((mode) => (
              <div
                key={`${variant}-${mode}`}
                className="rounded-lg border border-surface-card-border-default bg-surface-chrome-background-default/25 p-3"
              >
                <h4 className="mb-3 text-sm font-semibold text-foreground-secondary-default">
                  {mode}
                </h4>
                <div className="grid grid-cols-2 gap-2 min-[520px]:grid-cols-3">
                  {buttonSizes.map((size) => (
                    <div
                      key={`${variant}-${mode}-${size}`}
                      className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border border-surface-card-border-default/60 bg-surface-card-background-default p-2"
                    >
                      <span className="font-mono text-[10px] uppercase text-foreground-secondary-default">
                        {size}
                      </span>
                      {renderButtonForMode(mode, variant, size)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ButtonsSection() {
  return (
    <article
      id="buttons"
      data-section="buttons"
      className="overflow-hidden rounded-lg border border-surface-card-border-default bg-surface-card-background-default"
      style={{
        width: BUTTONS_SECTION_WIDTH,
        minWidth: BUTTONS_SECTION_WIDTH,
        maxWidth: BUTTONS_SECTION_WIDTH,
      }}
    >
      <div className="bg-page-background-default p-3 sm:p-6">
        <DemoSection
          id="button-matrix"
          title="Buttons"
          description="Every variant is stress-tested across every size, icon placement, loading state, disabled state and URL icon path."
        >
          <ButtonMatrix />
        </DemoSection>
      </div>
    </article>
  );
}
