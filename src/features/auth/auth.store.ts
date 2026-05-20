import type { SessionData } from "@/features/me/me.type";
import type { StoreSlice } from "@/lib/store/storeSlice.type";

export interface AuthState {
  user: SessionData | null;
  ready: boolean;
}

export interface AuthSlice {
  auth: AuthState;
  setUser: (user: SessionData | null) => void;
  clearUser: () => void;
  setReady: (ready: boolean) => void;
}

const readBootstrapUser = (): SessionData | null => {
  if (typeof window === "undefined") return null;

  return window.__HEXOO_BOOTSTRAP__?.sessionUser ?? null;
};

export const createAuthSlice: StoreSlice<AuthSlice> = (set) => ({
  auth: {
    user: readBootstrapUser(),
    ready: true,
  },

  setUser: (user) => set((state) => ({ auth: { ...state.auth, user } })),

  clearUser: () =>
    set((state) => ({ auth: { ...state.auth, user: null } })),

  setReady: (ready) =>
    set((state) => ({ auth: { ...state.auth, ready } })),
});
