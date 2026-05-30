import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { SessionData } from "@/features/me/me.type";
import { UserRole } from "@/features/users/types/user.type";
import { LeftNav } from "./LeftNav";

const user = {
  uid: "user-1",
  email: "ada@example.com",
  name: "Ada Hex",
  role: UserRole.User,
} satisfies SessionData;

const admin = {
  ...user,
  role: UserRole.Admin,
} satisfies SessionData;

const meta = {
  component: LeftNav,
  tags: ["ai-generated"],
  args: {
    user,
    onOpenRight: () => {},
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/settings",
      },
    },
  },
} satisfies Meta<typeof LeftNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserNavigation: Story = {};

export const AdminNavigation: Story = {
  args: {
    user: admin,
  },
};

export const LoggedOutRail: Story = {
  args: {
    user: null,
  },
};
