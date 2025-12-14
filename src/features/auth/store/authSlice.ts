import { SessionData } from "@/features/me/me.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  user: SessionData | null;
  ready: boolean;
};

const initialState: AuthState = { user: null, ready: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SessionData | null>) {
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
