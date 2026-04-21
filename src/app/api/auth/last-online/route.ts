import { NextRequest, NextResponse } from "next/server";
import { authRepository } from "@/features/auth/api/repositories";
import { SESSION_COOKIE_NAME } from "@/features/auth/api/utils/session.cookies";
import { touchLastOnline } from "@/features/users/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";

const MIN_LAST_ONLINE_INTERVAL_MS = 5 * 60 * 1000;

export const POST = withErrorHandling(async (request: NextRequest) => {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return new NextResponse(null, { status: 204 });
  }

  const force = request.nextUrl.searchParams.get("force") === "1";
  const decoded = await authRepository.verifyIdToken(sessionToken);
  await touchLastOnline(
    decoded.uid,
    force ? 0 : MIN_LAST_ONLINE_INTERVAL_MS,
  );

  return new NextResponse(null, { status: 204 });
});
