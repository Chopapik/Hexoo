import type { ComponentType } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

export type DemoViewport = "mobile" | "tablet" | "desktop";

export const demoViewportFrames: {
  id: DemoViewport;
  label: string;
  viewport: string;
  width: number;
  description: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  {
    id: "mobile",
    label: "Mobile",
    viewport: "375px",
    width: 375,
    description: "Narrow feed, compact controls and bottom navigation.",
    Icon: Smartphone,
  },
  {
    id: "tablet",
    label: "Tablet",
    viewport: "768px",
    width: 768,
    description: "Medium grid, wider forms and tablet spacing.",
    Icon: Tablet,
  },
  {
    id: "desktop",
    label: "Desktop",
    viewport: "1500px",
    width: 1500,
    description: "Full desktop density with side-by-side surfaces.",
    Icon: Monitor,
  },
];
