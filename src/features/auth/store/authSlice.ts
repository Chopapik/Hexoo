import { SessionData } from "@/features/me/me.type";

export type AuthState = {
  user: SessionData | null;
  ready: boolean;
};

export const AUTH_SET_USER = "auth/setUser" as const;
export const AUTH_CLEAR_USER = "auth/clearUser" as const;
export const AUTH_SET_READY = "auth/setReady" as const;

export type SetUserAction = {
  type: typeof AUTH_SET_USER;
  payload: SessionData | null;
};

export type ClearUserAction = {
  type: typeof AUTH_CLEAR_USER;
};

export type SetReadyAction = {
  type: typeof AUTH_SET_READY;
  payload: boolean;
};

export type AuthAction = SetUserAction | ClearUserAction | SetReadyAction;

export const setUser = (user: SessionData | null): SetUserAction => ({
  type: AUTH_SET_USER,
  payload: user,
});

export const clearUser = (): ClearUserAction => ({
  type: AUTH_CLEAR_USER,
});

export const setReady = (ready: boolean): SetReadyAction => ({
  type: AUTH_SET_READY,
  payload: ready,
});
