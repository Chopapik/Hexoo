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
export const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function setSessionCookie(sessionValue: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: sessionValue,
    httpOnly: SESSION_COOKIE_OPTS.httpOnly,
    secure: SESSION_COOKIE_OPTS.secure,
    sameSite: SESSION_COOKIE_OPTS.sameSite,
    path: SESSION_COOKIE_OPTS.path,
    maxAge: SESSION_COOKIE_OPTS.maxAge,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
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
  return request.cookies.has(SESSION_COOKIE_NAME);
}
