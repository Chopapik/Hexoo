import { NextResponse, type NextRequest } from "next/server";
import { getClientIp } from "@/lib/serverUtils";
import { isUserAuthenticated } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/register", "/privacy", "/terms"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isDemoRoute = pathname.startsWith("/demo");
  const appEnv = process.env.APP_ENV;
  const isDevApp = appEnv === "development";
  const isProduction = process.env.NODE_ENV === "production";

  if (isDemoRoute && isProduction && !isDevApp) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    pathname.startsWith("/api/security") ||
    pathname.startsWith("/critical-error")
  ) {
    return NextResponse.next();
  }

  const isLoggedIn = isUserAuthenticated(request);

  const isPublicPath =
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    ) || pathname.startsWith("/api/auth");

  if (!isLoggedIn && !isPublicPath) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
