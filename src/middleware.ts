import { NextResponse, type NextRequest } from "next/server";
import { getClientIp } from "@/lib/serverUtils";

const BRUTE_FORCE_PATHS = ["/api/auth/login", "/api/auth/register"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname === "/api/security/rate-limit" ||
    pathname === "/api/security/throttle"
  ) {
    return NextResponse.next();
  }

  const ip = await getClientIp();

  if (BRUTE_FORCE_PATHS.includes(pathname)) {
    try {
      const checkUrl = new URL("/api/security/rate-limit", request.url);
      checkUrl.searchParams.set("ip", ip);

      const response = await fetch(checkUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 429) {
        const errorBody = await response.json();
        return NextResponse.json(errorBody, { status: 429 });
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
        const errorBody = await response.json();
        console.log("body", errorBody);

        return NextResponse.json(errorBody, { status: 429 });
      }
    } catch (error) {
      console.error("Middleware Throttle check failed:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
