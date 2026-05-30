import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import Select from "./Select";

const options = [
  { value: "member", label: "Member" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
];

const meta = {
  component: Select,
  tags: ["ai-generated"],
  args: {
    label: "Role",
    name: "role",
    options,
    placeholder: "Select a role",
    onChange: () => {},
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    value: "moderator",
  },
};

export const ChangesSelection: Story = {
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole("combobox") as HTMLSelectElement;

    await userEvent.selectOptions(select, "admin");
    await expect(select.value).toBe("admin");
  },
};
