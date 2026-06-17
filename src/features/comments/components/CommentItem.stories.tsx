import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import type { SessionData } from "@/features/me/me.type";
import { createUserDecorator } from "@/test/storybookStoreDecorators";
import { UserRole } from "@/features/users/types/user.type";
import type { PublicCommentResponseDto } from "../types/comment.dto";
import { CommentItem } from "./CommentItem";

const author = {
  uid: "user-1",
  email: "ada@example.com",
  name: "Ada Hex",
  role: UserRole.User,
} satisfies SessionData;

const moderator = {
  ...author,
  role: UserRole.Moderator,
} satisfies SessionData;

const comment = {
  id: "comment-1",
  postId: "post-1",
  userId: "user-1",
  userName: "Ada Hex",
  userAvatarUrl: null,
  text: "This is a reusable comment row with actions.",
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
  component: CommentItem,
  tags: ["ai-generated"],
  args: {
    comment,
  },
} satisfies Meta<typeof CommentItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {
  decorators: [createUserDecorator(null)],
};

export const AuthorMenu: Story = {
  decorators: [createUserDecorator(author)],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button"));
    await expect(await canvas.findByText("Edit")).toBeInTheDocument();
  },
};

export const ModeratorProminent: Story = {
  decorators: [createUserDecorator(moderator)],
  args: {
    comment: {
      ...comment,
      id: "comment-2",
      userId: "user-2",
      userName: "Mira",
      text: "A prominent moderation queue comment layout.",
    },
    moderationProminent: true,
  },
};
