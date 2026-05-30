import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { PublicCommentResponseDto } from "../types/comment.dto";
import { CommentList } from "./CommentList";

const comments = [
  {
    id: "comment-1",
    postId: "post-1",
    userId: "user-2",
    userName: "Mira",
    userAvatarUrl: null,
    text: "This is a visible discussion reply.",
    likesCount: 1,
    commentsCount: 0,
    createdAt: new Date("2024-04-01T10:30:00.000Z"),
    updatedAt: new Date("2024-04-01T10:30:00.000Z"),
    isPending: false,
    isNSFW: false,
    isEdited: false,
    imageMeta: null,
    device: "mobile",
    youtubeUrl: null,
    imageUrl: null,
    isLikedByMe: false,
  },
] satisfies PublicCommentResponseDto[];

const meta = {
  component: CommentList,
  tags: ["ai-generated"],
  args: {
    comments,
    isLoading: false,
  },
} satisfies Meta<typeof CommentList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithComments: Story = {};

export const WithCommentsMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};

export const Empty: Story = {
  args: {
    comments: [],
  },
};

export const Loading: Story = {
  args: {
    comments: [],
    isLoading: true,
  },
};
