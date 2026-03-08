import {
  SESSION_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_OPTS,
  REFRESH_COOKIE_OPTS,
} from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/auth/slide
 * Re-sets session (7d) and refresh (1y) cookies – sliding for refresh only.
 * Call from client on app load so cookies can be modified in Route Handler.
 */
export async function GET(request: NextRequest) {
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
}
