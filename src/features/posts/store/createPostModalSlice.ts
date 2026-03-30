export type CreatePostModalState = {
  isOpen: boolean;
};

export const CREATE_POST_MODAL_OPEN = "createPostModal/openCreatePostModal" as const;
export const CREATE_POST_MODAL_CLOSE =
  "createPostModal/closeCreatePostModal" as const;

export type OpenCreatePostModalAction = {
  type: typeof CREATE_POST_MODAL_OPEN;
};

export type CloseCreatePostModalAction = {
  type: typeof CREATE_POST_MODAL_CLOSE;
};

export type CreatePostModalAction =
  | OpenCreatePostModalAction
  | CloseCreatePostModalAction;

export const openCreatePostModal = (): OpenCreatePostModalAction => ({
  type: CREATE_POST_MODAL_OPEN,
});

export const closeCreatePostModal = (): CloseCreatePostModalAction => ({
  type: CREATE_POST_MODAL_CLOSE,
});

