import { NextResponse, type NextRequest } from "next/server";
import { isUserAuthenticated } from "@/features/auth/api/services/session.service";

/** Pages and prefixes that require login (others stay public, e.g. feed and profiles). */
const AUTH_REQUIRED_PREFIXES = ["/settings", "/admin", "/moderator"];
/** Pages and prefixes available only for logged-out users. */
const PUBLIC_ONLY_PREFIXES = ["/login", "/register"];

function pathRequiresAuth(pathname: string): boolean {
  return AUTH_REQUIRED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function pathIsPublicOnly(pathname: string): boolean {
  return PUBLIC_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** GET/HEAD on selected API endpoints — allowed without a session (e.g. public feed). */
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

  const response = NextResponse.next();
  const isLoggedIn = await isUserAuthenticated(request, response);

  if (isApiRoute) {
    const allowedWithoutSession =
      isAuthApiRoute || isLoggedIn || isPublicApiReadRequest(request);

    if (allowedWithoutSession) {
      return response;
    }

    const unauthorized = NextResponse.json(
      {
        ok: false,
        error: {
          code: "AUTH_REQUIRED",
          message: "Authentication required",
        },
      },
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

  if (isLoggedIn && pathIsPublicOnly(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
