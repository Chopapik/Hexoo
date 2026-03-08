import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

export type Session =
  | {
      session: true;
      value: string;
    }
  | {
      session: false;
    };

export const SESSION_COOKIE_NAME = "session";
export const REFRESH_COOKIE_NAME = "refresh";

/** Max JWT lifetime in Supabase (7 days). Session cookie matches this. */
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** 1 year – refresh cookie slides on each visit so user stays logged in. */
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

/** Clears both session and refresh cookies (e.g. on logout or failed refresh). */
export async function clearAllAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

export type RefreshCookie =
  | { hasRefresh: true; value: string }
  | { hasRefresh: false };

export async function getRefreshCookie(): Promise<RefreshCookie> {
  const cookieStore = await cookies();
  const value = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  if (!value) return { hasRefresh: false };
  return { hasRefresh: true, value };
}

export async function getSessionCookie(): Promise<Session> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;

  if (!sessionValue) {
    return { session: false };
  }

  return {
    session: true,
    value: sessionValue,
  };
}

export function isUserAuthenticated(request: NextRequest): boolean {
  return (
    request.cookies.has(SESSION_COOKIE_NAME) ||
    request.cookies.has(REFRESH_COOKIE_NAME)
  );
}
