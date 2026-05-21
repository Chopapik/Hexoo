"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { demoQueryClient, ensureDemoStore } from "../_lib/demo-data";
import { demoViewportFrames } from "../_lib/viewports";
import { ButtonsSection } from "./ButtonsSection";
import { DeviceFrame } from "./DeviceFrame";
import { UiDemoCatalog } from "./UiDemoCatalog";

export function UiDemoBoard() {
  ensureDemoStore();

  return (
    <QueryClientProvider client={demoQueryClient}>
      <div className="min-h-screen bg-page-background px-4 py-8 sm:px-8">
        <header className="mx-auto mb-10 max-w-[1500px] space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-200">
            Hexoo UI lab
          </p>
          <h1 className="text-2xl font-bold text-text-main font-sans sm:text-3xl">
            Component catalog — mobile, tablet, desktop
          </h1>
          <p className="max-w-2xl text-sm text-text-neutral">
            Wszystkie viewporty na jednej stronie, ułożone w pionie. Bez iframeów.
          </p>
        </header>

        <div className="mx-auto flex w-fit flex-col items-center gap-12">
          <ButtonsSection />

          {demoViewportFrames.map((frame) => (
            <DeviceFrame key={frame.id} frame={frame}>
              <UiDemoCatalog />
            </DeviceFrame>
          ))}
        </div>
      </div>
    </QueryClientProvider>
  );
}
