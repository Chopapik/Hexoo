import { oauthLogin } from "@/features/auth/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { createAppError } from "@/lib/AppError";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/oauth-login
 *
 * OAuth-only login endpoint (no reCAPTCHA). Accepts a Supabase access token obtained
 * from `supabase.auth.signInWithOAuth(...)` on the client and:
 *   - issues app session + returns `{ status: "LOGGED_IN", user }` when the user already has a username
 *   - creates a pending DB record (or reuses an existing pending one) and returns
 *     `{ status: "NEEDS_USERNAME", uid, email }` otherwise.
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { idToken, refreshToken } = body ?? {};

  if (!idToken || typeof idToken !== "string") {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[auth/oauth-login/route.POST] No idToken provided.",
    });
  }

  const result = await oauthLogin({
    idToken,
    refreshToken: typeof refreshToken === "string" ? refreshToken : undefined,
  });

  return handleSuccess(result);
});
