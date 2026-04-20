import { completeOAuthProfile } from "@/features/auth/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/AppError";
import { NextRequest } from "next/server";

/**
 * Completes OAuth onboarding by saving the username
 * and creating the app session.
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { idToken, refreshToken, name } = body ?? {};

  if (!idToken || typeof idToken !== "string") {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[auth/oauth-complete-profile/route.POST] No idToken provided.",
    });
  }

  if (!name || typeof name !== "string") {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[auth/oauth-complete-profile/route.POST] No username provided.",
    });
  }

  const result = await completeOAuthProfile({
    idToken,
    refreshToken: typeof refreshToken === "string" ? refreshToken : undefined,
    name,
  });

  return handleSuccess(result);
});
