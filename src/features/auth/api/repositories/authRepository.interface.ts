import { DecodedIdToken, UserRecord } from "firebase-admin/auth";

export interface AuthRepository {
  verifyIdToken(idToken: string): Promise<DecodedIdToken>;
  createSessionCookie(idToken: string, expiresIn: number): Promise<string>;
  getUserByEmail(email: string): Promise<UserRecord | null>;
  deleteUser(uid: string): Promise<void>;
  updateUser(uid: string, properties: any): Promise<void>;
  createUser(properties: any): Promise<any>;
}
