import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import CreatePostButton from "./CreatePostButton";

const meta = {
  component: CreatePostButton,
  tags: ["ai-generated"],
  args: {
    onClick: () => {},
  },
} satisfies Meta<typeof CreatePostButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    text: "Create",
    showIcon: false,
    className: "max-w-sm",
  },
};

export const Clickable: Story = {
  args: {
    text: "Start a post",
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /start a post/i }));
    await expect(canvas.getByRole("button", { name: /start a post/i })).toBeEnabled();
  },
};
