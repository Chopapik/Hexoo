import { createSlice } from "@reduxjs/toolkit";

type CreatePostModalState = {
  isOpen: boolean;
};

const initialState: CreatePostModalState = {
  isOpen: false,
};

const createPostModalSlice = createSlice({
  name: "createPostModal",
  initialState,
  reducers: {
    openCreatePostModal(state) {
      state.isOpen = true;
    },
    closeCreatePostModal(state) {
      state.isOpen = false;
    },
  },
});

export const { openCreatePostModal, closeCreatePostModal } =
  createPostModalSlice.actions;

export default createPostModalSlice.reducer;

