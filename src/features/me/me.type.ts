import z from "zod";
import { UserRole } from "../users/types/user.type";

export type SessionData = {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
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
  name: z
    .string()
    .min(3, { message: "name_too_short" })
    .max(30, { message: "name_too_long" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "name_invalid_chars" })
    .trim()
    .optional(),
  avatarFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "file_too_big")
    .refine(
      (file) =>
        !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "wrong_file_type",
    ),
});

export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;
