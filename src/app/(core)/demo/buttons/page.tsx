"use client";

import Button from "@/features/shared/components/ui/Button";
import { Send, Heart, Plus, X, Search, Settings } from "lucide-react";
import type { ButtonVariant, ButtonSize } from "@/features/shared/types/button.type";

const variants: ButtonVariant[] = [
  "gradient-fuchsia",
  "icon-fuchsia-solid",
  "icon-fuchsia-ghost",
  "glass-card",
  "danger",
  "secondary",
  "transparent",
];

const sizes: ButtonSize[] = ["sm", "md", "lg", "xl", "icon", "iconSm"];

export default function ButtonsDemoPage() {
  return (
    <div className="min-h-screen bg-primary-neutral-background-default p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-text-main font-Albert_Sans mb-2">
          Button Component Demo
        </h1>
        <p className="text-text-neutral mb-8 font-Albert_Sans">
          Wszystkie warianty i rozmiary przycisków z Button.tsx
        </p>

        {/* Variants Section */}
        <div className="space-y-12">
          {variants.map((variant) => (
            <div key={variant} className="space-y-6">
              <div className="border-b border-primary-neutral-stroke-default pb-2">
                <h2 className="text-2xl font-semibold text-text-main font-Albert_Sans capitalize">
                  {variant.replace(/-/g, " ")}
                </h2>
              </div>

              {/* All sizes for this variant */}
              <div className="space-y-8">
                {/* Text buttons with different sizes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-text-neutral font-Albert_Sans">
                    Z tekstem
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div key={size} className="flex flex-col items-center gap-2">
                          <Button
                            variant={variant}
                            size={size}
                            text={`Button ${size.toUpperCase()}`}
                          />
                          <span className="text-xs text-text-neutral font-Albert_Sans">
                            {size}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Icon-only buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-text-neutral font-Albert_Sans">
                    Tylko ikona
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {["icon", "iconSm"].map((size) => (
                      <div key={size} className="flex flex-col items-center gap-2">
                        <Button
                          variant={variant}
                          size={size as "icon" | "iconSm"}
                          icon={<Plus className="size-4" />}
                        />
                        <span className="text-xs text-text-neutral font-Albert_Sans">
                          {size}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons with left icon */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-text-neutral font-Albert_Sans">
                    Z ikoną po lewej
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div key={size} className="flex flex-col items-center gap-2">
                          <Button
                            variant={variant}
                            size={size}
                            text="Send"
                            leftIcon={<Send className="size-4" />}
                          />
                          <span className="text-xs text-text-neutral font-Albert_Sans">
                            {size}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Buttons with right icon */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-text-neutral font-Albert_Sans">
                    Z ikoną po prawej
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div key={size} className="flex flex-col items-center gap-2">
                          <Button
                            variant={variant}
                            size={size}
                            text="Like"
                            rightIcon={<Heart className="size-4" />}
                          />
                          <span className="text-xs text-text-neutral font-Albert_Sans">
                            {size}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Buttons with both icons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-text-neutral font-Albert_Sans">
                    Z ikonami po obu stronach
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div key={size} className="flex flex-col items-center gap-2">
                          <Button
                            variant={variant}
                            size={size}
                            text="Search"
                            leftIcon={<Search className="size-4" />}
                            rightIcon={<Settings className="size-4" />}
                          />
                          <span className="text-xs text-text-neutral font-Albert_Sans">
                            {size}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Loading state */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-text-neutral font-Albert_Sans">
                    Stan ładowania
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div key={size} className="flex flex-col items-center gap-2">
                          <Button
                            variant={variant}
                            size={size}
                            text="Loading..."
                            isLoading={true}
                          />
                          <span className="text-xs text-text-neutral font-Albert_Sans">
                            {size}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Disabled state */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-text-neutral font-Albert_Sans">
                    Wyłączony
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div key={size} className="flex flex-col items-center gap-2">
                          <Button
                            variant={variant}
                            size={size}
                            text="Disabled"
                            disabled={true}
                          />
                          <span className="text-xs text-text-neutral font-Albert_Sans">
                            {size}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Examples */}
        <div className="mt-16 space-y-6 border-t border-primary-neutral-stroke-default pt-8">
          <h2 className="text-2xl font-semibold text-text-main font-Albert_Sans">
            Przykłady interaktywne
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="gradient-fuchsia"
              size="md"
              text="Kliknij mnie"
              onClick={() => alert("Kliknięto!")}
            />
            <Button
              variant="danger"
              size="md"
              text="Usuń"
              rightIcon={<X className="size-4" />}
              onClick={() => alert("Usuwanie...")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
