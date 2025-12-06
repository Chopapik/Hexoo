import z from "zod";

export const UpdatePasswordDataSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "newPassword_too_short" })
      .max(128, { message: "newPassword_too_long" }),
    reNewPassword: z.string().min(1, { message: "reNewPassword_required" }),
    // .regex(/[A-Z]/, { message: "password_missing_uppercase" })
    // .regex(/[0-9]/, { message: "password_missing_digit" })
    // .regex(/[^A-Za-z0-9]/, { message: "password_missing_special" }),
    oldPassword: z.string().min(1, { message: "oldPassword_required" }),
    recaptchaToken: z.string().optional(),
  })
  .refine((data) => data.newPassword === data.reNewPassword, {
    message: "new_password_not_equal",
    path: ["reNewPassword"],
  });

export type UpdatePasswordData = z.infer<typeof UpdatePasswordDataSchema>;
