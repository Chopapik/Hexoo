import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar } from "./Avatar";

const meta = {
  component: Avatar,
  tags: ["ai-generated"],
  args: {
    alt: "Ada Hex",
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultAvatar: Story = {};

export const Large: Story = {
  args: {
    className: "size-20 rounded-xl",
    width: 80,
    height: 80,
  },
};
