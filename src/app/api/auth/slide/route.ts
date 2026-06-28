import {
  SESSION_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_OPTS,
  REFRESH_COOKIE_OPTS,
} from "@/features/auth/api/utils/session.cookies";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assertAuthSessionRateLimit } from "@/lib/rateLimit";
import { withErrorHandling } from "@/lib/http/routeWrapper";

/**
 * GET /api/auth/slide
 * Re-sets session (7d) and refresh (1y) cookies – sliding for refresh only.
 * Call from client on app load so cookies can be modified in Route Handler.
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  await assertAuthSessionRateLimit(request);

  const sessionValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const refreshValue = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!sessionValue && !refreshValue) {
    return new NextResponse(null, { status: 204 });
  }

  const cookieStore = await cookies();

  if (sessionValue) {
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: sessionValue,
      ...SESSION_COOKIE_OPTS,
    });
  }
  if (refreshValue) {
    cookieStore.set({
      name: REFRESH_COOKIE_NAME,
      value: refreshValue,
      ...REFRESH_COOKIE_OPTS,
    });
  }

  return new NextResponse(null, { status: 204 });
});
