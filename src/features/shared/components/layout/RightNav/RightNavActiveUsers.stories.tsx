import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { createPresenceDecorator } from "@/test/storybookStoreDecorators";
import { UserRole } from "@/features/users/types/user.type";
import { RightNavActiveUsers } from "./RightNavActiveUsers";

const currentUser = {
  uid: "user-1",
  email: "ada@example.com",
  name: "Ada Hex",
  role: UserRole.User,
};

const meta = {
  component: RightNavActiveUsers,
  tags: ["ai-generated"],
} satisfies Meta<typeof RightNavActiveUsers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: [createPresenceDecorator({ currentUser, uids: ["user-1"] })],
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/no one except you/i)).toBeVisible();
  },
};

export const WithUsers: Story = {
  decorators: [
    createPresenceDecorator({
      currentUser,
      uids: ["user-1", "user-2", "user-3"],
    }),
  ],
  play: async ({ canvas }) => {
    await expect(await canvas.findByTitle("Mira")).toBeVisible();
  },
};
