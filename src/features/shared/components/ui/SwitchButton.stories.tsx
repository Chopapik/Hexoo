import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import SwitchButton from "./SwitchButton";

const meta = {
  component: SwitchButton,
  tags: ["ai-generated"],
  args: {
    checked: false,
    onChange: () => {},
    switchLabel: "Notifications",
  },
} satisfies Meta<typeof SwitchButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = {
  args: {
    checked: true,
  },
};

export const Toggleable: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);

    return <SwitchButton {...args} checked={checked} onChange={setChecked} />;
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole("switch", { name: /notifications/i });

    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  },
};
