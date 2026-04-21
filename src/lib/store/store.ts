import { create } from "zustand";
import type { SessionData } from "@/features/me/me.type";

export interface AuthState {
  user: SessionData | null;
  ready: boolean;
}

export interface SettingsState {
  showNSFWPosts: boolean;
  showNSFWComments: boolean;
}

export interface CreatePostModalState {
  isOpen: boolean;
}

export interface PresenceStateSlice {
  /** UIDs currently tracked on the global Realtime Presence channel. */
  onlineUids: Set<string>;
}

interface AppState {
  auth: AuthState;
  settings: SettingsState;
  createPostModal: CreatePostModalState;
  presence: PresenceStateSlice;

  setUser: (user: SessionData | null) => void;
  clearUser: () => void;
  setReady: (ready: boolean) => void;

  setPresenceOnlineUids: (uids: Set<string>) => void;

  setNsfwVisibility: (value: boolean) => void;
  setCommentsNsfwVisibility: (value: boolean) => void;
  initializeSettings: () => void;

  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;
}

const readBootstrapUser = (): SessionData | null => {
  if (typeof window === "undefined") return null;
  return window.__HEXOO_BOOTSTRAP__?.sessionUser ?? null;
};

const readBoolean = (raw: string | null): boolean | null => {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as boolean;
  } catch {
    return null;
  }
};

export const useAppStore = create<AppState>((set) => ({
  auth: {
    user: readBootstrapUser(),
    ready: true,
  },
  settings: {
    showNSFWPosts: false,
    showNSFWComments: false,
  },
  createPostModal: {
    isOpen: false,
  },
  presence: {
    onlineUids: new Set(),
  },

  setUser: (user) => set((s) => ({ auth: { ...s.auth, user } })),
  clearUser: () => set((s) => ({ auth: { ...s.auth, user: null } })),
  setReady: (ready) => set((s) => ({ auth: { ...s.auth, ready } })),

  setPresenceOnlineUids: (onlineUids) =>
    set((s) => ({
      presence: { ...s.presence, onlineUids: new Set(onlineUids) },
    })),

  setNsfwVisibility: (value) =>
    set((s) => ({ settings: { ...s.settings, showNSFWPosts: value } })),
  setCommentsNsfwVisibility: (value) =>
    set((s) => ({ settings: { ...s.settings, showNSFWComments: value } })),
  initializeSettings: () => {
    if (typeof window === "undefined") return;
    const storedPosts = readBoolean(
      localStorage.getItem("user_settings_nsfw_posts") ??
        localStorage.getItem("user_settings_nsfw"),
    );
    const storedComments = readBoolean(
      localStorage.getItem("user_settings_nsfw_comments"),
    );
    set((s) => ({
      settings: {
        showNSFWPosts: storedPosts ?? s.settings.showNSFWPosts,
        showNSFWComments: storedComments ?? s.settings.showNSFWComments,
      },
    }));
  },

  openCreatePostModal: () => set({ createPostModal: { isOpen: true } }),
  closeCreatePostModal: () => set({ createPostModal: { isOpen: false } }),
}));
