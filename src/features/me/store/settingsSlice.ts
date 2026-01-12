import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  showNSFW: boolean;
}

const initialState: SettingsState = {
  showNSFW: false,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setNsfwVisibility: (state, action: PayloadAction<boolean>) => {
      state.showNSFW = action.payload;
    },
    initializeSettings: (state) => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user_settings_nsfw");
        if (stored) {
          state.showNSFW = JSON.parse(stored);
        }
      }
    },
  },
});

export const { setNsfwVisibility, initializeSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
