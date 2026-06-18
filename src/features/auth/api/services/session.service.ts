import type { NextRequest, NextResponse } from "next/server";
import { SupabaseAuthRepository } from "../repositories/implementations/supabaseAuthRepository";
import {
  clearAllAuthCookiesOnResponse,
  getRefreshCookieFromRequest,
  getSessionCookieFromRequest,
  setRefreshCookieOnResponse,
  setSessionCookieOnResponse,
} from "../utils/session.cookies";
import { userRepository } from "@/features/users/api/repositories";

const authRepository = new SupabaseAuthRepository();

async function hasValidAccessToken(accessToken: string): Promise<boolean> {
  try {
    const decoded = await authRepository.verifyIdToken(accessToken);
    const user = await userRepository.getUserByUid(decoded.uid);
    return Boolean(user && !user.isBanned);
  } catch {
    return false;
  }
}

export async function tryRefreshSession(
  refreshToken: string,
  response: NextResponse,
): Promise<boolean> {
  try {
    const refreshedTokens = await authRepository.refreshSession(refreshToken);

    const refreshedAccessTokenIsValid = await hasValidAccessToken(
      refreshedTokens.access_token,
    );

    if (!refreshedAccessTokenIsValid) {
      clearAllAuthCookiesOnResponse(response);
      return false;
    }

    setSessionCookieOnResponse(response, refreshedTokens.access_token);
    setRefreshCookieOnResponse(response, refreshedTokens.refresh_token);

    return true;
  } catch {
    clearAllAuthCookiesOnResponse(response);
    return false;
  }
}

/**
 * Main guard for middleware/proxy.
 *
 * Rules:
 * 1. valid session cookie -> authenticated
 * 2. invalid session + valid refresh -> refresh and authenticate
 * 3. otherwise -> unauthenticated
 *
 * If response is not passed, we do not attempt refresh,
 * because we would have no place to persist new cookies.
 */
export async function isUserAuthenticated(
  request: NextRequest,
  response?: NextResponse,
): Promise<boolean> {
  const sessionCookie = getSessionCookieFromRequest(request);

  if (sessionCookie.session) {
    const accessTokenIsValid = await hasValidAccessToken(sessionCookie.value);

    if (accessTokenIsValid) {
      return true;
    }
  }

  if (!response) {
    return false;
  }

  const refreshCookie = getRefreshCookieFromRequest(request);

  if (!refreshCookie.hasRefresh) {
    clearAllAuthCookiesOnResponse(response);
    return false;
  }

  return tryRefreshSession(refreshCookie.value, response);
}
