import { AppError, createAppError } from "./AppError";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const DEFAULT_MIN_SCORE = 0.5;
const DEFAULT_TIMEOUT_MS = 3000;

type RecaptchaVerifyResponse = {
  success?: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  challenge_ts?: string;
  "error-codes"?: string[];
};

type VerifyRecaptchaOptions = {
  expectedAction: string;
  allowedHostnames?: string[];
  minScore?: number;
  timeoutMs?: number;
};

function defaultAllowedHostnames(): string[] {
  return [
    process.env.RECAPTCHA_ALLOWED_HOSTNAMES,
    process.env.NEXT_PUBLIC_SITE_HOSTNAME,
    process.env.VERCEL_URL,
    "localhost",
    "127.0.0.1",
  ]
    .flatMap((value) => value?.split(",") ?? [])
    .map((value) => value.trim())
    .filter(Boolean);
}

function assertRecaptchaResponse(
  data: RecaptchaVerifyResponse,
  options: Required<VerifyRecaptchaOptions> & {
    allowedHostnames: string[];
  },
) {
  const reasons: string[] = [];

  if (data.success !== true) reasons.push("success_not_true");
  if (typeof data.score !== "number") {
    reasons.push("score_missing_or_invalid");
  } else if (data.score < options.minScore) {
    reasons.push("score_below_minimum");
  }
  if (data.action !== options.expectedAction) reasons.push("action_mismatch");
  if (!data.hostname) {
    reasons.push("hostname_missing");
  } else if (!options.allowedHostnames.includes(data.hostname)) {
    reasons.push("hostname_not_allowed");
  }

  if (reasons.length > 0) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "reCAPTCHA verification failed.",
      data: {
        reasons,
        success: data.success,
        expectedAction: options.expectedAction,
        action: data.action,
        hostname: data.hostname,
        allowedHostnames: options.allowedHostnames,
        score: data.score,
        minScore: options.minScore,
        challengeTs: data.challenge_ts,
        errors: data["error-codes"],
      },
    });
  }
}

export async function verifyRecaptchaToken(
  token: string,
  options: VerifyRecaptchaOptions,
) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    // On localhost we often forget the key, so we throw a clear error
    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "Server misconfiguration: RECAPTCHA_SECRET_KEY missing",
    });
  }

  const resolvedOptions = {
    expectedAction: options.expectedAction,
    allowedHostnames: options.allowedHostnames ?? defaultAllowedHostnames(),
    minScore: options.minScore ?? DEFAULT_MIN_SCORE,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };

  if (!token || resolvedOptions.allowedHostnames.length === 0) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "reCAPTCHA verification failed.",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    resolvedOptions.timeoutMs,
  );

  try {
    // Google requires form-data/url-encoded, not JSON
    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append("response", token);

    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw createAppError({
        code: "EXTERNAL_SERVICE",
        message: "reCAPTCHA verifier returned a non-success response.",
        details: { status: res.status },
      });
    }

    const data = (await res.json()) as RecaptchaVerifyResponse;
    assertRecaptchaResponse(data, resolvedOptions);

    return true; // It is a human
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;

    throw createAppError({
      code: "EXTERNAL_SERVICE",
      message: "Failed to connect to the reCAPTCHA service",
      details: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}
