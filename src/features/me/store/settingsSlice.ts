import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  showNSFWPosts: boolean;
  showNSFWComments: boolean;
}

const initialState: SettingsState = {
  showNSFWPosts: false,
  showNSFWComments: false,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setNsfwVisibility: (state, action: PayloadAction<boolean>) => {
      state.showNSFWPosts = action.payload;
    },
    setCommentsNsfwVisibility: (state, action: PayloadAction<boolean>) => {
      state.showNSFWComments = action.payload;
    },
    initializeSettings: (state) => {
      if (typeof window !== "undefined") {
        const storedPosts =
          localStorage.getItem("user_settings_nsfw_posts") ??
          localStorage.getItem("user_settings_nsfw");
        const storedComments = localStorage.getItem("user_settings_nsfw_comments");

        if (storedPosts) {
          state.showNSFWPosts = JSON.parse(storedPosts);
        }
        if (storedComments) {
          state.showNSFWComments = JSON.parse(storedComments);
        }
      }
    },
  },
});

export const {
  setNsfwVisibility,
  setCommentsNsfwVisibility,
  initializeSettings,
} = settingsSlice.actions;
export default settingsSlice.reducer;
