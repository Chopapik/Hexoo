import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import Button from "./Button";

const meta = {
  component: Button,
  tags: ["ai-generated"],
  args: {
    text: "Continue",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    text: "Cancel",
    variant: "secondary",
  },
};

export const Danger: Story = {
  args: {
    text: "Delete post",
    variant: "danger",
  },
};

export const Loading: Story = {
  args: {
    text: "Saving",
    isLoading: true,
  },
};

export const CssCheck: Story = {
  args: {
    text: "Submit",
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: /submit/i });

    await expect(getComputedStyle(button).backgroundImage).toContain(
      "rgb(192, 38, 211)",
    );
  },
};
