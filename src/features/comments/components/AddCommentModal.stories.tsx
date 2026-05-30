import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import type { PublicPostResponseDto } from "@/features/posts/types/post.dto";
import AddCommentModal from "./AddCommentModal";

const post = {
  id: "post-1",
  userId: "author-1",
  userName: "Ada Hex",
  userAvatarUrl: null,
  text: "A short post used as realistic context for writing a comment.",
  likesCount: 12,
  commentsCount: 2,
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
} satisfies PublicPostResponseDto;

const meta = {
  component: AddCommentModal,
  tags: ["ai-generated"],
  args: {
    post,
    isOpen: true,
    onClose: () => {},
  },
} satisfies Meta<typeof AddCommentModal>;

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

export const ValidationError: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await body.findByRole("button", { name: /add comment|dodaj komentarz/i }),
    );

    await expect(
      await body.findByText(/comment cannot be empty|komentarz nie może być pusty/i),
    ).toBeVisible();
  },
};
