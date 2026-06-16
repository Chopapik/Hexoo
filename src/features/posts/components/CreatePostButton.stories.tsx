import { useEffect, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { useAppStore } from "@/lib/store/store";
import CreatePostButton from "./CreatePostButton";

function ResetCreatePostModalDecorator(Story: ComponentType) {
  useEffect(() => {
    useAppStore.getState().closeCreatePostModal();

    return () => {
      useAppStore.getState().closeCreatePostModal();
    };
  }, []);

  return <Story />;
}

const meta = {
  component: CreatePostButton,
  tags: ["ai-generated"],
  decorators: [ResetCreatePostModalDecorator],
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
    useAppStore.getState().closeCreatePostModal();

    try {
      await userEvent.click(canvas.getByRole("button"));
      await expect(
        useAppStore.getState().createPostModal.isOpen,
      ).toBe(true);
    } finally {
      useAppStore.getState().closeCreatePostModal();
    }
  },
};
