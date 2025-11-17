const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

export interface FirebaseRestErrorDetail {
  message: string;
  domain?: string;
  reason?: string;
}

export interface FirebaseRestErrorResponse {
  error: {
    code: number;
    message: string; // e.g. "INVALID_PASSWORD"
    errors?: FirebaseRestErrorDetail[];
  };
}

export interface FirebaseSignInSuccess {
  localId: string;
  email: string;
  displayName?: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  registered?: boolean;
}

import { createAppError } from "@/lib/ApiError";

/** mapowanie firebase -> ErrorCode */
const firebaseToAppErrorMap: Record<string, string> = {
  // auth / signInWithPassword specific
  EMAIL_NOT_FOUND: "INVALID_CREDENTIALS",
  INVALID_PASSWORD: "INVALID_CREDENTIALS",
  USER_DISABLED: "FORBIDDEN",
  TOO_MANY_ATTEMPTS_TRY_LATER: "RATE_LIMIT",
  OPERATION_NOT_ALLOWED: "FORBIDDEN",
  INVALID_EMAIL: "VALIDATION_ERROR",
  WEAK_PASSWORD: "INVALID_INPUT",
  EMAIL_EXISTS: "CONFLICT",
  // fallback handled below
};

export async function signInWithPassword(
  email: string,
  password: string
): Promise<FirebaseSignInSuccess> {
  if (!FIREBASE_API_KEY) {
    throw createAppError({
      code: "INTERNAL_ERROR",
      message:
        "Server misconfiguration: FIREBASE_API_KEY is not set in environment variables",
      status: 500,
      details: { env: "FIREBASE_API_KEY missing" },
    });
  }

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(
    FIREBASE_API_KEY
  )}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const text = await res.text();

  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    const firebaseError =
      parsed && typeof parsed === "object"
        ? (parsed as FirebaseRestErrorResponse)
        : undefined;

    const firebaseMessage = firebaseError?.error?.message;
    // map firebase message to your ErrorCode
    const mappedCode =
      (firebaseMessage && (firebaseToAppErrorMap as any)[firebaseMessage]) ??
      "INTERNAL_ERROR";

    const userMessage =
      firebaseMessage ??
      (typeof parsed === "string" && parsed.length ? parsed : res.statusText) ??
      `Request failed with status ${res.status}`;

    // Throw ApiError built by createAppError, include firebase payload in details
    throw createAppError({
      code: mappedCode as any,
      message: `Firebase Auth error: ${userMessage}`,
      status: res.status,
      details: { firebase: firebaseError },
    });
  }

  // success — zwracamy sparsowany response jako FirebaseSignInSuccess
  return parsed as FirebaseSignInSuccess;
}
