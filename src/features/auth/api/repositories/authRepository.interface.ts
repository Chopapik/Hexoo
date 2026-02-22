/** Provider-agnostic decoded token (Firebase ID token or Supabase JWT). */
export type AuthDecodedToken = {
  uid: string;
  email?: string | null;
};

/** Minimal auth user record for e.g. checkEmailAvailability (Firebase UserRecord or Supabase User). */
export type AuthUserRecord = {
  uid: string;
  email?: string | null;
};

export interface AuthRepository {
  verifyIdToken(idToken: string): Promise<AuthDecodedToken>;
  createSessionCookie(idToken: string, expiresIn: number): Promise<string>;
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
