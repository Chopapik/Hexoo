import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../types/auth.types";

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
};

const initialState: AuthState = { user: null, ready: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
    setReady(state, action: PayloadAction<boolean>) {
      state.ready = action.payload;
    },
  },
});

export const { setUser, clearUser, setReady } = authSlice.actions;
export default authSlice.reducer;
