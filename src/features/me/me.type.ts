import z from "zod";
import { UserRole } from "../users/types/user.type";
import { BaseUsernameSchema } from "@/features/shared/utils/usernameSchema";
import {
  IMAGE_UPLOAD_ALLOWED_MIME_TYPES,
  IMAGE_UPLOAD_MAX_BYTES,
} from "@/features/images/image-resource-policy";

export type SessionData = {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  /** Resolved at the API layer from avatarMeta; never stored in DB. */
  avatarUrl?: string;
  /** Comes from users.last_online in DB. Can be ISO string after SSR serialization. */
  lastOnline?: Date | string;
  isRestricted?: boolean;
  isBanned?: boolean;
};

export const UpdatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "newPassword_too_short" })
      .max(128, { message: "newPassword_too_long" }),
    reNewPassword: z.string().min(1, { message: "reNewPassword_required" }),
    oldPassword: z.string().min(1, { message: "oldPassword_required" }),
    recaptchaToken: z.string().optional(),
  })
  .refine((data) => data.newPassword === data.reNewPassword, {
    message: "new_password_not_equal",
    path: ["reNewPassword"],
  });

export type UpdatePasswordData = z.infer<typeof UpdatePasswordSchema>;

export const UpdateProfileSchema = z.object({
  name: BaseUsernameSchema.optional(),
  avatarFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= IMAGE_UPLOAD_MAX_BYTES, "file_too_big")
    .refine(
      (file) =>
        !file ||
        IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(
          file.type as (typeof IMAGE_UPLOAD_ALLOWED_MIME_TYPES)[number],
        ),
      "wrong_file_type",
    ),
});

export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;
