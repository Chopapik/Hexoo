import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AppLoader } from "./AppLoader";

const meta = {
  component: AppLoader,
  tags: ["ai-generated"],
  args: {
    className: "text-foreground-secondary-default",
  },
} satisfies Meta<typeof AppLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Medium: Story = {};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};
