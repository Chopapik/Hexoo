import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import LanguageSwitch from "./LanguageSwitch";

const meta = {
  component: LanguageSwitch,
  tags: ["ai-generated"],
} satisfies Meta<typeof LanguageSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "pl" }));
    await expect(canvas.getByRole("button", { name: "pl" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};

export const Compact: Story = {
  args: {
    compact: true,
  },
};
