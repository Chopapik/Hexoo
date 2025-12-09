import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserSessionData } from "@/features/users/types/user.type";

type AuthState = {
  user: UserSessionData | null;
  ready: boolean;
};

const initialState: AuthState = { user: null, ready: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserSessionData | null>) {
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
