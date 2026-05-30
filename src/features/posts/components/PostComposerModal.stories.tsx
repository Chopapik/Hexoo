import { useRef, type ComponentProps } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import PostComposerModal from "./PostComposerModal";

type PostComposerModalStoryArgs = Omit<
  ComponentProps<typeof PostComposerModal>,
  "fileInputRef" | "textRegistration"
>;

const overLimitText = "x".repeat(2055);

const createTextRegistration = (defaultValue = "") =>
  ({
    name: "text",
    onBlur: async () => {},
    onChange: async () => {},
    ref: () => {},
    defaultValue,
  }) as UseFormRegisterReturn<"text"> & { defaultValue?: string };

function PostComposerModalStory(args: PostComposerModalStoryArgs) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <PostComposerModal
      {...args}
      fileInputRef={fileInputRef}
      textRegistration={createTextRegistration(args.textValue)}
    />
  );
}

const meta = {
  component: PostComposerModalStory,
  tags: ["ai-generated"],
  args: {
    isOpen: true,
    title: "New post",
    placeholder: "What are you building?",
    onClose: () => {},
    onSubmit: () => {},
    onImageSelect: () => {},
    onImageRemove: () => {},
    onFileChange: () => {},
    onTextKeyDown: () => {},
    textValue: "",
    imagePreview: null,
    displayError: null,
    isPending: false,
    isOverLimit: false,
    isSubmitDisabled: true,
    onYouTubeConfirm: async () => true,
    onYouTubeDraftChange: () => {},
    onYouTubeRemove: () => {},
    youtubeUrl: null,
    youtubeUrlError: null,
  },
} satisfies Meta<typeof PostComposerModal>;

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

export const WithImage: Story = {
  args: {
    textValue: "A short caption with a preview.",
    imagePreview: "/images/face01.png",
    isSubmitDisabled: false,
  },
};

export const WithYouTube: Story = {
  args: {
    textValue: "Sharing a useful talk.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isSubmitDisabled: false,
  },
};

export const OverLimit: Story = {
  args: {
    textValue: overLimitText,
    displayError: "Post cannot be longer than 2048 characters.",
    isOverLimit: true,
    isSubmitDisabled: true,
  },
};
