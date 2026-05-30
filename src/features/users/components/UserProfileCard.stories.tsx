import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import type { UserProfileResponseDto } from "../types/user.dto";
import { UserProfileCard } from "./UserProfileCard";

const initialUser = {
  uid: "user-1",
  name: "Ada Hex",
  avatarUrl: null,
  createdAt: new Date("2023-10-12T08:00:00.000Z"),
  lastOnline: new Date("2024-04-01T11:45:00.000Z"),
} satisfies UserProfileResponseDto;

const meta = {
  component: UserProfileCard,
  tags: ["ai-generated"],
  args: {
    username: "user-1",
    enableEditProfile: false,
    initialUser,
  },
} satisfies Meta<typeof UserProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FromInitialData: Story = {};

export const FromInitialDataMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};

export const FromApi: Story = {
  args: {
    initialUser: undefined,
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Ada Hex")).toBeVisible();
  },
};

export const FromApiMobile: Story = {
  args: FromApi.args,
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
  play: FromApi.play,
};
