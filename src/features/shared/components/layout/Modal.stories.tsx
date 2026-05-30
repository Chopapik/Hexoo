import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";

import Button from "../ui/Button";
import Modal from "./Modal";

const meta = {
  component: Modal,
  tags: ["ai-generated"],
  args: {
    isOpen: true,
    onClose: () => {},
    title: "Edit profile",
    children: <div className="p-4">Modal content rendered in a portal.</div>,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const content = await body.findByText(/modal content rendered in a portal/i);

    await waitFor(() => expect(content).toBeVisible());
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

export const WithFooter: Story = {
  args: {
    footer: (
      <div className="flex justify-end gap-2">
        <Button text="Cancel" variant="secondary" size="sm" />
        <Button text="Save" size="sm" />
      </div>
    ),
  },
};

export const WithFooterMobile: Story = {
  args: WithFooter.args,
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};
