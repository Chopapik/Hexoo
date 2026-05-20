import type { StoreSlice } from "@/lib/store/storeSlice.type";

export interface CreatePostModalState {
  isOpen: boolean;
}

export interface CreatePostModalSlice {
  createPostModal: CreatePostModalState;
  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;
}

export const createCreatePostModalSlice: StoreSlice<CreatePostModalSlice> = (
  set,
) => ({
  createPostModal: {
    isOpen: false,
  },

  openCreatePostModal: () =>
    set({
      createPostModal: {
        isOpen: true,
      },
    }),

  closeCreatePostModal: () =>
    set({
      createPostModal: {
        isOpen: false,
      },
    }),
});
