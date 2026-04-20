import type { SessionData } from "@/features/me/me.type";

export type OAuthSessionUser = {
  uid: string;
  email: string | undefined;
  name: string;
  role: string;
  avatarUrl?: string;
};

export type OAuthLoginResult =
  | { status: "LOGGED_IN"; user: OAuthSessionUser }
  | { status: "NEEDS_USERNAME"; uid: string; email: string | undefined };

export type CompleteOAuthProfileResult = {
  user: OAuthSessionUser;
};

export interface AuthService {
  logoutUser(): Promise<{ message: string }>;
  /** Restore session using refresh token; returns user or null, clears cookies on failure. */
  restoreUserSession(): Promise<SessionData | null>;
  createSession(
    idToken: string,
    refreshToken?: string,
  ): Promise<{
    user: {
      uid: string;
      email: string | undefined;
      name: string;
      role: string;
      avatarUrl?: string;
    };
  }>;
  registerUser(data: {
    idToken: string;
    name: string;
    email: string;
    refreshToken?: string;
  }): Promise<{
    user: {
      uid: string;
      name: string;
      email: string | undefined;
      role: "user";
    };
  }>;
  checkEmailAvailability(email: string): Promise<{
    available: boolean;
    email: string;
  }>;
  checkUsernameAvailability(username: string): Promise<{
    available: boolean;
    username: string;
  }>;

  oauthLogin(data: {
    idToken: string;
    refreshToken?: string;
  }): Promise<OAuthLoginResult>;

  completeOAuthProfile(data: {
    idToken: string;
    refreshToken?: string;
    name: string;
  }): Promise<CompleteOAuthProfileResult>;
}
