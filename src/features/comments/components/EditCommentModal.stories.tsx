import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import type { PublicCommentResponseDto } from "../types/comment.dto";
import EditCommentModal from "./EditCommentModal";

const comment = {
  id: "comment-1",
  postId: "post-1",
  userId: "user-1",
  userName: "Ada Hex",
  userAvatarUrl: null,
  text: "This comment is ready to edit in the modal.",
  likesCount: 1,
  commentsCount: 0,
  createdAt: new Date("2024-04-01T10:30:00.000Z"),
  updatedAt: new Date("2024-04-01T10:30:00.000Z"),
  isPending: false,
  isNSFW: false,
  isEdited: false,
  imageMeta: null,
  device: "desktop",
  youtubeUrl: null,
  imageUrl: null,
  isLikedByMe: false,
} satisfies PublicCommentResponseDto;

const meta = {
  component: EditCommentModal,
  tags: ["ai-generated"],
  args: {
    isOpen: true,
    onClose: () => {},
    comment,
  },
} satisfies Meta<typeof EditCommentModal>;

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

export const EmptyTextDisabled: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const textarea = await body.findByPlaceholderText(
      /edit comment|edytuj komentarz/i,
    );

    await userEvent.clear(textarea);

    const buttons = body.getAllByRole("button");
    const submitButton = buttons[buttons.length - 1];

    await expect(submitButton).toBeDisabled();
  },
};
