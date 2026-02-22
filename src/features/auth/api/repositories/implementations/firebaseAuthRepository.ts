import type { AuthRepository, AuthDecodedToken, AuthUserRecord } from "../authRepository.interface";
import { adminAuth } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/AppError";

export class FirebaseAuthRepository implements AuthRepository {
  async verifyIdToken(idToken: string): Promise<AuthDecodedToken> {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      return { uid: decoded.uid, email: decoded.email ?? null };
    } catch (error) {
      throw createAppError({
        code: "INVALID_CREDENTIALS",
        message: "Failed to verify Firebase ID Token.",
        details: error,
      });
    }
  }

  async createSessionCookie(
    idToken: string,
    expiresIn: number,
  ): Promise<string> {
    try {
      return await adminAuth.createSessionCookie(idToken, { expiresIn });
    } catch (error) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "Failed to create session cookie via Admin SDK.",
        details: error,
      });
    }
  }

  async getUserByEmail(email: string): Promise<AuthUserRecord | null> {
    try {
      const user = await adminAuth.getUserByEmail(email);
      return { uid: user.uid, email: user.email ?? null };
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err?.code === "auth/user-not-found") {
        return null;
      }
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "Failed to fetch user by email via Admin SDK.",
        details: error,
      });
    }
  }

  async deleteUser(uid: string): Promise<void> {
    await adminAuth.deleteUser(uid);
  }

  async updateUser(uid: string, properties: Record<string, unknown>): Promise<void> {
    await adminAuth.updateUser(uid, properties as { disabled?: boolean; displayName?: string; photoURL?: string; password?: string });
  }

  async createUser(properties: {
    email: string;
    password: string;
    displayName?: string;
    [key: string]: unknown;
  }): Promise<{ uid: string }> {
    const user = await adminAuth.createUser({
      email: properties.email,
      password: properties.password,
      displayName: properties.displayName as string | undefined,
    });
    return { uid: user.uid };
  }
}
