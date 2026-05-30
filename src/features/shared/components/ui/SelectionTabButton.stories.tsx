import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import SelectionTabButton from "./SelectionTabButton";

const meta = {
  component: SelectionTabButton,
  tags: ["ai-generated"],
  args: {
    children: "Posts",
    isSelected: false,
    onClick: () => {},
  },
} satisfies Meta<typeof SelectionTabButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {};

export const Active: Story = {
  args: {
    isSelected: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /posts/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};
