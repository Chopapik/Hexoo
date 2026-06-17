import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { SessionData } from "@/features/me/me.type";
import { createUserDecorator } from "@/test/storybookStoreDecorators";
import { UserRole } from "@/features/users/types/user.type";
import type { PublicPostResponseDto } from "../types/post.dto";
import { PostFooter } from "./PostFooter";

const user = {
  uid: "user-1",
  email: "ada@example.com",
  name: "Ada Hex",
  role: UserRole.User,
} satisfies SessionData;

const post = {
  id: "post-1",
  userId: "user-1",
  userName: "Ada Hex",
  userAvatarUrl: null,
  text: "Footer source post.",
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
  component: PostFooter,
  tags: ["ai-generated"],
  args: {
    post,
    onCommentClick: () => {},
  },
  decorators: [createUserDecorator(null)],
} satisfies Meta<typeof PostFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

export const LikedByMe: Story = {
  decorators: [createUserDecorator(user)],
  args: {
    post: {
      ...post,
      isLikedByMe: true,
      likesCount: 13,
    },
  },
};
