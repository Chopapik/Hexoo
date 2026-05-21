import type { ReactNode } from "react";
import { demoViewportFrames } from "../_lib/viewports";

type DeviceFrameProps = {
  frame: (typeof demoViewportFrames)[number];
  children: ReactNode;
};

export function DeviceFrame({ frame, children }: DeviceFrameProps) {
  const Icon = frame.Icon;

  return (
    <article
      id={frame.id}
      data-viewport={frame.id}
      className="overflow-hidden rounded-lg border border-primary-neutral-stroke-default bg-black/30"
      style={{ width: frame.width }}
    >
      <header className="flex items-center gap-3 border-b border-primary-neutral-stroke-default bg-secondary-neutral-background-default/50 px-4 py-3">
        <div className="flex size-9 items-center justify-center rounded-md border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-100">
          <Icon className="size-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-main">{frame.label}</h2>
          <p className="text-xs text-text-neutral">{frame.description}</p>
        </div>
        <span className="ml-auto font-mono text-xs text-text-neutral">
          {frame.viewport}
        </span>
      </header>
      <div
        className="bg-page-background"
        style={{ width: frame.width }}
      >
        {children}
      </div>
    </article>
  );
}
