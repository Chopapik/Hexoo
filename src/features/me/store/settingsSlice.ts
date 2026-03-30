export interface SettingsState {
  showNSFWPosts: boolean;
  showNSFWComments: boolean;
}

export const SETTINGS_SET_NSFW_VISIBILITY = "settings/setNsfwVisibility" as const;
export const SETTINGS_SET_COMMENTS_NSFW_VISIBILITY =
  "settings/setCommentsNsfwVisibility" as const;
export const SETTINGS_INITIALIZE = "settings/initializeSettings" as const;

export type SetNsfwVisibilityAction = {
  type: typeof SETTINGS_SET_NSFW_VISIBILITY;
  payload: boolean;
};

export type SetCommentsNsfwVisibilityAction = {
  type: typeof SETTINGS_SET_COMMENTS_NSFW_VISIBILITY;
  payload: boolean;
};

export type InitializeSettingsAction = {
  type: typeof SETTINGS_INITIALIZE;
};

export type SettingsAction =
  | SetNsfwVisibilityAction
  | SetCommentsNsfwVisibilityAction
  | InitializeSettingsAction;

export const setNsfwVisibility = (value: boolean): SetNsfwVisibilityAction => ({
  type: SETTINGS_SET_NSFW_VISIBILITY,
  payload: value,
});

export const setCommentsNsfwVisibility = (
  value: boolean,
): SetCommentsNsfwVisibilityAction => ({
  type: SETTINGS_SET_COMMENTS_NSFW_VISIBILITY,
  payload: value,
});

export const initializeSettings = (): InitializeSettingsAction => ({
  type: SETTINGS_INITIALIZE,
});
