import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import TextInput from "./TextInput";

const meta = {
  component: TextInput,
  tags: ["ai-generated"],
  args: {
    label: "Display name",
    name: "displayName",
    placeholder: "Ada Hex",
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSuccessMessage: Story = {
  args: {
    defaultValue: "Ada Hex",
    messages: [{ type: "Success", text: "Name is available" }],
  },
};

export const PasswordToggle: Story = {
  args: {
    label: "Password",
    name: "password",
    type: "password",
    placeholder: "Password",
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText("Password");

    await expect(input).toHaveAttribute("type", "password");
    await userEvent.click(
      canvas.getByRole("button", { name: /show password/i }),
    );
    await expect(input).toHaveAttribute("type", "text");
  },
};
