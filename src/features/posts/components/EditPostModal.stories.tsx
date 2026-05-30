import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { PublicPostResponseDto } from "../types/post.dto";
import EditPostModal from "./EditPostModal";

const post = {
  id: "post-1",
  userId: "user-1",
  userName: "Ada Hex",
  userAvatarUrl: null,
  text: "This is the existing post text loaded into the edit composer.",
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
  component: EditPostModal,
  tags: ["ai-generated"],
  args: {
    isOpen: true,
    onClose: () => {},
    post,
  },
} satisfies Meta<typeof EditPostModal>;

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

export const WithImage: Story = {
  args: {
    post: {
      ...post,
      id: "post-with-image",
      imageUrl: "/images/face01.png",
    },
  },
};
