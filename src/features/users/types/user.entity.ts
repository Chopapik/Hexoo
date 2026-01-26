import { firestore } from "firebase-admin";
import { ImageMeta, UserRole } from "./user.type";

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
