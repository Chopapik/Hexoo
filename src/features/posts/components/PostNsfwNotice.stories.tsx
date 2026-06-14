import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PostNsfwNotice } from "./PostNsfwNotice";

const meta = {
  component: PostNsfwNotice,
  tags: ["ai-generated"],
  args: {
    className: "min-h-48 rounded-xl bg-surface-card-background-default p-6",
  },
} satisfies Meta<typeof PostNsfwNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};
