import type { StateCreator } from "zustand";

import type { AppStore } from "./store";

export type StoreSlice<TSlice> = StateCreator<AppStore, [], [], TSlice>;
