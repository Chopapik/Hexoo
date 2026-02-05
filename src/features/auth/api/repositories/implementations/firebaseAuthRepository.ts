import { AuthRepository } from "../authRepository.interface";
import { adminAuth } from "@/lib/firebaseAdmin";
import { DecodedIdToken } from "firebase-admin/auth";
import { createAppError } from "@/lib/AppError";

export class FirebaseAuthRepository implements AuthRepository {
  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    try {
      return await adminAuth.verifyIdToken(idToken);
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

  async getUserByEmail(email: string): Promise<any | null> {
    try {
      return await adminAuth.getUserByEmail(email);
    } catch (error: any) {
      if (error?.code === "auth/user-not-found") {
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

  async updateUser(uid: string, properties: any): Promise<void> {
    await adminAuth.updateUser(uid, properties);
  }

  async createUser(properties: any): Promise<any> {
    return await adminAuth.createUser(properties);
  }
}
