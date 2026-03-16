/** Provider-agnostic decoded token (Supabase JWT). */
export type AuthDecodedToken = {
  uid: string;
  email?: string | null;
};

/** Minimal auth user record for e.g. checkEmailAvailability. */
export type AuthUserRecord = {
  uid: string;
  email?: string | null;
};

export type RefreshTokens = {
  access_token: string;
  refresh_token: string;
};

export interface AuthRepository {
  verifyIdToken(idToken: string): Promise<AuthDecodedToken>;
  createSessionCookie(idToken: string, expiresIn: number): Promise<string>;
  /** Exchange refresh token for new access + refresh tokens. */
  refreshSession(refreshToken: string): Promise<RefreshTokens>;
  getUserByEmail(email: string): Promise<AuthUserRecord | null>;
  deleteUser(uid: string): Promise<void>;
  updateUser(uid: string, properties: Record<string, unknown>): Promise<void>;
  createUser(properties: {
    email: string;
    password: string;
    displayName?: string;
    [key: string]: unknown;
  }): Promise<{ uid: string }>;
}
