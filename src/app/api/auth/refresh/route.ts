import { tryRefreshSession } from "@/features/auth/api/services";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/refresh
 * Uses refresh token cookie to get new access token and sets cookies, then redirects.
 * Call this when session JWT is expired (e.g. redirect from layout).
 * Cookies can be set here (Route Handler context).
 */
export async function GET(request: NextRequest) {
  const user = await tryRefreshSession();
  const base = new URL(request.url).origin;
  if (user) {
    return NextResponse.redirect(new URL("/", base));
  }
  return NextResponse.redirect(new URL("/login", base));
}
