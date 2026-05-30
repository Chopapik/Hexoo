import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";

import ReportPostModal from "./ReportPostModal";

const meta = {
  component: ReportPostModal,
  tags: ["ai-generated"],
  args: {
    postId: "post-1",
    onClose: () => {},
  },
} satisfies Meta<typeof ReportPostModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const OpenMobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};

export const OtherReasonDetails: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await body.findByText(/other reason|inny powód/i));

    const details = await body.findByPlaceholderText(
      /describe the problem|opisz problem/i,
    );

    await waitFor(() => expect(details).toBeVisible());
  },
};
