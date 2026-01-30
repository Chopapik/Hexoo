import { firestore } from "firebase-admin";
import { ImageMeta } from "@/features/images/types/image.type";
import { UserRole } from "./user.type";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  avatarMeta?: ImageMeta;

  createdAt: Date;
  updatedAt?: Date;
  lastOnline: Date;

  isActive?: boolean;

  isBanned?: boolean;
  bannedAt?: Date;
  bannedBy?: string;
  bannedReason?: string;

  isRestricted?: boolean;
  restrictedAt?: Date;
  restrictedBy?: string;
  restrictionReason?: string;

  lastKnownIp?: string;
}
