import { NextRequest, NextResponse } from "next/server";
import { authRepository } from "@/features/auth/api/repositories";
import { SESSION_COOKIE_NAME } from "@/features/auth/api/utils/session.cookies";
import { touchLastOnline } from "@/features/users/api/services";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const decoded = await authRepository.verifyIdToken(sessionToken);
    await touchLastOnline(decoded.uid);
  } catch {
    // Silent no-op: this endpoint should never break page flow.
  }

  return new NextResponse(null, { status: 204 });
}
