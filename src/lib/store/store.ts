import { create } from "zustand";
import type { SessionData } from "@/features/me/me.type";
import {
  AUTH_CLEAR_USER,
  AUTH_SET_READY,
  AUTH_SET_USER,
  type AuthAction,
  type AuthState,
} from "@/features/auth/store/authSlice";
import {
  SETTINGS_INITIALIZE,
  SETTINGS_SET_COMMENTS_NSFW_VISIBILITY,
  SETTINGS_SET_NSFW_VISIBILITY,
  type SettingsAction,
  type SettingsState,
} from "@/features/me/store/settingsSlice";
import {
  CREATE_POST_MODAL_CLOSE,
  CREATE_POST_MODAL_OPEN,
  type CreatePostModalAction,
  type CreatePostModalState,
} from "@/features/posts/store/createPostModalSlice";

type AppAction = AuthAction | SettingsAction | CreatePostModalAction;

export type RootState = {
  auth: AuthState;
  settings: SettingsState;
  createPostModal: CreatePostModalState;
};

export type AppDispatch = (action: AppAction) => void;

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

const initialState: RootState = {
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
};

export const useAppStore = create<RootState & { dispatch: AppDispatch }>(
  (set) => ({
    ...initialState,
    dispatch: (action) => {
      set((state) => {
        switch (action.type) {
          case AUTH_SET_USER:
            return {
              ...state,
              auth: { ...state.auth, user: action.payload },
            };
          case AUTH_CLEAR_USER:
            return {
              ...state,
              auth: { ...state.auth, user: null },
            };
          case AUTH_SET_READY:
            return {
              ...state,
              auth: { ...state.auth, ready: action.payload },
            };
          case SETTINGS_SET_NSFW_VISIBILITY:
            return {
              ...state,
              settings: { ...state.settings, showNSFWPosts: action.payload },
            };
          case SETTINGS_SET_COMMENTS_NSFW_VISIBILITY:
            return {
              ...state,
              settings: { ...state.settings, showNSFWComments: action.payload },
            };
          case SETTINGS_INITIALIZE: {
            if (typeof window === "undefined") return state;
            const storedPosts = readBoolean(
              localStorage.getItem("user_settings_nsfw_posts") ??
                localStorage.getItem("user_settings_nsfw"),
            );
            const storedComments = readBoolean(
              localStorage.getItem("user_settings_nsfw_comments"),
            );

            return {
              ...state,
              settings: {
                showNSFWPosts: storedPosts ?? state.settings.showNSFWPosts,
                showNSFWComments:
                  storedComments ?? state.settings.showNSFWComments,
              },
            };
          }
          case CREATE_POST_MODAL_OPEN:
            return {
              ...state,
              createPostModal: { isOpen: true },
            };
          case CREATE_POST_MODAL_CLOSE:
            return {
              ...state,
              createPostModal: { isOpen: false },
            };
          default:
            return state;
        }
      });
    },
  }),
);
