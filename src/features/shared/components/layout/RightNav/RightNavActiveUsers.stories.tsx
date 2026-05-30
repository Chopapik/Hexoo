import { useEffect, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { useAppStore } from "@/lib/store/store";
import { UserRole } from "@/features/users/types/user.type";
import { RightNavActiveUsers } from "./RightNavActiveUsers";

const currentUser = {
  uid: "user-1",
  email: "ada@example.com",
  name: "Ada Hex",
  role: UserRole.User,
};

const withPresence =
  (uids: string[]) =>
  (Story: ComponentType) => {
    const setUser = useAppStore((state) => state.setUser);
    const setPresenceOnlineUids = useAppStore(
      (state) => state.setPresenceOnlineUids,
    );

    useEffect(() => {
      setUser(currentUser);
      setPresenceOnlineUids(new Set(uids));

      return () => {
        setUser(null);
        setPresenceOnlineUids(new Set());
      };
    }, [setPresenceOnlineUids, setUser, uids]);

    return <Story />;
  };

const meta = {
  component: RightNavActiveUsers,
  tags: ["ai-generated"],
} satisfies Meta<typeof RightNavActiveUsers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: [withPresence(["user-1"])],
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/no one except you/i)).toBeVisible();
  },
};

export const WithUsers: Story = {
  decorators: [withPresence(["user-1", "user-2", "user-3"])],
  play: async ({ canvas }) => {
    await expect(await canvas.findByTitle("Mira")).toBeVisible();
  },
};
