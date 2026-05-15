import { createAppError } from "@/lib/AppError";
import type { SessionData } from "@/features/me/me.type";
import { UserRole } from "../../types/user.type";

export function ensureModeratorOrAdmin(
  session: SessionData | null,
): SessionData {
  if (!session) {
    throw createAppError({
      code: "AUTH_REQUIRED",
      message: "[userService] No session available",
    });
  }

  if (
    session.role !== UserRole.Moderator &&
    session.role !== UserRole.Admin
  ) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "[userService] Missing moderator/admin role",
    });
  }

  return session;
}

export function assertUid(uid: string, context: string): void {
  if (!uid) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: `[${context}] No 'uid' provided`,
    });
  }
}
