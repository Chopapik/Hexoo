import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { restoreUserSession } from "@/features/auth/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { AppError, createAppError } from "@/lib/AppError";
import type { NextRequest } from "next/server";
import { assertAuthSessionRateLimit } from "@/lib/rateLimit";

function isRefreshableSessionError(error: unknown) {
  return (
    error instanceof AppError &&
    (error.code === "AUTH_REQUIRED" ||
      error.code === "NO_SESSION" ||
      error.code === "INVALID_SESSION" ||
      error.code === "INVALID_CREDENTIALS")
  );
}

export const GET = withErrorHandling(async (req: NextRequest) => {
  await assertAuthSessionRateLimit(req);

  try {
    const user = await getUserFromSession();

    return handleSuccess({
      active: true,
      refreshed: false,
      user,
    });
  } catch (error) {
    if (!isRefreshableSessionError(error)) {
      throw error;
    }

    const user = await restoreUserSession();

    if (!user) {
      throw createAppError({
        code: "NO_SESSION",
        message: "[auth/session/route.GET] No active session.",
      });
    }

    return handleSuccess({
      active: true,
      refreshed: true,
      user,
    });
  }
});
