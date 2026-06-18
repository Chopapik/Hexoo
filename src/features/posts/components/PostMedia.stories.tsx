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

export const Landscape16x9: Story = {
  args: {
    intrinsicDimensions: { width: 1920, height: 1080 },
  },
};

export const Square1x1: Story = {
  args: {
    intrinsicDimensions: { width: 1080, height: 1080 },
  },
};

export const Portrait4x5: Story = {
  args: {
    intrinsicDimensions: { width: 1080, height: 1350 },
  },
};

export const Tall9x16: Story = {
  args: {
    intrinsicDimensions: { width: 1080, height: 1920 },
  },
};

export const Panorama: Story = {
  args: {
    intrinsicDimensions: { width: 2400, height: 800 },
  },
};

export const SmallSource: Story = {
  args: {
    intrinsicDimensions: { width: 320, height: 240 },
  },
};

export const ErrorState: Story = {
  args: {
    src: "/images/missing-post-image.png",
    intrinsicDimensions: { width: 1920, height: 1080 },
  },
};

export const ImageMobile: Story = {
  args: {
    intrinsicDimensions: { width: 1080, height: 1920 },
  },
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};
