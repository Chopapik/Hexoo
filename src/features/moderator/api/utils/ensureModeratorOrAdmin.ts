import { createAppError } from "@/lib/AppError";
import type { SessionData } from "@/features/me/me.type";

export const ensureModeratorOrAdmin = (session: SessionData) => {
  if (session.role !== "moderator" && session.role !== "admin") {
    throw createAppError({
      code: "FORBIDDEN",
      message:
        "[moderatorAccess.ensureModeratorOrAdmin] Missing moderator/admin role",
    });
  }
  return session;
};
