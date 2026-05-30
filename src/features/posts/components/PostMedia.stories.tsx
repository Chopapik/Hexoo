import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PostMedia } from "./PostMedia";

const meta = {
  component: PostMedia,
  tags: ["ai-generated"],
  args: {
    src: "/images/face01.png",
    alt: "Portrait used in a post media frame",
    onReadyChange: () => {},
  },
} satisfies Meta<typeof PostMedia>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Image: Story = {};

export const ImageMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};
