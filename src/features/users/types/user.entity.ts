import { ImageMeta } from "@/features/images/types/image.type";
import { UserRole } from "./user.type";

export interface UserEntity {
  uid: string;
  name: string;
  /**
   * Whether the user has completed username setup.
   * Derived from `name_lowercase IS NOT NULL` and non-empty `name`.
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
