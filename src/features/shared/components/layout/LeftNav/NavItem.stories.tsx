import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { HomeIcon, SettingsIcon } from "../../icons/NavIcons";
import { NavItem } from "./NavItem";

const meta = {
  component: NavItem,
  tags: ["ai-generated"],
  args: {
    label: "Settings",
    to: "/settings",
    icon: SettingsIcon,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/settings",
      },
    },
  },
} satisfies Meta<typeof NavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveSidebar: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /settings/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};

export const InactiveWithNotification: Story = {
  args: {
    label: "Home",
    to: "/",
    icon: HomeIcon,
    hasNotification: true,
  },
};

export const BottomVariant: Story = {
  args: {
    variant: "bottom",
  },
};
