import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ValidationMessage from "./ValidationMessage";

const meta = {
  component: ValidationMessage,
  tags: ["ai-generated"],
  args: {
    message: {
      type: "Success",
      text: "Username is available.",
    },
  },
} satisfies Meta<typeof ValidationMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Warning: Story = {
  args: {
    message: {
      type: "Warning",
      text: "Use at least 8 characters.",
    },
  },
};

export const Dismiss: Story = {
  args: {
    message: {
      type: "Dismiss",
      text: "This username is already taken.",
    },
  },
};
