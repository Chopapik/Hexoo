import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/store/authSlice";
import settingsReducer from "@/features/me/store/settingsSlice";
import createPostModalReducer from "@/features/posts/store/createPostModalSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    createPostModal: createPostModalReducer,
    // redux slices here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
