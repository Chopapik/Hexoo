import { z } from "zod";
import { User } from "./user.entity";
import { UserRole } from "./user.type";

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  role: z.enum(["admin", "user", "moderator"]),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "user", "moderator"]).optional(),
  avatarUrl: z.string().url().optional(),
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

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type BlockUserDto = z.infer<typeof BlockUserSchema>;
export type RestrictUserDto = z.infer<typeof RestrictUserSchema>;

export type UserResponseDto = User & {
  userName?: string;
  userAvatarUrl?: string | null;
};

export type UserProfileDto = {
  uid: string;
  name: string;
  avatarUrl?: string;
  lastOnline?: Date;
  createdAt: Date;
};
