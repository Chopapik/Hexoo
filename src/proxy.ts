import { NextResponse, type NextRequest } from "next/server";
import { isUserAuthenticated } from "@/features/auth/api/services/session.service";

const PUBLIC_PATHS = ["/login", "/register", "/privacy", "/terms"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");
  const isAuthApiRoute = pathname.startsWith("/api/auth");
  const isBypassedRoute =
    pathname.startsWith("/api/security") ||
    pathname.startsWith("/critical-error");
  const isDemoRoute = pathname.startsWith("/demo");

  const appEnv = process.env.APP_ENV;
  const isDevApp = appEnv === "development";
  const isProduction = process.env.NODE_ENV === "production";

  if (isDemoRoute && isProduction && !isDevApp) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isBypassedRoute) {
    return NextResponse.next();
  }

  const isPublicPath =
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    ) || isAuthApiRoute;

  const response = NextResponse.next();
  const isLoggedIn = await isUserAuthenticated(request, response);

  if (!isLoggedIn && !isPublicPath) {
    if (isApiRoute) {
      const unauthorized = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
      unauthorized.cookies.delete("session");
      unauthorized.cookies.delete("refresh");
      return unauthorized;
    }

    const redirect = NextResponse.redirect(new URL("/login", request.url));
    redirect.cookies.delete("session");
    redirect.cookies.delete("refresh");
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
