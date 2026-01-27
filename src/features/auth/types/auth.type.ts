import { z } from "zod";

export type registerFields = "name" | "email" | "password";

export const RegisterSchema = z.object({
  email: z
    .string()
    .min(1, { message: "email_required" })
    .max(255)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: "email_invalid",
    }).trim(),

  password: z
    .string()
    .min(8, { message: "password_too_short" })
    .max(128, { message: "password_too_long" }),

  name: z
    .string()
    .min(3, { message: "name_too_short" })
    .max(30, { message: "name_too_long" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "name_invalid_chars" })
    .trim(),

  terms: z.literal(true, {
    error: () => ({ message: "terms_required" }),
  }),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "email_required" })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: "email_invalid",
    }),
  password: z.string().min(1, { message: "password_required" }),
});

export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
