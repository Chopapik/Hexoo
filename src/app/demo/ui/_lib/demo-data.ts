import { QueryClient } from "@tanstack/react-query";
import type {
  ButtonSize,
  ButtonVariant,
} from "@/features/shared/types/button.type";
import type { ValidationMessage as ValidationMessageType } from "@/features/shared/types/validation.type";
import type { SessionData } from "@/features/me/me.type";
import type {
  PublicPostResponseDto,
  ModerationPostResponseDto,
} from "@/features/posts/types/post.dto";
import type {
  PublicUserResponseDto,
  PrivateUserResponseDto,
} from "@/features/users/types/user.dto";
import { UserRole } from "@/features/users/types/user.type";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type {
  Message,
  Status,
} from "@/features/shared/components/ui/TextInput";
import { useAppStore } from "@/lib/store/store";

export const buttonVariants: ButtonVariant[] = [
  "default",
  "glass-card",
  "danger",
  "success",
  "warning",
  "info",
  "secondary",
  "outline",
  "outline-fuchsia",
  "ghost",
  "transparent",
];

export const buttonSizes: ButtonSize[] = ["sm", "md", "lg", "xl", "icon", "iconSm"];

export const buttonModes = [
  "Text",
  "Left icon",
  "Right icon",
  "Both icons",
  "Icon only",
  "Loading",
  "Disabled",
  "URL icon",
] as const;

export const inputStatuses: Status[] = ["Default", "Warning", "Dismiss", "Success"];

export const demoInputMessages: Record<Status, Message[]> = {
  Default: [],
  Warning: [{ type: "Warning", text: "This field needs attention." }],
  Dismiss: [{ type: "Dismiss", text: "An error was detected." }],
  Success: [{ type: "Success", text: "Everything is OK." }],
};

let demoStoreSeeded = false;

export function ensureDemoStore() {
  if (demoStoreSeeded) {
    return;
  }

  demoStoreSeeded = true;

  useAppStore.setState((state) => ({
    ...state,
    auth: {
      ...state.auth,
      user: demoSessionUser,
      ready: true,
    },
    settings: {
      language: state.settings.language,
      languageOverriddenByUser: state.settings.languageOverriddenByUser,
      showNSFWPosts: true,
      showNSFWComments: true,
      postDithering: state.settings.postDithering,
    },
  }));
}

export const selectOptions = [
  { value: "user", label: "User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Administrator" },
];

export const validationSamples: ValidationMessageType[] = [
  { type: "Warning", text: "Warning: Check the data." },
  { type: "Dismiss", text: "Error: This field is required." },
  { type: "Success", text: "Success: Everything looks good." },
];

export const reportReasons = [
  { id: "spam", label: "This is spam" },
  { id: "hate", label: "Hate speech / Violence" },
  { id: "nudity", label: "Nudity / Sexual content" },
  { id: "harassment", label: "Harassment" },
  { id: "other", label: "Other reason" },
];

export const reportSelectedReasonId = "spam";

export const demoSessionUser: SessionData = {
  uid: "demo-user-1",
  email: "demo@hexoo.com",
  name: "Kasia Demo",
  role: UserRole.Moderator,
  avatarUrl: undefined,
};

export const demoUserProfile: PublicUserResponseDto = {
  uid: "profile-1",
  name: "Ola Profile",
  avatarUrl: undefined,
  createdAt: new Date("2024-08-12T10:30:00Z"),
  lastOnline: new Date(),
};

export const demoAdminUser: PrivateUserResponseDto = {
  uid: "admin-1",
  name: "Admin Hexoo",
  email: "admin@hexoo.com",
  role: UserRole.Admin,
  avatarUrl: undefined,
  createdAt: new Date("2024-01-15T09:15:00Z"),
  lastOnline: new Date(),
  isActive: true,
  isBanned: false,
  bannedAt: undefined,
  bannedBy: undefined,
  bannedReason: undefined,
  isRestricted: false,
  restrictedAt: undefined,
  restrictedBy: undefined,
  restrictionReason: undefined,
  lastKnownIp: undefined,
};

export const demoPost: PublicPostResponseDto = {
  id: "post-1",
  userId: "user-2",
  userName: "Ola",
  userAvatarUrl: null,
  text: "Example post with content and a link https://hexoo.app",
  imageUrl: null,
  likesCount: 24,
  isLikedByMe: true,
  commentsCount: 5,
  createdAt: new Date(),
  isNSFW: false,
  isEdited: false,
};

export const demoPostNsfw: PublicPostResponseDto = {
  ...demoPost,
  id: "post-2",
  userId: "user-3",
  userName: "Marek",
  text: "Post marked as NSFW - hidden by default.",
  imageUrl: null,
  isNSFW: true,
  likesCount: 1,
  commentsCount: 0,
};

export const demoModerationPost: ModerationPostResponseDto = {
  ...demoPost,
  id: "post-3",
  moderationStatus: ModerationStatus.Pending,
  flaggedReasons: ["spam", "hate"],
  reportsMeta: [
    {
      uid: "u-001",
      reason: "spam",
      details: "Repeated advertising content.",
      createdAt: new Date(),
    },
    {
      uid: "u-002",
      reason: "hate",
      details: "Hate speech.",
      createdAt: new Date(),
    },
  ],
};

export const demoQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

demoQueryClient.setQueryData(["profile", "ola"], demoUserProfile);
demoQueryClient.setQueryData(["moderator", "queue"], [demoModerationPost]);
demoQueryClient.setQueryData(["admin", "allUsers"], [demoAdminUser]);
demoQueryClient.setQueryData(["posts"], {
  pages: [[demoPost, demoPostNsfw]],
  pageParams: [undefined],
});
demoQueryClient.setQueryData(["posts", "user", "user-2"], {
  pages: [[demoPost]],
  pageParams: [undefined],
});
