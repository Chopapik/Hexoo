import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ModalFooter from "./ModalFooter";

const meta = {
  component: ModalFooter,
  tags: ["ai-generated"],
  args: {
    confirmText: "Save changes",
    onCancel: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof ModalFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Danger: Story = {
  args: {
    confirmText: "Delete account",
    confirmVariant: "danger",
  },
};

export const Pending: Story = {
  args: {
    confirmText: "Saving",
    isPending: true,
  },
};
