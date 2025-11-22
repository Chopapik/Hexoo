import { z } from "zod";
import { UserRole } from "@/features/users/types/user.type";
import { ValidationMessage } from "@/features/shared/types/validation.type";

export const RegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "email_required" })
    .max(255)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: "email_invalid",
    }),

  password: z
    .string()
    .min(8, { message: "password_too_short" })
    .max(128, { message: "password_too_long" })
    .regex(/[A-Z]/, { message: "password_missing_uppercase" })
    .regex(/[0-9]/, { message: "password_missing_digit" })
    .regex(/[^A-Za-z0-9]/, { message: "password_missing_special" }),

  name: z
    .string()
    .trim()
    .min(3, { message: "name_too_short" })
    .max(30, { message: "name_too_long" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "name_invalid_chars" }),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "email_required" })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: "email_invalid",
    }),
  password: z.string().min(1, { message: "password_required" }),
});

export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
}
