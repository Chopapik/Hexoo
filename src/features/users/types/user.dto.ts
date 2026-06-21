import { z } from "zod";

export const USER_DISPLAY_NAME_MAX_CHARS = 50;
import type { UserEntity } from "./user.entity";
import { UserRole } from "./user.type";

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(USER_DISPLAY_NAME_MAX_CHARS),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(USER_DISPLAY_NAME_MAX_CHARS).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export const BlockUserSchema = z.object({
  uidToBlock: z.string().min(1),
  bannedBy: z.string().min(1),
  bannedReason: z.string().min(1),
});

export const RestrictUserSchema = z.object({
  uid: z.string().min(1),
  reason: z.string().min(1),
});

export type CreateUserRequestDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequestDto = z.infer<typeof UpdateUserSchema>;
export type BlockUserRequestDto = z.infer<typeof BlockUserSchema>;
export type RestrictUserRequestDto = z.infer<typeof RestrictUserSchema>;

export type PublicUserResponseDto = Pick<
  UserEntity,
  "uid" | "name" | "createdAt" | "lastOnline"
> & {
  avatarUrl?: string | null;
};

export type PrivateUserResponseDto = PublicUserResponseDto &
  Pick<
    UserEntity,
    | "email"
    | "role"
    | "isActive"
    | "isBanned"
    | "bannedAt"
    | "bannedBy"
    | "bannedReason"
    | "isRestricted"
    | "restrictedAt"
    | "restrictedBy"
    | "restrictionReason"
    | "lastKnownIp"
  >;

export type UserProfileResponseDto = PublicUserResponseDto;
