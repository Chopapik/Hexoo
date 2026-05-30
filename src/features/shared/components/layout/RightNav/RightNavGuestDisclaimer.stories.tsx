import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RightNavGuestDisclaimer } from "./RightNavGuestDisclaimer";

const meta = {
  component: RightNavGuestDisclaimer,
  tags: ["ai-generated"],
} satisfies Meta<typeof RightNavGuestDisclaimer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GuestRail: Story = {};
