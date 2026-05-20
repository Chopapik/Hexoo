import { create } from "zustand";

import {
  createAuthSlice,
  type AuthSlice,
} from "@/features/auth/auth.store";
import {
  createCreatePostModalSlice,
  type CreatePostModalSlice,
} from "@/features/posts/createPostModal.store";
import {
  createPresenceSlice,
  type PresenceSlice,
} from "@/features/presence/presence.store";
import {
  createSettingsSlice,
  type SettingsSlice,
} from "@/features/shared/settings/settings.store";

export type AppStore = AuthSlice &
  SettingsSlice &
  CreatePostModalSlice &
  PresenceSlice;

export const useAppStore = create<AppStore>()((...args) => ({
  ...createAuthSlice(...args),
  ...createSettingsSlice(...args),
  ...createCreatePostModalSlice(...args),
  ...createPresenceSlice(...args),
}));
