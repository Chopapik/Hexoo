import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import DeleteCommentModal from "./DeleteCommentModal";

const meta = {
  component: DeleteCommentModal,
  tags: ["ai-generated"],
  args: {
    isOpen: true,
    onClose: () => {},
    commentId: "comment-1",
    postId: "post-1",
  },
} satisfies Meta<typeof DeleteCommentModal>;

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
