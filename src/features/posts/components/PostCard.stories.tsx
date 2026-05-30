import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import type { PublicPostResponseDto } from "../types/post.dto";
import { PostCard } from "./PostCard";

const post = {
  id: "post-1",
  userId: "user-1",
  userName: "Ada Hex",
  userAvatarUrl: null,
  text: "A short post used to exercise the composed post card.",
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
  component: PostCard,
  tags: ["ai-generated"],
  args: {
    post,
  },
} satisfies Meta<typeof PostCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DefaultMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};

export const Edited: Story = {
  args: {
    post: {
      ...post,
      id: "post-edited",
      text: "This post shows the edited badge.",
      isEdited: true,
    },
  },
};

export const OpensComments: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByText(/short post used to exercise the composed post card/i),
    );

    const body = within(canvasElement.ownerDocument.body);

    await expect(
      await body.findByText(/this comment arrived through msw/i),
    ).toBeVisible();
  },
};

export const OpensCommentsMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByText(/short post used to exercise the composed post card/i),
    );

    const body = within(canvasElement.ownerDocument.body);
    const showComments = await body.findByRole("button", {
      name: /show comments/i,
    });

    await userEvent.click(showComments);
    const comments = await body.findAllByText(
      /this comment arrived through msw/i,
    );

    await expect(comments.length).toBeGreaterThan(0);
  },
};
