import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { CommentForm } from "./CommentForm";

const meta = {
  component: CommentForm,
  tags: ["ai-generated"],
  args: {
    postId: "post-1",
  },
} satisfies Meta<typeof CommentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DefaultMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};

export const ValidationError: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByPlaceholderText(/write a comment|napisz komentarz/i),
    );
    await userEvent.keyboard("{Enter}");

    await expect(
      await canvas.findByText(/comment cannot be empty|komentarz nie może być pusty/i),
    ).toBeVisible();
  },
};
