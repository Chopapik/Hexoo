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

export const DesktopWidth: Story = {
  render: (args) => (
    <div className="w-[786px]">
      <CreatePostButton {...args} />
    </div>
  ),
};

export const NarrowMobileWidth: Story = {
  render: (args) => (
    <div className="w-[357px]">
      <CreatePostButton {...args} />
    </div>
  ),
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};

export const CustomText: Story = {
  args: {
    text: "Create",
    showIcon: false,
    className: "max-w-sm",
  },
};

export const ActionsOpenModal: Story = {
  play: async ({ canvas, userEvent }) => {
    const buttons = canvas.getAllByRole("button");

    for (const button of buttons) {
      useAppStore.getState().closeCreatePostModal();
      await userEvent.click(button);
      await expect(
        useAppStore.getState().createPostModal.isOpen,
      ).toBe(true);
      useAppStore.getState().closeCreatePostModal();
    }
  },
};
