import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import ContentSection from "./ContentSection";

const meta = {
  component: ContentSection,
  tags: ["ai-generated"],
} satisfies Meta<typeof ContentSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const switches = canvas.getAllByRole("switch");

    await userEvent.click(switches[0]);
    await expect(switches[0]).toHaveAttribute("aria-checked", "true");
  },
};

export const Mobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};
