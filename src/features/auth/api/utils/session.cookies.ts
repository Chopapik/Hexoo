import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export type SessionCookie =
  | { session: true; value: string }
  | { session: false };

export type RefreshCookie =
  | { hasRefresh: true; value: string }
  | { hasRefresh: false };

export const SESSION_COOKIE_NAME = "session";
export const REFRESH_COOKIE_NAME = "refresh";

/** Max JWT lifetime in Supabase (7 days). */
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * Refresh token cookie can live much longer.
 * Browser keeps it, but Supabase still decides whether token is valid.
 */
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const COOKIE_BASE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
} as const;

export const SESSION_COOKIE_OPTS = {
  ...COOKIE_BASE_OPTS,
  maxAge: SESSION_COOKIE_MAX_AGE,
};

export const REFRESH_COOKIE_OPTS = {
  ...COOKIE_BASE_OPTS,
  maxAge: REFRESH_COOKIE_MAX_AGE,
};

/**
 * ----------------------------
 * Server-side helpers (cookies())
 * For route handlers / server functions
 * ----------------------------
 */

export async function setSessionCookie(sessionValue: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: sessionValue,
    ...SESSION_COOKIE_OPTS,
  });
}

export async function setRefreshCookie(refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: REFRESH_COOKIE_NAME,
    value: refreshToken,
    ...REFRESH_COOKIE_OPTS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function clearRefreshCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function clearAllAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function getSessionCookie(): Promise<SessionCookie> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionValue) {
    return { session: false };
  }

  return {
    session: true,
    value: sessionValue,
  };
}

export async function getRefreshCookie(): Promise<RefreshCookie> {
  const cookieStore = await cookies();
  const refreshValue = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshValue) {
    return { hasRefresh: false };
  }

  return {
    hasRefresh: true,
    value: refreshValue,
  };
}

/**
 * ----------------------------
 * Request readers
 * For middleware/proxy
 * ----------------------------
 */

export function getSessionCookieFromRequest(
  request: Pick<NextRequest, "cookies">,
): SessionCookie {
  const sessionValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionValue) {
    return { session: false };
  }

  return {
    session: true,
    value: sessionValue,
  };
}

export function getRefreshCookieFromRequest(
  request: Pick<NextRequest, "cookies">,
): RefreshCookie {
  const refreshValue = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshValue) {
    return { hasRefresh: false };
  }

  return {
    hasRefresh: true,
    value: refreshValue,
  };
}

/**
 * ----------------------------
 * Response writers
 * For middleware/proxy
 * ----------------------------
 */

export function setSessionCookieOnResponse(
  response: NextResponse,
  sessionValue: string,
) {
  response.cookies.set(SESSION_COOKIE_NAME, sessionValue, SESSION_COOKIE_OPTS);
}

export function setRefreshCookieOnResponse(
  response: NextResponse,
  refreshToken: string,
) {
  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTS);
}

export function clearSessionCookieOnResponse(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE_NAME);
}

export function clearRefreshCookieOnResponse(response: NextResponse) {
  response.cookies.delete(REFRESH_COOKIE_NAME);
}

export function clearAllAuthCookiesOnResponse(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
}
