import type {
  AuthCreateUserProperties,
  AuthDecodedToken,
  AuthRepository,
  AuthUpdateUserProperties,
  AuthUserRecord,
  RefreshTokens,
} from "@/features/auth/api/repositories/authRepository.interface";

type AuthOperation =
  | "verifyIdToken"
  | "verifyPassword"
  | "signInWithPassword"
  | "createSessionCookie"
  | "refreshSession"
  | "getUserByEmail"
  | "deleteUser"
  | "updateUser"
  | "createUser";

export type FakeAuthCall =
  | { operation: "verifyIdToken"; idToken: string }
  | { operation: "verifyPassword"; email: string; password: string }
  | { operation: "signInWithPassword"; email: string; password: string }
  | { operation: "createSessionCookie"; idToken: string; expiresIn: number }
  | { operation: "refreshSession"; refreshToken: string }
  | { operation: "getUserByEmail"; email: string }
  | { operation: "deleteUser"; uid: string }
  | {
      operation: "updateUser";
      uid: string;
      properties: AuthUpdateUserProperties;
    }
  | { operation: "createUser"; properties: AuthCreateUserProperties };

type StoredAuthUser = AuthUserRecord & {
  password?: string;
  disabled?: boolean;
  displayName?: string;
};

type FakeAuthRepositoryOptions = {
  users?: StoredAuthUser[];
};

export class FakeAuthRepository implements AuthRepository {
  private usersByUid = new Map<string, StoredAuthUser>();
  private failures = new Map<AuthOperation, Error>();
  public readonly calls: FakeAuthCall[] = [];

  constructor(options: FakeAuthRepositoryOptions = {}) {
    for (const user of options.users ?? []) {
      this.usersByUid.set(user.uid, { ...user });
    }
  }

  failNext(operation: AuthOperation, error = new Error(operation)): void {
    this.failures.set(operation, error);
  }

  resetCalls(): void {
    this.calls.length = 0;
  }

  clearFailures(): void {
    this.failures.clear();
  }

  getAllUsers(): AuthUserRecord[] {
    return [...this.usersByUid.values()].map(({ uid, email }) => ({
      uid,
      email,
    }));
  }

  async verifyIdToken(idToken: string): Promise<AuthDecodedToken> {
    this.calls.push({ operation: "verifyIdToken", idToken });
    this.throwIfFailed("verifyIdToken");

    const user = this.usersByUid.get(idToken);
    if (user) {
      return { uid: user.uid, email: user.email };
    }

    return { uid: idToken, email: `${idToken}@example.test` };
  }

  async verifyPassword(
    email: string,
    password: string,
  ): Promise<AuthDecodedToken> {
    this.calls.push({ operation: "verifyPassword", email, password });
    this.throwIfFailed("verifyPassword");

    const user = [...this.usersByUid.values()].find(
      (candidate) => candidate.email === email,
    );

    if (!user || user.password !== password || user.disabled) {
      throw new Error("INVALID_CREDENTIALS");
    }

    return { uid: user.uid, email: user.email };
  }

  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<RefreshTokens> {
    this.calls.push({ operation: "signInWithPassword", email, password });
    this.throwIfFailed("signInWithPassword");

    const user = [...this.usersByUid.values()].find(
      (candidate) => candidate.email === email,
    );

    if (!user || user.password !== password || user.disabled) {
      throw new Error("INVALID_CREDENTIALS");
    }

    return {
      access_token: user.uid,
      refresh_token: `refresh:${user.uid}`,
    };
  }

  async createSessionCookie(
    idToken: string,
    expiresIn: number,
  ): Promise<string> {
    this.calls.push({ operation: "createSessionCookie", idToken, expiresIn });
    this.throwIfFailed("createSessionCookie");
    return `session:${idToken}:${expiresIn}`;
  }

  async refreshSession(refreshToken: string): Promise<RefreshTokens> {
    this.calls.push({ operation: "refreshSession", refreshToken });
    this.throwIfFailed("refreshSession");
    return {
      access_token: `access:${refreshToken}`,
      refresh_token: `refresh:${refreshToken}`,
    };
  }

  async getUserByEmail(email: string): Promise<AuthUserRecord | null> {
    this.calls.push({ operation: "getUserByEmail", email });
    this.throwIfFailed("getUserByEmail");

    const user = [...this.usersByUid.values()].find(
      (candidate) => candidate.email === email,
    );

    return user ? { uid: user.uid, email: user.email } : null;
  }

  async deleteUser(uid: string): Promise<void> {
    this.calls.push({ operation: "deleteUser", uid });
    this.throwIfFailed("deleteUser");
    this.usersByUid.delete(uid);
  }

  async updateUser(
    uid: string,
    properties: AuthUpdateUserProperties,
  ): Promise<void> {
    this.calls.push({ operation: "updateUser", uid, properties });
    this.throwIfFailed("updateUser");

    const existing = this.usersByUid.get(uid);
    if (!existing) {
      throw new Error("USER_NOT_FOUND");
    }

    this.usersByUid.set(uid, {
      ...existing,
      disabled: properties.disabled ?? existing.disabled,
      displayName: properties.displayName ?? existing.displayName,
      email: properties.email ?? existing.email,
      password: properties.password ?? existing.password,
    });
  }

  async createUser(
    properties: AuthCreateUserProperties,
  ): Promise<{ uid: string }> {
    this.calls.push({ operation: "createUser", properties });
    this.throwIfFailed("createUser");

    const uid = `auth-${this.usersByUid.size + 1}`;
    this.usersByUid.set(uid, {
      uid,
      email: properties.email,
      password: properties.password,
      displayName: properties.displayName,
    });

    return { uid };
  }

  private throwIfFailed(operation: AuthOperation): void {
    const error = this.failures.get(operation);
    if (!error) return;

    this.failures.delete(operation);
    throw error;
  }
}
