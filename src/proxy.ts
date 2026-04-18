import { NextResponse, type NextRequest } from "next/server";
import { isUserAuthenticated } from "@/features/auth/api/services/session.service";

/** Strony i prefiksy wymagające zalogowania (reszta jest publiczna, m.in. feed i profile). */
const AUTH_REQUIRED_PREFIXES = ["/settings", "/admin", "/moderator"];

function pathRequiresAuth(pathname: string): boolean {
  return AUTH_REQUIRED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** GET/HEAD na wybrane endpointy API — dostęp bez sesji (np. publiczny feed). */
function isPublicApiReadRequest(request: NextRequest): boolean {
  const method = request.method;
  if (method !== "GET" && method !== "HEAD") {
    return false;
  }

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/user/profile/")) {
    return true;
  }

  if (pathname === "/api/posts") {
    return true;
  }

  if (pathname.startsWith("/api/posts/user/")) {
    return true;
  }

  if (/^\/api\/posts\/[^/]+\/comments$/.test(pathname)) {
    return true;
  }

  if (/^\/api\/posts\/[^/]+$/.test(pathname)) {
    return true;
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");
  const isAuthApiRoute = pathname.startsWith("/api/auth");
  const isDemoRoute = pathname.startsWith("/demo");

  const appEnv = process.env.APP_ENV;
  const isDevApp = appEnv === "development";
  const isProduction = process.env.NODE_ENV === "production";

  if (isDemoRoute && isProduction && !isDevApp) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  const isLoggedIn = await isUserAuthenticated(request, response);

  if (isApiRoute) {
    const allowedWithoutSession =
      isAuthApiRoute || isLoggedIn || isPublicApiReadRequest(request);

    if (allowedWithoutSession) {
      return response;
    }

    const unauthorized = NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
    unauthorized.cookies.delete("session");
    unauthorized.cookies.delete("refresh");
    return unauthorized;
  }

  if (!isLoggedIn && pathRequiresAuth(pathname)) {
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
