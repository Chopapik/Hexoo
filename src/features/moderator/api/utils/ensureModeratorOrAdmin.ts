import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { createAppError } from "@/lib/AppError";

export const ensureModeratorOrAdmin = async () => {
  const session = await getUserFromSession();
  if (session.role !== "moderator" && session.role !== "admin") {
    throw createAppError({
      code: "FORBIDDEN",
      message:
        "[moderatorAccess.ensureModeratorOrAdmin] Missing moderator/admin role",
    });
  }
  return session;
};
