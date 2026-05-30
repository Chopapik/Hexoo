import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import DeletePostModal from "./DeletePostModal";

const meta = {
  component: DeletePostModal,
  tags: ["ai-generated"],
  args: {
    isOpen: true,
    onClose: () => {},
    postId: "post-1",
  },
} satisfies Meta<typeof DeletePostModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const OpenMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};
