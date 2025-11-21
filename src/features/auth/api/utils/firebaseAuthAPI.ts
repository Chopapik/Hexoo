import { createAppError } from "@/lib/ApiError";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST; // e.g. "127.0.0.1:9099"

type FirebaseSignInSuccess = {
  idToken: string;
  email?: string;
  refreshToken?: string;
  expiresIn?: string;
  localId?: string;
  registered?: boolean;
  displayName?: string;
};

type FirebaseRestErrorResponse = {
  error: {
    code?: number;
    message: string;
    errors?: Array<{
      message: string;
      domain?: string;
      reason?: string;
    }>;
  };
};

const firebaseToAppErrorMap: Record<string, string> = {
  EMAIL_NOT_FOUND: "INVALID_CREDENTIALS",
  INVALID_PASSWORD: "INVALID_CREDENTIALS",
  USER_DISABLED: "FORBIDDEN",
  TOO_MANY_ATTEMPTS_TRY_LATER: "RATE_LIMIT",
  INVALID_EMAIL: "VALIDATION_ERROR",
  MISSING_PASSWORD: "VALIDATION_ERROR",
  EMAIL_EXISTS: "CONFLICT",
  OPERATION_NOT_ALLOWED: "FORBIDDEN",
  WEAK_PASSWORD: "INVALID_INPUT",
};

function firebaseTokenToClientCode(token?: string): string | undefined {
  if (!token) return undefined;
  const t = token.toLowerCase().replace(/_/g, "-");
  return `auth/${t}`;
}

function normalizeFirebaseMessage(raw?: unknown): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") {
    const token = raw.split(/[ :\n]/)[0];
    return token.toUpperCase();
  }

  if (typeof raw === "object" && raw !== null) {
    try {
      const anyObj = raw as any;
      if (anyObj.error && typeof anyObj.error.message === "string") {
        return normalizeFirebaseMessage(anyObj.error.message);
      }
      if (
        Array.isArray(anyObj.error?.errors) &&
        anyObj.error.errors[0]?.message
      ) {
        return normalizeFirebaseMessage(anyObj.error.errors[0].message);
      }
      if (anyObj.message && typeof anyObj.message === "string") {
        return normalizeFirebaseMessage(anyObj.message);
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<FirebaseSignInSuccess> {
  // W prod FIREBASE_API_KEY powinien być ustawiony. W lokalnym emulatorze akceptujemy placeholder.
  if (!FIREBASE_API_KEY && !FIREBASE_AUTH_EMULATOR_HOST) {
    throw createAppError({
      code: "INTERNAL_ERROR",
      message:
        "Server misconfiguration: FIREBASE_API_KEY is not set in environment variables",
      status: 500,
      details: { env: "FIREBASE_API_KEY missing" },
    });
  }

  const apiKey = FIREBASE_API_KEY ?? "local-dev-key";

  const base = FIREBASE_AUTH_EMULATOR_HOST
    ? `http://${FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com`
    : `https://identitytoolkit.googleapis.com`;

  const url = `${base}/v1/accounts:signInWithPassword?key=${encodeURIComponent(
    apiKey
  )}`;

  let res: Response;
  let text = "";

  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
  } catch (err) {
    throw createAppError({
      code: "NETWORK_ERROR",
      message: "Network error while contacting Firebase Auth.",
      status: 503,
      details: { cause: err },
    });
  }

  try {
    text = await res.text();
  } catch (err) {
    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "Failed to read response from Firebase Auth.",
      status: 502,
      details: { error: err },
    });
  }

  // Debug - usuń w prod
  console.debug("[auth] POST", url);
  console.debug("[auth] response text:", text);

  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  // --- Error path: non-2xx from Firebase REST
  if (!res.ok) {
    const firebaseToken =
      normalizeFirebaseMessage(parsed) ??
      normalizeFirebaseMessage((parsed as any)?.error);
    const firebaseClientCode = firebaseTokenToClientCode(firebaseToken); // e.g. "auth/invalid-password"
    const mappedAppCode =
      (firebaseToken && (firebaseToAppErrorMap as any)[firebaseToken]) ??
      "INTERNAL_ERROR";

    const humanMessage =
      firebaseClientCode ??
      (typeof parsed === "string" && parsed.length ? parsed : res.statusText) ??
      `Request failed with status ${res.status}`;

    // Throw createAppError but include both app-level code and firebase client code in details
    throw createAppError({
      code: mappedAppCode as any,
      message: `Firebase Auth error: ${humanMessage}`,
      status: res.status,
      details: {
        firebaseMessageToken: firebaseToken,
        firebaseCode: firebaseClientCode,
        firebasePayload: parsed,
        rawText: text,
      },
    });
  }

  // --- Defensive: sometimes 200 but body contains error field
  const maybeFirebaseErrorMsg =
    (parsed && typeof parsed === "object" && (parsed as any).error?.message) ||
    (parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as any).errors) &&
      (parsed as any).errors[0]?.message);

  if (maybeFirebaseErrorMsg) {
    const firebaseToken = normalizeFirebaseMessage(maybeFirebaseErrorMsg);
    const firebaseClientCode = firebaseTokenToClientCode(firebaseToken);
    const mappedAppCode =
      (firebaseToken && (firebaseToAppErrorMap as any)[firebaseToken]) ??
      "INTERNAL_ERROR";

    throw createAppError({
      code: mappedAppCode as any,
      message: `Firebase Auth error: ${
        firebaseClientCode ?? String(maybeFirebaseErrorMsg)
      }`,
      status: 200,
      details: {
        firebaseMessageToken: firebaseToken,
        firebaseCode: firebaseClientCode,
        firebasePayload: parsed,
        rawText: text,
      },
    });
  }

  // --- Success path: ensure parsed is object and contains expected fields
  if (!parsed || typeof parsed !== "object") {
    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "Unexpected Firebase Auth response format.",
      status: 502,
      details: { rawText: text },
    });
  }

  // parsed should contain idToken, localId, etc.
  return parsed as FirebaseSignInSuccess;
}
