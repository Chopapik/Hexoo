import { NextResponse, type NextRequest } from "next/server";
import { getClientIp } from "@/lib/serverUtils";

const BRUTE_FORCE_PATHS = ["/api/auth/login", "/api/auth/register"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/api/security") ||
    pathname.startsWith("/critical-error")
  ) {
    return NextResponse.next();
  }

  const ip = await getClientIp();
  let errorResponse = null;

  if (BRUTE_FORCE_PATHS.includes(pathname)) {
    try {
      const checkUrl = new URL("/api/security/rate-limit", request.url);
      checkUrl.searchParams.set("ip", ip);
      const response = await fetch(checkUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 429) {
        errorResponse = await response.json();
      }
    } catch (error) {
      console.error("Middleware BF check failed:", error);
    }
  } else {
    try {
      const throttleUrl = new URL("/api/security/throttle", request.url);
      throttleUrl.searchParams.set("ip", ip);
      const response = await fetch(throttleUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 429) {
        errorResponse = await response.json();
      }
    } catch (error) {
      console.error("Middleware Throttle check failed:", error);
    }
  }

  if (errorResponse) {
    const isApiRequest = pathname.startsWith("/api");

    if (isApiRequest) {
      return NextResponse.json(errorResponse, { status: 429 });
    }

    const errorPageUrl = new URL("/critical-error", request.url);

    errorPageUrl.searchParams.set("status", "RATE_LIMIT");

    if (errorResponse.error?.data) {
      errorPageUrl.searchParams.set(
        "details",
        JSON.stringify(errorResponse.error.data)
      );
    }

    return NextResponse.redirect(errorPageUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
