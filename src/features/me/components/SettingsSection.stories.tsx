import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/features/shared/components/ui/Button";
import SettingsSection from "./SettingsSection";

const meta = {
  component: SettingsSection,
  tags: ["ai-generated"],
  args: {
    title: "Account",
    children: (
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-foreground-primary-default">Email address</p>
          <p className="text-sm text-foreground-secondary-default">ada@example.com</p>
        </div>
        <Button text="Edit" size="sm" variant="secondary" />
      </div>
    ),
  },
} satisfies Meta<typeof SettingsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};
