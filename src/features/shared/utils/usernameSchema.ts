import { z } from "zod";
import { isUsernameBlocked } from "@/features/auth/constants/blockedUsernames";
import { isUsernameProfane } from "@/features/moderation/utils/profanityFilter";

export const BaseUsernameSchema = z
  .string()
  .trim()
  .min(3, { message: "name_too_short" })
  .max(50, { message: "name_too_long" })
  .regex(/^[a-zA-Z0-9_]+$/, { message: "name_invalid_chars" })
  .refine((name) => !isUsernameBlocked(name), {
    message: "name_forbidden",
  })
  .refine((name) => !isUsernameProfane(name), {
    message: "name_policy_violation",
  });
