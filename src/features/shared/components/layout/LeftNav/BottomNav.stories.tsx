import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { SessionData } from "@/features/me/me.type";
import { UserRole } from "@/features/users/types/user.type";
import { BottomNav } from "./BottomNav";

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
  component: BottomNav,
  tags: ["ai-generated"],
  args: {
    user,
    onOpenRight: () => {},
  },
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/settings",
      },
    },
  },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserMobile: Story = {};

export const AdminMobile: Story = {
  args: {
    user: admin,
  },
};
