import { User } from "@/features/users/types/user.type";
import { DecodedIdToken } from "firebase-admin/auth";

export interface IAuthRepository {
  verifyIdToken(idToken: string): Promise<DecodedIdToken>;
  createSessionCookie(idToken: string, expiresIn: number): Promise<string>;
  deleteUser(uid: string): Promise<void>;
  updateUser(uid: string, properties: any): Promise<void>;
  createUser(properties: any): Promise<any>;
}
