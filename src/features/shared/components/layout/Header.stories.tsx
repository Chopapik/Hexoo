import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { SessionData } from "@/features/me/me.type";
import { UserRole } from "@/features/users/types/user.type";
import { Header } from "./Header";

const user = {
  uid: "user-1",
  email: "ada@example.com",
  name: "Ada Hex",
  role: UserRole.User,
  avatarUrl: undefined,
} satisfies SessionData;

const meta = {
  component: Header,
  tags: ["ai-generated"],
  args: {
    user,
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {};

export const LoggedInMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};

export const LoggedOut: Story = {
  args: {
    user: null,
  },
};

export const LoggedOutMobile: Story = {
  args: LoggedOut.args,
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};
