import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";

import AlertModal from "./AlertModal";

const meta = {
  component: AlertModal,
  tags: ["ai-generated"],
  args: {
    isOpen: true,
    onClose: () => {},
    title: "Account updated",
    message: "Your profile changes were saved successfully.",
  },
} satisfies Meta<typeof AlertModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialogText = await body.findByText(/profile changes/i);

    await waitFor(() => expect(dialogText).toBeVisible());
  },
};

export const OpenMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};
