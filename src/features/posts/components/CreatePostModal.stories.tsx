import { useEffect, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";

import type { SessionData } from "@/features/me/me.type";
import { useAppStore } from "@/lib/store/store";
import { UserRole } from "@/features/users/types/user.type";
import CreatePostModal from "./CreatePostModal";

const user = {
  uid: "user-1",
  email: "ada@example.com",
  name: "Ada Hex",
  role: UserRole.User,
} satisfies SessionData;

const withUser =
  (value: SessionData | null) =>
  (Story: ComponentType) => {
    const setUser = useAppStore((state) => state.setUser);

    useEffect(() => {
      setUser(value);

      return () => setUser(null);
    }, [setUser, value]);

    return <Story />;
  };

const meta = {
  component: CreatePostModal,
  tags: ["ai-generated"],
  args: {
    isOpen: true,
    onClose: () => {},
  },
} satisfies Meta<typeof CreatePostModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  decorators: [withUser(user)],
};

export const LoggedInMobile: Story = {
  decorators: [withUser(user)],
  globals: {
    viewport: {
      value: "mobile1",
      isRotated: false,
    },
  },
};

export const Guest: Story = {
  decorators: [withUser(null)],
};

export const ValidationError: Story = {
  decorators: [withUser(user)],
  play: async ({ canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const buttons = await body.findAllByRole("button");
    const submitButton = buttons[buttons.length - 1];

    await userEvent.click(submitButton);

    const error = await body.findByText(
      /post cannot be empty|post nie może być pusty/i,
    );

    await waitFor(() => expect(error).toBeVisible());
  },
};
