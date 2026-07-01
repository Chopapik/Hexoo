import type { StoreSlice } from "@/lib/store/storeSlice.type";

export type CreatePostModalInitialFocus = "text" | "image" | null;

export interface CreatePostModalState {
  isOpen: boolean;
  initialFocus: CreatePostModalInitialFocus;
}

export interface CreatePostModalSlice {
  createPostModal: CreatePostModalState;
  openCreatePostModal: (initialFocus?: CreatePostModalInitialFocus) => void;
  closeCreatePostModal: () => void;
}

export const createCreatePostModalSlice: StoreSlice<CreatePostModalSlice> = (
  set,
) => ({
  createPostModal: {
    isOpen: false,
    initialFocus: null,
  },

  openCreatePostModal: (initialFocus = null) =>
    set({
      createPostModal: {
        isOpen: true,
        initialFocus,
      },
    }),

  closeCreatePostModal: () =>
    set({
      createPostModal: {
        isOpen: false,
        initialFocus: null,
      },
    }),
});
