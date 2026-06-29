import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import HomePostList from "./HomePostList";

const meta = {
  component: HomePostList,
  tags: ["ai-generated"],
  args: {
    className: "max-w-[920px]",
  },
} satisfies Meta<typeof HomePostList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FromApi: Story = {
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(/rendering this post from the shared msw handler/i),
    ).toBeVisible();
  },
};

export const FromApiMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
  play: FromApi.play,
};
