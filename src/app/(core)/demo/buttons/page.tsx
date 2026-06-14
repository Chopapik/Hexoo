"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import {
  Send,
  Heart,
  Plus,
  X,
  Search,
  Settings,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";
import type {
  ButtonVariant,
  ButtonSize,
} from "@/features/shared/types/button.type";

const variants: ButtonVariant[] = [
  "default",
  "glass-card",
  "danger",
  "success",
  "warning",
  "info",
  "secondary",
  "outline",
  "outline-fuchsia",
  "ghost",
  "transparent",
];

const sizes: ButtonSize[] = ["sm", "md", "lg", "xl", "icon", "iconSm"];

const viewportFrames = [
  {
    id: "mobile",
    label: "Mobile",
    viewport: "375 x 812",
    width: 375,
    height: 812,
    Icon: Smartphone,
  },
  {
    id: "tablet",
    label: "Tablet",
    viewport: "768 x 900",
    width: 768,
    height: 900,
    Icon: Tablet,
  },
  {
    id: "desktop",
    label: "Desktop",
    viewport: "1500 x 860",
    width: 1500,
    height: 860,
    Icon: Monitor,
  },
];

export default function ButtonsDemoPage() {
  const [frameHeights, setFrameHeights] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        viewportFrames.map((frame) => [frame.id, frame.height]),
      ),
  );
  const cleanupByFrameRef = useRef<Record<string, () => void>>({});

  useEffect(() => {
    return () => {
      Object.values(cleanupByFrameRef.current).forEach((cleanup) =>
        cleanup?.(),
      );
    };
  }, []);

  const connectAutoHeightFrame = (
    frameId: string,
    iframe: HTMLIFrameElement,
  ) => {
    cleanupByFrameRef.current[frameId]?.();

    const frameWindow = iframe.contentWindow;
    const frameDocument = iframe.contentDocument ?? frameWindow?.document;
    const root = frameDocument?.documentElement;
    const body = frameDocument?.body;

    if (!frameWindow || !frameDocument || !root || !body) {
      return;
    }

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.height = "auto";

    const updateHeight = () => {
      const nextHeight = Math.ceil(
        Math.max(
          root.scrollHeight,
          body.scrollHeight,
          root.offsetHeight,
          body.offsetHeight,
        ),
      );

      setFrameHeights((current) =>
        current[frameId] === nextHeight
          ? current
          : { ...current, [frameId]: nextHeight },
      );
    };

    updateHeight();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateHeight)
        : null;
    resizeObserver?.observe(root);
    resizeObserver?.observe(body);

    frameWindow.addEventListener("resize", updateHeight);

    const images = Array.from(frameDocument.images);
    images.forEach((image) => {
      image.addEventListener("load", updateHeight);
      image.addEventListener("error", updateHeight);
    });

    const timeoutIds = [100, 500, 1500, 3000].map((delay) =>
      window.setTimeout(updateHeight, delay),
    );

    cleanupByFrameRef.current[frameId] = () => {
      resizeObserver?.disconnect();
      frameWindow.removeEventListener("resize", updateHeight);
      images.forEach((image) => {
        image.removeEventListener("load", updateHeight);
        image.removeEventListener("error", updateHeight);
      });
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  };

  return (
    <div className="min-h-screen bg-page-background-default p-3 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-lg border border-surface-card-border-default bg-surface-card-background-default p-4 sm:p-6">
          <h1 className="text-3xl font-bold text-foreground-primary-default font-sans sm:text-4xl">
            Button Component Demo
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-secondary-default font-sans sm:text-base">
            All button variants, sizes and states, plus one 1:1 board with real
            mobile, tablet and desktop iframe previews from the full UI demo.
          </p>
        </header>

        <section className="space-y-4 rounded-lg border border-surface-card-border-default bg-surface-card-background-default p-4 sm:p-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground-primary-default font-sans">
              Responsive previews
            </h2>
            <p className="mt-1 text-sm text-foreground-secondary-default">
              All three viewports are rendered 1:1 in one horizontal board. The
              page owns the vertical scroll; the board only scrolls sideways
              when it needs more width.
            </p>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="flex w-max gap-4">
            {viewportFrames.map((frame) => {
              const Icon = frame.Icon;
              const frameHeight = frameHeights[frame.id] ?? frame.height;
              return (
                <article
                  key={frame.id}
                  className="overflow-hidden rounded-lg border border-surface-card-border-default bg-black/40"
                  style={{ width: frame.width + 24 }}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-surface-card-border-default bg-surface-chrome-background-default/50 px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Icon className="size-4 text-fuchsia-200" />
                      <h3 className="font-semibold text-foreground-primary-default">
                        {frame.label}
                      </h3>
                    </div>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-foreground-secondary-default">
                      {frame.viewport}
                    </span>
                  </div>
                  <div className="bg-page-background-default p-2">
                    <iframe
                      title={`${frame.label} UI preview`}
                      src={`/demo/ui#${frame.id}`}
                      width={frame.width}
                      height={frameHeight}
                      loading="lazy"
                      scrolling="no"
                      onLoad={(event) =>
                        connectAutoHeightFrame(frame.id, event.currentTarget)
                      }
                      className="block max-w-none rounded-md border border-surface-card-border-default bg-page-background-default"
                      style={{
                        width: frame.width,
                        height: frameHeight,
                        overflow: "hidden",
                      }}
                    />
                  </div>
                </article>
              );
            })}
            </div>
          </div>
        </section>

        {/* Variants Section */}
        <div className="space-y-12">
          {variants.map((variant) => (
            <div key={variant} className="space-y-6">
              <div className="border-b border-surface-card-border-default pb-2">
                <h2 className="text-2xl font-semibold text-foreground-primary-default font-sans capitalize">
                  {variant.replace(/-/g, " ")}
                </h2>
              </div>

              {/* All sizes for this variant */}
              <div className="space-y-8">
                {/* Text buttons with different sizes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground-secondary-default font-sans">
                    With text
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div
                          key={size}
                          className="flex flex-col items-center gap-2"
                        >
                          <Button
                            variant={variant}
                            size={size}
                            text={`Button ${size.toUpperCase()}`}
                          />
                          <span className="text-xs text-foreground-secondary-default font-sans">
                            {size}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Icon-only buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground-secondary-default font-sans">
                    Icon only
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {["icon", "iconSm"].map((size) => (
                      <div
                        key={size}
                        className="flex flex-col items-center gap-2"
                      >
                        <Button
                          variant={variant}
                          size={size as "icon" | "iconSm"}
                          icon={<Plus className="size-4" />}
                        />
                        <span className="text-xs text-foreground-secondary-default font-sans">
                          {size}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons with left icon */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground-secondary-default font-sans">
                    With left icon
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div
                          key={size}
                          className="flex flex-col items-center gap-2"
                        >
                          <Button
                            variant={variant}
                            size={size}
                            text="Send"
                            leftIcon={<Send className="size-4" />}
                          />
                          <span className="text-xs text-foreground-secondary-default font-sans">
                            {size}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Buttons with right icon */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground-secondary-default font-sans">
                    With right icon
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div
                          key={size}
                          className="flex flex-col items-center gap-2"
                        >
                          <Button
                            variant={variant}
                            size={size}
                            text="Like"
                            rightIcon={<Heart className="size-4" />}
                          />
                          <span className="text-xs text-foreground-secondary-default font-sans">
                            {size}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Buttons with both icons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground-secondary-default font-sans">
                    With icons on both sides
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div
                          key={size}
                          className="flex flex-col items-center gap-2"
                        >
                          <Button
                            variant={variant}
                            size={size}
                            text="Search"
                            leftIcon={<Search className="size-4" />}
                            rightIcon={<Settings className="size-4" />}
                          />
                          <span className="text-xs text-foreground-secondary-default font-sans">
                            {size}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Loading state */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground-secondary-default font-sans">
                    Loading state
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div
                          key={size}
                          className="flex flex-col items-center gap-2"
                        >
                          <Button
                            variant={variant}
                            size={size}
                            text="Loading..."
                            isLoading={true}
                          />
                          <span className="text-xs text-foreground-secondary-default font-sans">
                            {size}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Disabled state */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground-secondary-default font-sans">
                    Disabled
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {sizes
                      .filter((size) => size !== "icon" && size !== "iconSm")
                      .map((size) => (
                        <div
                          key={size}
                          className="flex flex-col items-center gap-2"
                        >
                          <Button
                            variant={variant}
                            size={size}
                            text="Disabled"
                            disabled={true}
                          />
                          <span className="text-xs text-foreground-secondary-default font-sans">
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
        <div className="mt-16 space-y-6 border-t border-surface-card-border-default pt-8">
          <h2 className="text-2xl font-semibold text-foreground-primary-default font-sans">
            Interactive examples
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="default"
              size="md"
              text="Click me"
              onClick={() => alert("Clicked!")}
            />
            <Button
              variant="danger"
              size="md"
              text="Delete"
              rightIcon={<X className="size-4" />}
              onClick={() => alert("Deleting...")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
