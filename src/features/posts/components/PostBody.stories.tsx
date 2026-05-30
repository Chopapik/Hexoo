import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { PublicPostResponseDto } from "../types/post.dto";
import { PostBody } from "./PostBody";

const post = {
  id: "post-1",
  userId: "user-1",
  userName: "Ada Hex",
  userAvatarUrl: null,
  text: "This post body shows rich multiline text.\nIt should wrap cleanly inside a card.",
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
  component: PostBody,
  tags: ["ai-generated"],
  args: {
    post,
  },
} satisfies Meta<typeof PostBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const EditedNsfw: Story = {
  args: {
    post: {
      ...post,
      id: "post-edited-nsfw",
      isEdited: true,
      isNSFW: true,
    },
    isNSFW: true,
  },
};

export const Ascii: Story = {
  args: {
    post: {
      ...post,
      id: "post-ascii",
      text: " /\\_/\\\\\n( o.o )\n > ^ <",
    },
  },
};

export const TextMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};
