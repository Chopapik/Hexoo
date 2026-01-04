import { ImageMeta } from "@/features/posts/types/post.type";
import { firestore } from "firebase-admin";

export type UserRole = "admin" | "user" | "moderator";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  avatarMeta?: ImageMeta;

  createdAt: firestore.Timestamp | Date;
  updatedAt?: firestore.Timestamp | Date;
  lastOnline: firestore.Timestamp | Date;

  isActive?: boolean;

  isBanned?: boolean;
  bannedAt?: firestore.Timestamp | Date;
  bannedBy?: string;
  bannedReason?: string;

  isRestricted?: boolean;
  restrictedAt?: firestore.Timestamp | Date;
  restrictedBy?: string;
  restrictionReason?: string;

  lastKnownIp?: string;
}

export interface UserDataUpdate {
  name?: string;
  email?: string;
  role?: UserRole;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  avatarUrl?: string;
  lastOnline?: firestore.Timestamp | Date;
  createdAt: firestore.Timestamp | Date;
}

export interface UserBlockData {
  uidToBlock: string;
  bannedBy: string;
  bannedReason: string;
}

export interface UserRestrictionData {
  uid: string;
  restrictedBy: string;
  reason: string;
}
