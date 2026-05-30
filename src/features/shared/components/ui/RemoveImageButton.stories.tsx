import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import RemoveImageButton from "./RemoveImageButton";

const meta = {
  component: RemoveImageButton,
  tags: ["ai-generated"],
  args: {
    onClick: () => {},
    position: "top-right",
    alwaysVisible: true,
  },
  render: (args) => (
    <div className="relative size-28 overflow-hidden rounded-xl border border-primary-neutral-stroke-default bg-secondary-neutral-background-default">
      <div className="flex h-full items-center justify-center text-xs text-text-neutral">
        Preview
      </div>
      <RemoveImageButton {...args} />
    </div>
  ),
} satisfies Meta<typeof RemoveImageButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByTitle(/remove image/i)).toBeVisible();
  },
};

export const Red: Story = {
  args: {
    variant: "red",
  },
};
