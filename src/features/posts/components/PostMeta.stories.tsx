import { useEffect, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { SessionData } from "@/features/me/me.type";
import { useAppStore } from "@/lib/store/store";
import { UserRole } from "@/features/users/types/user.type";
import type { PublicPostResponseDto } from "../types/post.dto";
import { PostMeta } from "./PostMeta";

const author = {
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
  text: "A post header with author metadata and options.",
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

const withUser =
  (user: SessionData | null) =>
  (Story: ComponentType) => {
    const setUser = useAppStore((state) => state.setUser);

    useEffect(() => {
      setUser(user);

      return () => setUser(null);
    }, [setUser, user]);

    return <Story />;
  };

const meta = {
  component: PostMeta,
  tags: ["ai-generated"],
  args: {
    post,
  },
} satisfies Meta<typeof PostMeta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  decorators: [withUser(null)],
};

export const AuthorActions: Story = {
  decorators: [withUser(author)],
};

export const AuthorActionsMobile: Story = {
  decorators: [withUser(author)],
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};
