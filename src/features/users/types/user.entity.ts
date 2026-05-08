import { ImageMeta } from "@/features/images/types/image.type";
import { UserRole } from "./user.type";

export interface UserEntity {
  uid: string;
  /**
   * Temporary app-level name field mapped from `users.display_name`.
   * It is a display label only (not a username/handle and never an identifier).
   */
  name: string;
  /**
   * Whether the user has a non-empty display name.
   * Derived from `users.display_name`.
   */
  hasUsername: boolean;
  email: string;
  role: UserRole;
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
