import { z } from "zod";
import { UserRole } from "@/features/users/types/user.type";

export const RegisterSchema = z.object({
  email: z.string().min(1, "email_required").email("email_invalid"),

  password: z
    .string()
    .min(1, "password_required")
    .min(8, "password_too_short")
    .regex(/[A-Z]/, "password_missing_uppercase")
    .regex(/[0-9]/, "password_missing_digit")
    .regex(/[^A-Za-z0-9]/, "password_missing_special")
    .max(128, "password_too_long"),

  name: z
    .string()
    .min(1, "name_required")
    .transform((val) => val.trim())
    .refine((val) => val.length >= 3, "name_too_short")
    .refine((val) => val.length <= 30, "name_too_long")
    .refine((val) => /^[a-zA-Z0-9_]+$/.test(val), "name_invalid_chars"),
});

export const LoginSchema = z.object({
  email: z.string().min(1, "email_required").email("email_invalid"),
  password: z.string().min(1, "password_required"),
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
