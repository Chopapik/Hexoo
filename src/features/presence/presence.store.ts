import type { StoreSlice } from "@/lib/store/storeSlice.type";

export interface PresenceStateSlice {
  /** UIDs currently tracked on the global Realtime Presence channel. */
  onlineUids: Set<string>;
}

export interface PresenceSlice {
  presence: PresenceStateSlice;
  setPresenceOnlineUids: (uids: Set<string>) => void;
}

export const createPresenceSlice: StoreSlice<PresenceSlice> = (set) => ({
  presence: {
    onlineUids: new Set(),
  },

  setPresenceOnlineUids: (onlineUids) =>
    set((state) => ({
      presence: {
        ...state.presence,
        onlineUids: new Set(onlineUids),
      },
    })),
});
