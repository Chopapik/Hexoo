import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { RightNavOverlay, RightNavSidebar } from "./RightNav";

const meta = {
  component: RightNavSidebar,
  tags: ["ai-generated"],
} satisfies Meta<typeof RightNavSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {};

export const OverlayOpenMobile: Story = {
  render: () => <RightNavOverlay open onClose={() => {}} />,
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await expect(
      await body.findByRole("button", { name: /close sidebar/i }),
    ).toBeVisible();
  },
};
