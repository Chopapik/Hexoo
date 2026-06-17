import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import type { SessionData } from "@/features/me/me.type";
import { createUserDecorator } from "@/test/storybookStoreDecorators";
import { UserRole } from "@/features/users/types/user.type";
import type { PublicPostResponseDto } from "../types/post.dto";
import PostOptions from "./PostOptions";

const author = {
  uid: "user-1",
  email: "ada@example.com",
  name: "Ada Hex",
  role: UserRole.User,
} satisfies SessionData;

const reader = {
  uid: "user-2",
  email: "mira@example.com",
  name: "Mira",
  role: UserRole.User,
} satisfies SessionData;

const moderator = {
  ...reader,
  role: UserRole.Moderator,
} satisfies SessionData;

const post = {
  id: "post-1",
  userId: "user-1",
  userName: "Ada Hex",
  userAvatarUrl: null,
  text: "A post with an options menu.",
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
  component: PostOptions,
  tags: ["ai-generated"],
  args: {
    postId: post.id,
    authorId: post.userId,
    post,
  },
} satisfies Meta<typeof PostOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AuthorMenu: Story = {
  decorators: [createUserDecorator(author)],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button"));

    await expect(await canvas.findByText(/edit|edytuj/i)).toBeInTheDocument();
    await expect(await canvas.findByText(/delete|usuń/i)).toBeInTheDocument();
  },
};

export const ReaderMenu: Story = {
  decorators: [createUserDecorator(reader)],
};

export const ModeratorMenu: Story = {
  decorators: [createUserDecorator(moderator)],
};

export const AuthorMenuMobile: Story = {
  decorators: [createUserDecorator(author)],
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};
